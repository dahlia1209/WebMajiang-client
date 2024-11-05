import { Server, WebSocket } from "mock-socket";

describe("My First Test", () => {
  let mockServer: Server | undefined;
  let mockSocket: any;
  const emit = (gm: any) => mockServer?.emit("message", JSON.stringify({ type: "game", game: gm }));
  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(win) {
        cy.stub(win, "WebSocket")
          .as("websocket")
          .callsFake(() => {
            const fakeURL = "ws://localhost:8000/ws";
            if (mockServer) {
              mockServer.stop();
            }
            mockServer = new Server(fakeURL);
            mockServer.on("connection", (socket) => {
              mockSocket = socket;
            });
            mockSocket = new WebSocket(fakeURL);
            return mockSocket;
          });
      },
    });
  });

  afterEach(() => {
    if (mockServer) {
      mockSocket.close();
      mockServer.stop();
    }
  });

  it("dapai and zimo", () => {
    // 画像クリック

    cy.get("img.zimo.clickalble").click().get("img.zimo").should("be.hidden");
    cy.get("@websocket").should("be.called").wait(500);

    //１巡目
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "zimo",
        turn: "xiajia",
        status: "thinking",
        dapai: null,
        zimopai: "b0",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "dapai",
        turn: "xiajia",
        status: "ready",
        dapai: "s1",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "zimo",
        turn: "duimian",
        status: "thinking",
        dapai: null,
        zimopai: "b0",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "dapai",
        turn: "duimian",
        status: "ready",
        dapai: "s1",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "zimo",
        turn: "shangjia",
        status: "thinking",
        dapai: null,
        zimopai: "b0",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "dapai",
        turn: "shangjia",
        status: "ready",
        dapai: "s1",
      })
      .wait(500);

    //2巡目
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "zimo",
        turn: "main",
        status: "thinking",
        dapai: null,
        zimopai: "s2",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "dapai",
        turn: "main",
        status: "thinking",
      })
      .wait(500);
    cy.get("img.zimo.clickalble").click().get("img.zimo").should("be.hidden").wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "zimo",
        turn: "xiajia",
        status: "thinking",
        dapai: null,
        zimopai: "b0",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "dapai",
        turn: "xiajia",
        status: "ready",
        dapai: "s2",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "zimo",
        turn: "duimian",
        status: "thinking",
        dapai: null,
        zimopai: "b0",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "dapai",
        turn: "duimian",
        status: "ready",
        dapai: "s2",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "zimo",
        turn: "shangjia",
        status: "thinking",
        dapai: null,
        zimopai: "b0",
      })
      .wait(500);
    cy.wrap({ emit: emit })
      .invoke("emit", {
        action: "dapai",
        turn: "shangjia",
        status: "ready",
        dapai: "s2",
      })
      .wait(500);
  });
});
