import { beforeEach, describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState, type ReactNode } from "react";

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
  default: function HtmlEditorComponentMock({
    content,
    onChange,
    handleEditField,
    editExtras,
  }: {
    content: string;
    onChange: (value: string) => void;
    handleEditField: () => void;
    editExtras?: ReactNode;
  }) {
    const [editing, setEditing] = useState(false);
    return (
      <div>
        {!editing ? (
          <div>{content}</div>
        ) : (
          <>
            <input
              aria-label="Localização da edição"
              value={content}
              onChange={(event) => onChange(event.target.value)}
            />
            {editExtras}
          </>
        )}
        <button
          type="button"
          onClick={() => {
            if (editing) handleEditField();
            setEditing(!editing);
          }}
        >
          {editing ? "Salvar" : "Editar"}
        </button>
      </div>
    );
  },
}));

import Endereco from "@/components/Endereco/Endereco";

describe("Endereço do evento", () => {
  beforeEach(() => {
    mockEdicao.location = mockLocation;
    mockEdicao.locationLatitude = null;
    mockEdicao.locationLongitude = null;
    mockUpdateEdicao.mockClear();
  });

  it("não mostra latitude/longitude antes de clicar em Editar", () => {
    render(<Endereco />);

    expect(screen.queryByLabelText("Latitude")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Longitude")).not.toBeInTheDocument();
  });

  it("mostra latitude/longitude somente após Editar e salva junto", () => {
    render(<Endereco />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByLabelText("Latitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Longitude")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Localização da edição"), {
      target: { value: "<p>Novo local</p>" },
    });
    fireEvent.change(screen.getByLabelText("Latitude"), {
      target: { value: "-13.0020509" },
    });
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: "-38.5098765" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

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
  });
});
