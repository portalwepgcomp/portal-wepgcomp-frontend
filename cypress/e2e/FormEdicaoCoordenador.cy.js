const year = new Date().getFullYear();
const editor = {
  id: "editor",
  name: "Editor do evento",
  email: "editor@example.test",
  level: "Admin",
  profile: "Professor",
};
const admins = [
  { ...editor, id: "coord-A", name: "Coordenador A" },
  { ...editor, id: "coord-B", name: "Coordenador B" },
];
const eventB = {
  id: "event-B",
  name: "Evento B",
  description: "Descrição do evento B",
  location: "Salvador",
  roomName: [],
  startDate: `${year}-11-27T12:00:00Z`,
  endDate: `${year}-11-28T12:00:00Z`,
  submissionDeadline: `${year}-11-26T12:00:00Z`,
  presentationDuration: 20,
  presentationsPerPresentationBlock: 2,
  callForPapersText: "Submeta seu trabalho",
  isActive: true,
};
const eventA = { ...eventB, id: "event-A", name: "Evento A" };

describe("Coordenador geral do evento", () => {
  let savedBody;
  let committeeFails;
  let committeeDelay;
  let editions;
  let coordinatorIds;

  beforeEach(() => {
    savedBody = undefined;
    committeeFails = false;
    committeeDelay = 0;
    editions = { "event-A": { ...eventA }, "event-B": { ...eventB } };
    coordinatorIds = { "event-A": "coord-A", "event-B": "coord-B" };
    cy.intercept("http://localhost:3001/**", (request) => {
      const { pathname, searchParams } = new URL(request.url);
      if (request.method === "OPTIONS") {
        request.reply({ statusCode: 204 });
      } else if (pathname === "/auth/validate-token") {
        request.reply({ valid: true });
      } else if (pathname === "/users/admins") {
        request.reply(admins);
      } else if (pathname === "/event" && request.method === "GET") {
        request.reply(Object.values(editions));
      } else if (pathname === "/event/event-A") {
        request.reply(editions["event-A"]);
      } else if (pathname === "/event/event-B") {
        request.reply(editions["event-B"]);
      } else if (pathname.startsWith("/committee-member")) {
        const id = searchParams.get("eventEditionId");
        request.alias = "committee";
        request.reply({
          statusCode: committeeFails ? 500 : 200,
          delay: committeeDelay,
          body: committeeFails
            ? { message: "Falha de teste" }
            : [
                {
                  id: `member-${id}`,
                  eventEditionId: id,
                  userId: coordinatorIds[id],
                  userName:
                    coordinatorIds[id] === "coord-A"
                      ? "Coordenador A"
                      : "Coordenador B",
                  level: "Coordinator",
                  role: "OrganizingCommittee",
                },
              ],
        });
      } else if (
        pathname.includes("/update-from-event-edition-form/") ||
        pathname.endsWith("/create-from-event-edition-form")
      ) {
        savedBody = request.body;
        request.alias = "saveEvent";
        const id = pathname.includes("/update-from-event-edition-form/")
          ? pathname.split("/").pop()
          : "new-event";
        coordinatorIds[id] = request.body.coordinatorId;
        editions[id] = { ...eventB, ...request.body, id };
        request.reply(editions[id]);
      } else {
        request.reply([]);
      }
    });
  });

  function visit(path) {
    cy.visit(path, {
      onBeforeLoad(window) {
        window.localStorage.setItem("@Auth:token", "local-test-token");
        window.localStorage.setItem("@Auth:user", JSON.stringify(editor));
        window.localStorage.setItem("edicaoAtiva", JSON.stringify(eventA));
      },
    });
  }

  function save() {
    cy.contains("button", /^Salvar$/)
      .should("be.enabled")
      .click();
    cy.wait("@saveEvent");
    cy.then(() => expect(savedBody.coordinatorId).not.to.equal(editor.id));
  }

  it("preserva o coordenador atual ao salvar outros campos", () => {
    visit("/edicoes/event-B/editar");
    cy.get("#coordenador-select").should("contain", "Coordenador B");
    cy.get("#nomeEvento").clear().type("Evento B atualizado");
    save();
    cy.then(() => {
      expect(savedBody.coordinatorId).to.equal("coord-B");
      expect(savedBody.name).to.equal("Evento B atualizado");
    });
  });

  it("envia o coordenador escolhido explicitamente na edição", () => {
    visit("/edicoes/event-B/editar");
    cy.get("#coordenador-input")
      .should("be.enabled")
      .type("Coordenador A{enter}");
    cy.get("#coordenador-select").should("contain", "Coordenador A");
    save();
    cy.then(() => expect(savedBody.coordinatorId).to.equal("coord-A"));
    cy.location("pathname").should("equal", "/edicoes");
    visit("/edicoes/event-B/editar");
    cy.get("#coordenador-select").should("contain", "Coordenador A");
    cy.get("#descricao").clear().type("Descrição alterada após a troca");
    save();
    cy.then(() => expect(savedBody.coordinatorId).to.equal("coord-A"));
  });

  it("limpa o coordenador de A ao navegar para a edição de B", () => {
    visit("/edicoes/event-A/editar");
    cy.get("#coordenador-select").should("contain", "Coordenador A");
    cy.then(() => {
      committeeDelay = 800;
    });
    cy.contains("button", "Voltar para Edições").click();
    cy.contains("h5", "Evento B")
      .parent()
      .parent()
      .within(() => {
        cy.get('button[aria-label="Editar"]').click();
      });
    cy.contains("Carregando comissão do evento").should("be.visible");
    cy.get("#coordenador-select").should("not.contain", "Coordenador A");
    cy.contains("button", /^Salvar$/).should("be.disabled");
    cy.get("#coordenador-select").should("contain", "Coordenador B");
    save();
    cy.then(() => expect(savedBody.coordinatorId).to.equal("coord-B"));
  });

  it("bloqueia durante a consulta e permite tentar novamente após erro", () => {
    committeeFails = true;
    committeeDelay = 800;
    visit("/edicoes/event-B/editar");
    cy.contains("Carregando comissão do evento").should("be.visible");
    cy.get("#coordenador-input").should("be.disabled");
    cy.contains("button", /^Salvar$/).should("be.disabled");
    cy.contains("Não foi possível carregar a comissão do evento", {
      timeout: 15000,
    }).should("be.visible");
    cy.contains("button", /^Salvar$/).should("be.disabled");
    cy.then(() => {
      committeeFails = false;
    });
    cy.contains("button", "Tentar novamente").click();
    cy.get("#coordenador-select").should("contain", "Coordenador B");
    save();
    cy.then(() => expect(savedBody.coordinatorId).to.equal("coord-B"));
  });

  it("exige seleção na criação e envia o ID escolhido", () => {
    visit("/cadastro-edicao");
    cy.get("#nomeEvento").type("Novo evento");
    cy.get("#descricao").type("Descrição do novo evento");
    cy.get("#local").type("Salvador");
    cy.get("#quantidadeSessão").clear().type("2");
    cy.get("#sessao").clear().type("20");
    cy.get("#submissao").type("Submeta seu trabalho");
    [
      ["#ed-inicio-data", "015"],
      ["#ed-final-data", "020"],
      ["#ed-deadline-data", "010"],
    ].forEach(([input, day]) => {
      cy.get(input).click();
      cy.get(
        `.react-datepicker__day--${day}:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled)`,
      ).click();
    });
    cy.contains("button", /^Salvar$/).should("be.disabled");
    cy.get("#coordenador-input").type("Coordenador B{enter}");
    save();
    cy.then(() => expect(savedBody.coordinatorId).to.equal("coord-B"));
  });
});
