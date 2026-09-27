import { beforeEach, describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

const mockUpdateEdicao = jest.fn();
const mockLocation = "<p>Auditório do Instituto de Geociências da UFBA</p>";
const mockEdicao: {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
} = {
  id: "edition-2026",
  name: "WEPGCOMP 2026",
  location: mockLocation,
  isActive: true,
  locationLatitude: null,
  locationLongitude: null,
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
  beforeEach(() => {
    mockEdicao.location = mockLocation;
    mockEdicao.locationLatitude = null;
    mockEdicao.locationLongitude = null;
    mockUpdateEdicao.mockClear();
  });

  it("exibe somente a localização cadastrada na edição", () => {
    render(<Endereco />);

    expect(screen.getByLabelText("Localização da edição")).toHaveValue(
      mockLocation,
    );
    expect(
      screen.queryByText(/Instituto de Computação/i),
    ).not.toBeInTheDocument();
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

  it("prioriza coordenadas geocodificadas para pin e centralização", () => {
    mockEdicao.location =
      "<p>1154, R. Barão de Jeremoabo, 668 - Ondina, Salvador - BA</p>";
    mockEdicao.locationLatitude = -13.0020509;
    mockEdicao.locationLongitude = -38.5098765;
    render(<Endereco />);

    const directionsLink = screen.getByRole("link", { name: /como chegar/i });
    const map = screen.getByTitle("Mapa do Local do Evento");
    const directionsUrl = decodeURIComponent(
      directionsLink.getAttribute("href") ?? "",
    );
    const mapUrl = decodeURIComponent(map.getAttribute("src") ?? "");

    expect(directionsUrl).toContain("-13.0020509,-38.5098765");
    expect(mapUrl).toContain("q=-13.0020509,-38.5098765");
    expect(mapUrl).toContain("ll=-13.0020509,-38.5098765");
    expect(mapUrl).toContain("z=17");
    expect(mapUrl).not.toContain("1154");
    expect(map).toHaveAttribute("loading", "eager");
  });

  it("usa o endereço normalizado quando ainda não há coordenadas", () => {
    mockEdicao.location =
      "<p>1154, R. Barão de Jeremoabo, 668 - Ondina, Salvador - BA, 40170-115</p>";
    render(<Endereco />);

    const mapUrl = decodeURIComponent(
      screen.getByTitle("Mapa do Local do Evento").getAttribute("src") ?? "",
    );

    expect(mapUrl).toContain("q=Rua Barão de Jeremoabo, 668");
    expect(mapUrl).not.toContain("q=1154");
  });

  it("atualiza o mapa quando a edição recebe outro endereço", () => {
    const { rerender } = render(<Endereco />);

    mockEdicao.location = "<p>Av. Exemplo, 123 &amp; Centro</p>";
    mockEdicao.locationLatitude = null;
    mockEdicao.locationLongitude = null;
    rerender(<Endereco />);

    const directionsLink = screen.getByRole("link", { name: /como chegar/i });
    const map = screen.getByTitle("Mapa do Local do Evento");

    expect(
      decodeURIComponent(directionsLink.getAttribute("href") ?? ""),
    ).toContain("Avenida Exemplo, 123 & Centro");
    expect(decodeURIComponent(map.getAttribute("src") ?? "")).toContain(
      "q=Avenida Exemplo, 123 & Centro",
    );
  });

  it("não mostra mapa nem trajeto sem endereço cadastrado", () => {
    mockEdicao.location = "";
    render(<Endereco />);

    expect(
      screen.getByText("Endereço do evento não informado."),
    ).toBeInTheDocument();
    expect(
      screen.queryByTitle("Mapa do Local do Evento"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /como chegar/i }),
    ).not.toBeInTheDocument();
  });
});
