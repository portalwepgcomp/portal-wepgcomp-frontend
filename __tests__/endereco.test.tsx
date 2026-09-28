import { beforeEach, describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState, type ReactNode } from "react";

const mockUpdateEdicao = jest.fn();
const mockLocation = "<p>Instituto de Biologia da UFBA</p>";
const embedUrl =
  "https://www.google.com/maps/embed?pb=!1m18!2d-38.5084892!3d-13.0011881";
const mockEdicao: {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  mapEmbedUrl?: string | null;
} = {
  id: "edition-2026",
  name: "WEPGCOMP 2026",
  location: mockLocation,
  isActive: true,
  mapEmbedUrl: null,
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
    handleEditField: () => void | boolean;
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
            if (editing && handleEditField() === false) return;
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
    mockEdicao.mapEmbedUrl = null;
    mockUpdateEdicao.mockClear();
  });

  it("não mostra o link do mapa antes de clicar em Editar", () => {
    render(<Endereco />);

    expect(screen.queryByLabelText("Link do mapa")).not.toBeInTheDocument();
  });

  it("mostra o link do mapa após Editar e salva o embed", () => {
    render(<Endereco />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByLabelText("Link do mapa")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Link do mapa"), {
      target: { value: `<iframe src="${embedUrl}"></iframe>` },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(mockUpdateEdicao).toHaveBeenCalledWith("edition-2026", {
      location: mockLocation,
      name: "WEPGCOMP 2026",
      mapEmbedUrl: embedUrl,
    });
    expect(screen.queryByLabelText("Link do mapa")).not.toBeInTheDocument();
  });

  it("mantém a edição aberta se o link não for de incorporar", () => {
    render(<Endereco />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Link do mapa"), {
      target: {
        value:
          "https://www.google.com/maps/place/Instituto+de+Biologia+da+UFBA",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(mockUpdateEdicao).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/Incorporar um mapa/i);
    expect(screen.getByLabelText("Link do mapa")).toBeInTheDocument();
  });

  it("exibe o iframe salvo", () => {
    mockEdicao.mapEmbedUrl = embedUrl;
    render(<Endereco />);

    expect(screen.getByTitle("Mapa do Local do Evento")).toHaveAttribute(
      "src",
      embedUrl,
    );
  });
});
