import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import Endereco from "@/components/Endereco/Endereco";

const expectedLocation = "Instituto de Geociências da UFBA";
const expectedAddress =
  "R. Barão de Jeremoabo, s/n — Ondina, Salvador - BA, 40170-290";
const expectedMapsQuery = `${expectedLocation} - UFBA - ${expectedAddress}`;

describe("Endereço do evento", () => {
  it("exibe somente a localização do Instituto de Geociências", () => {
    render(<Endereco />);

    expect(screen.getByText(expectedLocation)).toBeInTheDocument();
    expect(screen.getByText(expectedAddress)).toBeInTheDocument();
    expect(
      screen.queryByText(/Instituto de Computação/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Pavilhão de Aulas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Av\. Milton Santos/i)).not.toBeInTheDocument();
  });

  it("usa a mesma localização no mapa e no link Como chegar", () => {
    render(<Endereco />);

    const directionsLink = screen.getByRole("link", { name: /como chegar/i });
    const map = screen.getByTitle("Mapa do Local do Evento");

    const directionsUrl = decodeURIComponent(
      directionsLink.getAttribute("href") ?? "",
    );
    const mapUrl = decodeURIComponent(map.getAttribute("src") ?? "");

    expect(directionsUrl).toContain(expectedMapsQuery);
    expect(mapUrl).toContain(expectedMapsQuery);
    expect(map).toHaveAttribute(
      "src",
      expect.stringMatching(/^https:\/\/www\.google\.com\/maps\/embed\?/),
    );
    expect(map).toHaveAttribute("src", expect.stringContaining("hl=pt-BR"));
    expect(map).toHaveAttribute("loading", "eager");
    expect(directionsLink).toHaveAttribute("target", "_blank");
    expect(directionsLink).toHaveAttribute(
      "rel",
      expect.stringContaining("noopener"),
    );
  });
});
