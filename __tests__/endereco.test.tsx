import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

const mockUpdateEdicao = jest.fn();
const mockLocation = "<p>Auditório do Instituto de Geociências da UFBA</p>";
const mockEdicao = {
  id: "edition-2026",
  name: "WEPGCOMP 2026",
  location: mockLocation,
  isActive: true,
};

jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({
    Edicao: mockEdicao,
    updateEdicao: mockUpdateEdicao,
  }),
}));

jest.mock("@/context/AuthProvider/util", () => ({
  getEventEditionIdStorage: () => "edition-2026",
}));

jest.mock("@/components/HtmlEditorComponent/HtmlEditorComponent", () => ({
  __esModule: true,
  default: ({
    content,
    onChange,
    handleEditField,
  }: {
    content: string;
    onChange: (value: string) => void;
    handleEditField: () => void;
  }) => (
    <div>
      <input
        aria-label="Localização da edição"
        value={content}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="button" onClick={handleEditField}>
        Salvar localização
      </button>
    </div>
  ),
}));

import Endereco from "@/components/Endereco/Endereco";

describe("Endereço do evento", () => {
  it("exibe somente a localização cadastrada na edição", () => {
    render(<Endereco />);

    expect(screen.getByLabelText("Localização da edição")).toHaveValue(
      mockLocation,
    );
    expect(
      screen.queryByText(/Instituto de Computação/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Pavilhão de Aulas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Av\. Milton Santos/i)).not.toBeInTheDocument();
  });

  it("salva a localização alterada na edição ativa", () => {
    render(<Endereco />);

    const newLocation = "<p>Novo local cadastrado</p>";
    fireEvent.change(screen.getByLabelText("Localização da edição"), {
      target: { value: newLocation },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar localização" }));

    expect(mockUpdateEdicao).toHaveBeenCalledWith("edition-2026", {
      location: newLocation,
      name: "WEPGCOMP 2026",
    });
  });

  it("exibe o mapa limpo e mantém o link Como chegar", () => {
    render(<Endereco />);

    const directionsLink = screen.getByRole("link", { name: /como chegar/i });
    const map = screen.getByTitle("Mapa do Local do Evento");
    const directionsUrl = decodeURIComponent(
      directionsLink.getAttribute("href") ?? "",
    );
    const mapUrl = decodeURIComponent(map.getAttribute("src") ?? "");

    expect(directionsUrl).toContain("-12.9980929,-38.5072076");
    expect(directionsUrl).toContain("hl=pt-BR");
    expect(mapUrl).toContain("google.com/maps/embed");
    expect(mapUrl).toContain("-12.9980929,-38.5072076");
    expect(map).toHaveAttribute("loading", "eager");
    expect(directionsLink).toHaveAttribute("target", "_blank");
    expect(directionsLink).toHaveAttribute(
      "rel",
      expect.stringContaining("noopener"),
    );
  });
});
