import { describe, expect, it } from "@jest/globals";
import { unwrapPaginatedList, PaginatedResponse } from "@/types/api";

describe("Helper unwrapPaginatedList (api.ts)", () => {
  it("deve desembrulhar resposta paginada por envelope", () => {
    const envelope: PaginatedResponse<{ id: string; name: string }> = {
      items: [
        { id: "1", name: "Trabalho 1" },
        { id: "2", name: "Trabalho 2" },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
    };

    const result = unwrapPaginatedList(envelope);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Trabalho 1");
  });

  it("deve retornar o próprio array se a resposta for um array direto", () => {
    const array = [{ id: "1" }, { id: "2" }];
    expect(unwrapPaginatedList(array)).toEqual(array);
  });

  it("deve retornar array vazio se receber nulo ou indefinido", () => {
    expect(unwrapPaginatedList(null)).toEqual([]);
    expect(unwrapPaginatedList(undefined)).toEqual([]);
  });
});
