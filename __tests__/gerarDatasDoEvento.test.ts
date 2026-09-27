import { describe, expect, it } from "@jest/globals";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { gerarDatasDoEvento } from "@/utils/formatDate";

dayjs.extend(utc);

describe("Helper gerarDatasDoEvento (formatDate.ts)", () => {
  it("deve gerar apenas os dias do evento quando o fim é 23:59 do último dia", () => {
    const inicio = dayjs(new Date(2026, 10, 18)).toISOString();
    const fim = dayjs(new Date(2026, 10, 19))
      .set("hour", 23)
      .set("minute", 59)
      .toISOString();

    expect(gerarDatasDoEvento(inicio, fim)).toEqual([
      "2026-11-18",
      "2026-11-19",
    ]);
  });

  it("não deve criar um dia extra a partir do deslocamento de UTC", () => {
    const inicio = "2026-11-18T03:00:00.000Z";
    const fim = "2026-11-20T02:59:00.000Z";

    expect(dayjs.utc(fim).format("YYYY-MM-DD")).toBe("2026-11-20");
    expect(gerarDatasDoEvento(inicio, fim)).toEqual([
      "2026-11-18",
      "2026-11-19",
    ]);
  });

  it("deve incluir as duas pontas em um evento de dia único", () => {
    const dia = dayjs(new Date(2026, 10, 18)).toISOString();
    const fim = dayjs(new Date(2026, 10, 18))
      .set("hour", 23)
      .set("minute", 59)
      .toISOString();

    expect(gerarDatasDoEvento(dia, fim)).toEqual(["2026-11-18"]);
  });

  it("deve gerar a sequência completa em eventos de vários dias", () => {
    const inicio = dayjs(new Date(2026, 10, 18)).toISOString();
    const fim = dayjs(new Date(2026, 10, 22)).toISOString();

    expect(gerarDatasDoEvento(inicio, fim)).toEqual([
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
    ]);
  });

  it("deve atravessar a virada de mês", () => {
    const inicio = dayjs(new Date(2026, 10, 29)).toISOString();
    const fim = dayjs(new Date(2026, 11, 1)).toISOString();

    expect(gerarDatasDoEvento(inicio, fim)).toEqual([
      "2026-11-29",
      "2026-11-30",
      "2026-12-01",
    ]);
  });

  it("deve retornar vazio quando alguma data falta", () => {
    expect(gerarDatasDoEvento(undefined, undefined)).toEqual([]);
    expect(gerarDatasDoEvento("2026-11-18", undefined)).toEqual([]);
    expect(gerarDatasDoEvento(undefined, "2026-11-19")).toEqual([]);
  });

  it("deve retornar vazio em vez de travar quando a data é inválida", () => {
    expect(gerarDatasDoEvento("não é data", "2026-11-19")).toEqual([]);
    expect(gerarDatasDoEvento("2026-11-18", "não é data")).toEqual([]);
  });

  it("deve retornar vazio quando o fim é anterior ao início", () => {
    const inicio = dayjs(new Date(2026, 10, 19)).toISOString();
    const fim = dayjs(new Date(2026, 10, 18)).toISOString();

    expect(gerarDatasDoEvento(inicio, fim)).toEqual([]);
  });
});
