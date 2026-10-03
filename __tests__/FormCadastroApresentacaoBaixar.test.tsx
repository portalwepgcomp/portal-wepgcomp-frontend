import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { useForm, type Control, type FieldValues } from "react-hook-form";

import { FormCadastroApresentacao } from "@/components/Forms/CadastroApresentacao/FormCadastroApresentacao";

const baixarPdfMock = jest.fn();

let controlReal: Control<FieldValues>;

jest.mock("@/hooks/useApresentacaoPdf", () => ({
  useApresentacaoPdf: () => ({
    baixarPdf: baixarPdfMock,
    baixandoPdf: false,
  }),
}));

jest.mock(
  "@/components/Forms/CadastroApresentacao/useFormCadastroApresentacao",
  () => ({
    useFormCadastroApresentacao: () => ({
      register: () => ({}),
      control: controlReal,
      errors: {},
      onSubmit: () => {},
      user: { id: "user-1", level: "Default" },
      loadingUserList: false,
      opcoesApresentadoresSelect: [],
      advisors: [],
      nomeArquivo: "novo-slide.pdf",
      submission: { id: "sub-1", pdfFile: "slide-salvo-antigo.pdf" },
      carregandoEnvio: false,
      edicaoAtiva: true,
      aoMudarArquivo: () => {},
      aoMudarTextarea: () => {},
    }),
  }),
);

function Harness() {
  const { control } = useForm();
  controlReal = control as Control<FieldValues>;

  return <FormCadastroApresentacao />;
}

describe("FormCadastroApresentacao — Baixar atual", () => {
  it("deve baixar o arquivo salvo com o nome salvo, não com o recém-selecionado", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /Baixar atual/i }));

    expect(baixarPdfMock).toHaveBeenCalledWith(
      "sub-1",
      "slide-salvo-antigo.pdf",
    );
    expect(baixarPdfMock).not.toHaveBeenCalledWith("sub-1", "novo-slide.pdf");
  });

  it("deve continuar exibindo o nome do arquivo recém-selecionado", () => {
    render(<Harness />);

    expect(screen.getByText("novo-slide.pdf")).toBeInTheDocument();
  });
});
