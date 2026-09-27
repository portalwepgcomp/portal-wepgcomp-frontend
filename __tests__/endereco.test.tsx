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

jest.mock("@/context/AuthProvider/authProvider", () => ({
  AuthContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    useContext: () => ({
      user: { level: "Admin", name: "Admin" },
    }),
  };
});

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

  it("exibe campos de latitude e longitude para o admin", () => {
    render(<Endereco />);

    expect(screen.getByLabelText("Latitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Longitude")).toBeInTheDocument();
  });

  it("salva endereço junto com as coordenadas", () => {
    render(<Endereco />);

    fireEvent.change(screen.getByLabelText("Localização da edição"), {
      target: { value: "<p>Novo local</p>" },
    });
    fireEvent.change(screen.getByLabelText("Latitude"), {
      target: { value: "-13.0020509" },
    });
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: "-38.5098765" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar localização" }));

    expect(mockUpdateEdicao).toHaveBeenCalledWith("edition-2026", {
      location: "<p>Novo local</p>",
      name: "WEPGCOMP 2026",
      locationLatitude: -13.0020509,
      locationLongitude: -38.5098765,
    });
  });

  it("monta o embed do Google Maps com as coordenadas", () => {
    mockEdicao.locationLatitude = -13.0020509;
    mockEdicao.locationLongitude = -38.5098765;
    render(<Endereco />);

    const map = screen.getByTitle("Mapa do Local do Evento");
    const mapUrl = decodeURIComponent(map.getAttribute("src") ?? "");
    expect(mapUrl).toContain("q=-13.0020509,-38.5098765");
    expect(mapUrl).toContain("ll=-13.0020509,-38.5098765");
  });

  it("não mostra mapa sem coordenadas", () => {
    render(<Endereco />);

    expect(
      screen.getByText(/Informe latitude e longitude/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByTitle("Mapa do Local do Evento"),
    ).not.toBeInTheDocument();
  });
});
