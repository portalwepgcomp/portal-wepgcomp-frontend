const orientadorAtual = "33333333-3333-4333-8333-333333333333";
const outroOrientador = "44444444-4444-4444-8444-444444444444";
const sessaoProposta = "11111111-1111-4111-8111-111111111111";
const sessaoAlocada = "22222222-2222-4222-8222-222222222222";
const professores = [
  { id: orientadorAtual, name: "Orientador vinculado" },
  { id: outroOrientador, name: "Novo orientador" },
];
const usuario = {
  id: "autor-1",
  name: "Autor de teste",
  level: "Default",
  profile: "Presenter",
};
const edicao = {
  id: "edition-1",
  name: "WEPGCOMP 2026",
  year: "2026",
  startDate: "2026-11-18T13:00:00Z",
  endDate: "2026-11-19T20:00:00Z",
  isActive: true,
};
const sessoes = [sessaoProposta, sessaoAlocada].map((id) => ({
  id,
  title: id === sessaoProposta ? "Sessão proposta" : "Sessão alocada",
  eventEditionId: edicao.id,
  type: "Presentation",
  startTime: "2026-11-18T13:00:00Z",
  availableSubmissionSlots: 1,
  availablePositionsWithInBlock: [],
}));

function preparar({
  alocada = false,
  assincrono = false,
  atualizarLista = false,
  cadastro = false,
} = {}) {
  const submissao = {
    id: "sub-1",
    title: "Trabalho de teste",
    abstract: "Resumo do trabalho submetido",
    mainAuthorId: usuario.id,
    mainAuthor: usuario,
    advisorId: orientadorAtual,
    advisor: professores[0],
    coAdvisor: "",
    pdfFile: "slide-salvo.pdf",
    phoneNumber: "71991234567",
    status: "Confirmed",
    eventEditionId: edicao.id,
    proposedPresentationBlockId: sessaoProposta,
    presentationId: alocada ? "presentation-1" : null,
    block: alocada ? { id: sessaoAlocada } : null,
  };
  let liberarProfessores;
  const resposta = new Cypress.Promise((resolve) => {
    liberarProfessores = resolve;
  });
  let consultas = 0;

  cy.intercept("GET", "**/auth/validate-token", { statusCode: 200, body: {} });
  cy.intercept("GET", "**/event", [edicao]);
  cy.intercept("GET", "**/event/year/*", edicao);
  cy.intercept("GET", "**/event-editions/active", edicao);
  cy.intercept("GET", "**/users/advisors", (req) => {
    consultas += 1;
    if (assincrono || (atualizarLista && consultas > 1)) {
      return resposta.then(() => req.reply([...professores].reverse()));
    }
    req.reply(professores);
  }).as("professores");
  cy.intercept("GET", "**/submission?*", [submissao]);
  cy.intercept("GET", "**/presentation-block/event-edition/*", sessoes).as(
    "sessoes",
  );
  cy.intercept("PATCH", "**/submission/sub-1", (req) => {
    req.reply({ ...submissao, ...req.body });
  }).as("salvar");

  cy.visit(assincrono ? "/minha-apresentacao" : "/cadastro-apresentacao", {
    onBeforeLoad(win) {
      win.localStorage.setItem("@Auth:user", JSON.stringify(usuario));
      win.localStorage.setItem("@Auth:token", "token-de-teste");
      win.localStorage.setItem("edicaoAtiva", JSON.stringify(edicao));
      win.document.cookie = "session_eventEditionId=edition-1; Path=/";
    },
  });

  if (!assincrono) {
    cy.wait("@professores");
    cy.wait("@sessoes");
    cy.get("#orientador-select").find("option").should("have.length", 3);
    if (cadastro) return;
    cy.contains("button", "Voltar para Minha Apresentação").click();
  }
  cy.get('button[aria-label="Editar"]', { timeout: 15000 }).click();
  cy.get("#titulo").should("have.value", submissao.title);

  if (assincrono) {
    cy.get(`#orientador-select option[value="${orientadorAtual}"]`).should(
      "not.exist",
    );
    cy.then(() => liberarProfessores());
    cy.wait("@professores");
  }

  cy.get("#orientador-select").should("have.value", orientadorAtual);
  cy.get(`#orientador-select option[value="${orientadorAtual}"]`).should(
    "be.selected",
  );
  return liberarProfessores;
}

function salvar(orientadorEsperado) {
  cy.get("#orientador-select").should("have.value", orientadorEsperado);
  cy.contains("button", "Salvar Alterações").click();
  cy.wait("@salvar").then(({ request, response }) => {
    expect(request.body.advisorId).to.eq(orientadorEsperado);
    expect(request.body.title).to.eq("Título alterado");
    expect(response.statusCode).to.eq(200);
  });
}

describe("Issue #93: orientador pré-selecionado ao editar trabalho", () => {
  for (const alocada of [false, true]) {
    for (const assincrono of [false, true]) {
      it(`exibe e envia o professor vinculado: ${alocada ? "alocação" : "reserva"} com lista ${assincrono ? "assíncrona" : "em cache"}`, () => {
        preparar({ alocada, assincrono });
        cy.get("#titulo").clear().type("Título alterado");
        if (assincrono && !alocada && Cypress.env("capturarOrientador")) {
          cy.get("#orientador-select")
            .parent()
            .screenshot("issue-93-orientador-vinculado", { overwrite: true });
        }
        salvar(orientadorAtual);
      });
    }
  }

  it("preserva a troca manual do orientador e o título enquanto a lista é atualizada", () => {
    const liberarProfessores = preparar({ atualizarLista: true });
    cy.get("#orientador-select").select(outroOrientador);
    cy.get("#titulo").clear().type("Título alterado");
    cy.then(() => liberarProfessores());
    cy.wait("@professores");
    cy.get("#orientador-select").should("have.value", outroOrientador);
    cy.get("#titulo").should("have.value", "Título alterado");
    if (Cypress.env("capturarOrientador")) {
      cy.get("#orientador-select")
        .parent()
        .screenshot("issue-93-novo-orientador", { overwrite: true });
    }
    salvar(outroOrientador);
  });

  it("mantém o placeholder no cadastro de um novo trabalho após carregar os professores", () => {
    preparar({ cadastro: true });
    cy.get("#orientador-select").should("have.value", "");
  });
});
