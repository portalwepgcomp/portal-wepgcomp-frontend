import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import Realizacao from "@/components/Realizacao/Realizacao";

const logos = [
  { name: "Computação UFBA", href: "https://computacao.ufba.br/" },
  { name: "UFBA", href: "https://ufba.br/" },
  { name: "CAPES", href: "https://www.gov.br/capes/pt-br" },
  { name: "PROEXT", href: "https://proext.ufba.br/" },
] as const;

describe("Realização", () => {
  it.each(logos)(
    "direciona o logo da $name para o site correto",
    ({ name, href }) => {
      render(<Realizacao />);

      const link = screen.getByRole("link", {
        name: `Visitar site da ${name} (abre em nova aba)`,
      });

      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    },
  );
});
