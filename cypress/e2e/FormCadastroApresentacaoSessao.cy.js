const sessaoProposta = "11111111-1111-4111-8111-111111111111";
const sessaoAlocada = "22222222-2222-4222-8222-222222222222";
const outraSessao = "44444444-4444-4444-8444-444444444444";
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
const sessoes = [sessaoProposta, sessaoAlocada, outraSessao].map((id, i) => ({
  id,
  title: `Sessão ${i + 1}`,
  eventEditionId: edicao.id,
  type: "Presentation",
  startTime: "2026-11-18T13:00:00Z",
  availableSubmissionSlots: id === outraSessao ? 1 : 0,
  availablePositionsWithInBlock: [],
}));

function preparar(alocada, assincrono) {
  const submissao = {
    id: "sub-1",
    title: "Trabalho de teste",
    abstract: "Resumo do trabalho submetido",
    mainAuthorId: usuario.id,
    mainAuthor: usuario,
    advisorId: "33333333-3333-4333-8333-333333333333",
    advisor: { name: "Orientador de teste" },
    coAdvisor: "",
    pdfFile: "slide-salvo.pdf",
    phoneNumber: "71991234567",
    status: "Confirmed",
    eventEditionId: edicao.id,
    proposedPresentationBlockId: sessaoProposta,
    presentationId: alocada ? "presentation-1" : null,
    block: alocada ? { id: sessaoAlocada } : null,
  };
  const sessaoEsperada = alocada ? sessaoAlocada : sessaoProposta;
  let liberarSessoes;
  const resposta = new Cypress.Promise((resolve) => {
    liberarSessoes = resolve;
  });
  let primeiraConsulta = true;

  cy.intercept("GET", "**/auth/validate-token", { statusCode: 200, body: {} });
  cy.intercept("GET", "**/event", [edicao]);
  cy.intercept("GET", "**/event/year/*", edicao);
  cy.intercept("GET", "**/event-editions/active", edicao);
  cy.intercept("GET", "**/users/advisors", [
    { id: submissao.advisorId, name: "Orientador de teste" },
  ]);
  cy.intercept("GET", "**/submission?*", [submissao]);
  cy.intercept("GET", "**/presentation-block/event-edition/*", (req) => {
    if (assincrono && primeiraConsulta) {
      primeiraConsulta = false;
      return resposta.then(() => req.reply(sessoes));
    }
    req.reply(sessoes);
  }).as("sessoes");
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
    cy.wait("@sessoes");
    cy.get("#sessao-select").find("option").should("have.length", 2);
    cy.contains("button", "Voltar para Minha Apresentação").click();
  }
  cy.get('button[aria-label="Editar"]').click();
  cy.get("#titulo").should("have.value", submissao.title);

  if (assincrono) {
    cy.get("#sessao-select").should("be.disabled");
    cy.then(() => liberarSessoes());
    cy.wait("@sessoes");
  }

  cy.get("#sessao-select")
    .should("be.enabled")
    .and("have.value", sessaoEsperada);
  cy.get(`#sessao-select option[value="${sessaoEsperada}"]`)
    .should("be.selected")
    .and("contain.text", "sessão atual, sem novas vagas");
  if (assincrono && Cypress.env("capturarSessao")) {
    cy.get("#sessao-select")
      .parent()
      .screenshot(
        alocada ? "issue-92-sessao-alocada" : "issue-92-sessao-reservada",
        {
          overwrite: true,
        },
      );
  }
  return sessaoEsperada;
}

describe("Issue #92: sessão pré-selecionada ao editar trabalho", () => {
  for (const alocada of [false, true]) {
    for (const assincrono of [false, true]) {
      it(`${alocada ? "alocação" : "reserva"} própria lotada com opções ${assincrono ? "assíncronas" : "em cache"}`, () => {
        const sessaoEsperada = preparar(alocada, assincrono);
        cy.contains("button", "Salvar Alterações").click();
        cy.wait("@salvar").then(({ request, response }) => {
          expect(request.body.proposedPresentationBlockId).to.eq(
            sessaoEsperada,
          );
          expect(response.statusCode).to.eq(200);
        });
      });
    }
  }

  it("mantém uma nova escolha após atualizar as opções e envia o ID exibido", () => {
    preparar(true, true);
    cy.get("#sessao-select").select(outraSessao);
    cy.contains("button", "Salvar Alterações").click();
    cy.wait("@salvar")
      .its("request.body.proposedPresentationBlockId")
      .should("eq", outraSessao);
  });
});
