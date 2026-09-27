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

jest.mock("next/dynamic", () => () => {
  const MockMapa = ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => (
    <div
      data-testid="mapa-evento"
      data-latitude={latitude}
      data-longitude={longitude}
    />
  );
  return MockMapa;
});

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

  it("renderiza o mapa Leaflet com as coordenadas cadastradas", () => {
    mockEdicao.locationLatitude = -13.0020509;
    mockEdicao.locationLongitude = -38.5098765;
    render(<Endereco />);

    const mapa = screen.getByTestId("mapa-evento");
    expect(mapa).toHaveAttribute("data-latitude", "-13.0020509");
    expect(mapa).toHaveAttribute("data-longitude", "-38.5098765");

    const directionsLink = screen.getByRole("link", { name: /como chegar/i });
    expect(directionsLink.getAttribute("href")).toContain(
      "destination=-13.0020509%2C-38.5098765",
    );
  });

  it("não mostra mapa nem trajeto sem coordenadas cadastradas", () => {
    render(<Endereco />);

    expect(
      screen.getByText(/Informe latitude e longitude/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("mapa-evento")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /como chegar/i }),
    ).not.toBeInTheDocument();
  });
});
