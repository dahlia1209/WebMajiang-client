import { Server, WebSocket as MockSocket } from "mock-socket";

interface gameMessage {
  type: string;
  game: { action: string | null; fulou: string | null; dapai: string | null };
}

describe("Board", () => {
  /*Param*/
  const isAutoDapai: boolean = true;
  const initQipai: string[] | null = ["m1", "m1", "m2", "m2", "m3", "m3", "m4", "m4", "m5", "m5", "m6", "m6", "m7"];
  // prettier-ignore
  const initCanFulouList: string[] | null = [
    // "chi,m3,m1+m2,null","chi,m2,m1+m3,null","chi,m1,m2+m3,null","chi,m4,m2+m3,null","chi,m3,m2+m5,null","chi,m2,m3+m4,null",
    // "chi,m5,m3+m4,null","chi,m4,m3+m5,null","chi,m3,m4+m5,null","chi,m6,m4+m5,null","chi,m5,m4+m6,null","chi,m4,m5+m6,null","chi,m7,m5+m6,null",
    // "chi,m6,m5+m7,null","chi,m5,m6+m7,null","chi,m8,m6+m7,null","chi,m7,m6+m8,null","chi,m6,m7+m8,null","chi,m9,m7+m8,null","chi,m8,m7+m9,null",
    // "chi,m9,m7+m8,null","peng,m1,m1+m1,null","peng,m9,m9+m9,null","minggang,m1,m1+m1+m1,null","minggang,m9,m9+m9+m9,null",
    // "peng,m1,m1+m1,null","peng,m2,m2+m2,null","peng,m3,m3+m3,null","peng,m4,m4+m4,null","peng,m5,m5+m5,null","peng,m6,m6+m6,null",
  ];
  const isMockServer = false;
  /*Param*/
  let mockServer: Server | undefined;
  let mockSocket: any;
  let pais: string[] = [];
  const gameEmit = (gm: any) => mockServer?.emit("message", JSON.stringify({ type: "game", game: gm }));
  const scoreEmit = (gs: any) => mockServer?.emit("message", JSON.stringify({ type: "score", score: gs }));
  // prettier-ignore

  let fengArr = ["東", "南", "西", "北"];
  let positionArr = ["main", "xiajia", "duimian", "shangjia"];
  const jushu = Math.floor(Math.random() * 8) + 1;
  let zhuangfeng = fengArr[Math.floor((jushu - 1) / 4)];
  let menfeng = fengArr[Math.floor(Math.random() * 4)];
  function popPai(array: string[] = pais) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array.splice(randomIndex, 1)[0];
  }
  let order: string[];

  const getOrder = (menfeng: string) => {
    switch (menfeng) {
      case "東":
        return ["main", "xiajia", "duimian", "shangjia"];
      case "北":
        return ["xiajia", "duimian", "shangjia", "main"];
      case "西":
        return ["duimian", "shangjia", "main", "xiajia"];
      default:
        return ["shangjia", "main", "xiajia", "duimian"];
    }
  };

  function extractPai(target: string, arr: string[] = pais): string | undefined {
    const index = arr.indexOf(target);
    if (index === -1) {
      return undefined;
    }
    return arr.splice(index, 1)[0];
  }
  beforeEach(() => {
    // prettier-ignore
    pais=[
      "m1",  "m1",  "m1",  "m1",  "m2",  "m2",  "m2",  "m2",  "m3",  "m3",  "m3",  "m3",  "m4",  "m4",  "m4",  "m4",  "m5",  "m5",  "m5",  "m5t",  "m6","m6",  "m6",  "m6",  "m7",  "m7",  "m7",  "m7",  "m8",  "m8",  "m8",  "m8",  "m9",  "m9",  "m9",  "m9",  //萬子
      "s1","s1",  "s1",  "s1",  "s2",  "s2",  "s2",  "s2",  "s3",  "s3",  "s3",  "s3",  "s4",  "s4",  "s4",  "s4",  "s5",  "s5",  "s5",  "s5t",  "s6", "s6",  "s6",  "s6",  "s7",  "s7",  "s7",  "s7",  "s8",  "s8",  "s8",  "s8",  "s9",  "s9",  "s9",  "s9",   //索子
      "p1","p1",  "p1",  "p1",  "p2",  "p2",  "p2",  "p2",  "p3",  "p3",  "p3",  "p3",  "p4",  "p4",  "p4",  "p4",  "p5",  "p5",  "p5",  "p5t",  "p6",  "p6",  "p6",  "p6",  "p7",  "p7",  "p7",  "p7",  "p8",  "p8",  "p8",  "p8",  "p9",  "p9",  "p9",  "p9",   //筒子
      "z1","z1",  "z1",  "z1",  "z2",  "z2",  "z2",  "z2",  "z3",  "z3",  "z3",  "z3",  "z4",  "z4",  "z4",  "z4",  "z5",  "z5",  "z5",  "z5",  "z6",  "z6",  "z6",  "z6",  "z7",  "z7",  "z7",  "z7",//字牌
    ];
    const qipai = initQipai
      ? initQipai
          .map((p) => extractPai(p))
          .sort()
          .join("+")
      : Array.from({ length: 13 }, () => popPai())
          .sort()
          .join("+");
    const wangpai = Array.from({ length: 14 }, () => popPai());
    const taqipai = Array.from({ length: 13 * 3 }, () => popPai()).join("+"); //他家配牌分
    // console.log("qipaigo pais", pais);

    //配牌
    cy.visit("/", {
      onBeforeLoad(win) {
        cy.stub(win, "WebSocket")
          .as("websocket")
          .callsFake(() => {
            if (isMockServer) {
              const fakeURL = "ws://localhost:8000/ws";
              if (mockServer) {
                mockServer.stop();
              }
              mockServer = new Server(fakeURL);
              mockServer.on("connection", (socket) => {
                mockSocket = socket;
                socket.on("message", (message) => {
                  // let cnt = 0;
                  // const order = getOrder(menfeng);
                  // console.log("serveronmessage", message);
                  // const m = JSON.parse(message as string) as gameMessage;
                  // let srvMsg;
                  // if (m.game.action == "fulou") {
                  //   srvMsg = {
                  //     action: "fulou",
                  //     turn: "main",
                  //     status: "ready",
                  //     fulou: m.game.fulou,
                  //   };
                  // } else if (m.game.action == "zimo") {
                  // } else {
                  //   srvMsg = {
                  //     action: "zimo",
                  //     turn: order[cnt + (1 % 4)],
                  //     status: "thinking",
                  //     zimopai: order[cnt + (1 % 4)] == "main" ? "m1" : "b0",
                  //   };
                  //   cnt++;
                  // }
                  // console.log("pais", pais);
                  // console.log("serversendMessage", srvMsg);
                  // gameEmit(srvMsg);
                });
              });
              mockSocket = new MockSocket(fakeURL);
              return mockSocket;
            } else {
              const socketURL = "ws://127.0.0.1:8000/ws";
              if (mockServer) {
                mockServer.stop();
              }
              mockSocket = new WebSocket(socketURL);
              return mockSocket
            }
          });
      },
    });
    cy.get(".testplay").click().wait(500);

    cy.wrap({ emit: scoreEmit })
      .invoke("emit", {
        zhuangfeng: zhuangfeng,
        menfeng: menfeng,
        jushu: jushu,
        jicun: Math.floor(Math.random() * 4),
        changbang: Math.floor(Math.random() * 4),
        baopai: [wangpai[0], "b0", "b0", "b0", "b0"],
        defen: [10000, 20000, 30000, 40000],
      })
      .wait(500);
    cy.wrap({ emit: gameEmit })
      .invoke("emit", {
        action: "kaiju",
        qipai: qipai,
        canFulouList: initCanFulouList,
      })
      .wait(500);
  });

  afterEach(() => {
    if (mockServer) {
      mockSocket.close();
      mockServer.stop();
    }
  });

  it("fulou", () => {
    cy.wrap({}).then(() => {
      // console.log(pais);
      cy.pause();
    });
    cy.wrap({}).then(() => {
      // console.log(extractPai("z1"));
      cy.pause();
    });
    cy.wrap({}).then(() => {
      // console.log(pais);
      cy.pause();
    });
  });

  it("all zimopai and dapai", () => {
    //打牌ANDツモ
    const mainZimo = () => {
      const zimo = popPai();
      cy.wrap({ emit: gameEmit })
        .invoke("emit", {
          action: "zimo",
          turn: "main",
          status: "thinking",
          zimopai: zimo,
        })
        .wait(500);
    };

    const mainDapai = () => {
      cy.wrap({ emit: gameEmit }).invoke("emit", {
        action: "dapai",
        turn: "main",
        status: "thinking",
      });

      let len: number = 0;
      cy.get(".main-he").then(($ele) => {
        len = $ele.find("img").length;
      });
      if (isAutoDapai) cy.get("img.zimo.clickalble").click().wait(500);
      cy.get(".main-he")
        .then(($ele) => {
          cy.get(".main-he")
            .find("img", { timeout: 60000 })
            .its("length", { timeout: 60000 })
            .should("eq", len + 1);
        })
        .wait(500);
    };

    const mainZimoAndDapai = () => {
      mainZimo();
      mainDapai();
      return { action: null };
    };
    const taZimoAndDapai = (position: "main" | "xiajia" | "duimian" | "shangjia") => {
      let result = {
        action: null,
      } as {
        action: string | null;
      };
      cy.wrap({ emit: gameEmit })
        .invoke("emit", {
          action: "zimo",
          turn: position,
          status: "thinking",
          zimopai: "b0",
        })
        .wait(500);

      cy.wrap({ emit: gameEmit })
        .invoke("emit", {
          action: "dapai",
          turn: position,
          status: "ready",
          dapai: popPai(),
        })
        .wait(500);

      cy.get(".cancel").then(($ele) => {
        if (!$ele.hasClass("hidden")) {
          cy.get(".cancel", { timeout: 60000 })
            .should("not.be.visible")
            .then(() => {
              result.action = "fulou";
            });
        }
      });
      return result;
    };

    order = getOrder(menfeng);

    //最初のツモ
    // cy.wrap({ emit: gameEmit })
    //   .invoke("emit", {
    //     action: "zimo",
    //     turn: order[0],
    //     status: "thinking",
    //     zimopai: order[0] == "main" ? popPai() : "b0",
    //   })
    //   .wait(500);
    // mockSocket.send(JSON.stringify({ type: "game", game: { action: "mockaction" } }));
    // let cnt = 0;

    // while (pais.length > 0) {
    //   //打牌
    //   const currentTurn = order[cnt % 4];
    //   if (currentTurn == "main") {
    //     cy.wrap({ emit: gameEmit }).invoke("emit", {
    //       action: "dapai",
    //       turn: "main",
    //       status: "thinking",
    //     });

    //     let len: number = 0;
    //     cy.get(".main-he").then(($ele) => {
    //       len = $ele.find("img").length;
    //     });
    //     if (isAutoDapai) cy.get("img.zimo.clickalble").click().wait(500);
    //     cy.get(".main-he").then(($ele) => {
    //       cy.get(".main-he")
    //         .find("img", { timeout: 60000 })
    //         .its("length", { timeout: 60000 })
    //         .should("eq", len + 1);
    //     });
    //   } else {
    //     cy.wrap({ emit: gameEmit })
    //       .invoke("emit", {
    //         action: "dapai",
    //         turn: currentTurn,
    //         status: "ready",
    //         dapai: popPai(),
    //       })
    //       .wait(500);
    //   }

    //   //次のツモ確認
    //   const cls = `.${order[cnt + (1 % 4)]}-shoupai`;
    //   cy.get(cls).find(".bingpai").find(".zimo", { timeout: 60000 }).wait(500);
    //   cnt++;
    // }

    let cnt = 0;
    while (pais.length > 0) {
      const pos = order[cnt % 4];
      pos == "main" ? mainZimoAndDapai() : taZimoAndDapai(pos as "xiajia" | "duimian" | "shangjia");
      cnt++;
    }
  });

  // it("fulou", () => {
  //   //１巡目
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "main",
  //       status: "thinking",
  //       zimopai: "z1",
  //     })
  //     .wait(500);

  //   cy.wrap({ emit: gameEmit }).invoke("emit", {
  //     action: "dapai",
  //     turn: "main",
  //     status: "thinking",
  //   });

  //   cy.wrap({})
  //     .get("img.zimo.clickalble")
  //     .click()
  //     .then(() => {
  //       cy.get("img.zimo").should("be.hidden");
  //       cy.get("img.zimo").should("be.hidden");
  //     })
  //     .wait(500);

  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "peng",
  //       turn: "xiajia",
  //       status: "ready",
  //       fulou: "peng,z1f,z1f+z1f,main",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "xiajia",
  //       status: "ready",
  //       dapai: "s1",
  //     })
  //     .wait(500);

  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "chi",
  //       turn: "duimian",
  //       status: "ready",
  //       fulou: "chi,s1,s2+s3,xiajia",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "duimian",
  //       status: "ready",
  //       dapai: "p1",
  //     })
  //     .wait(500);

  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "minggang",
  //       turn: "shangjia",
  //       status: "ready",
  //       fulou: "minggang,p1,p1+p1+p1,duimian",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "shangjia",
  //       status: "thinking",
  //       zimopai: "b0",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "shangjia",
  //       status: "ready",
  //       dapai: "m7",
  //       canFulouList: ["chi,m7,m8+m9,null"],
  //     })
  //     .wait(500);
  //   cy.get("button.chi").click().wait(500);

  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "chi",
  //       turn: "main",
  //       status: "ready",
  //       fulou: "chi,m7,m8+m9,shangjia",
  //       dapai: null,
  //     })
  //     .wait(500);
  // });

  // it("kaiju", () => {
  //   cy.wait(500);
  // });

  // it("dapai and zimo", () => {
  //   //１巡目
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "main",
  //       status: "thinking",
  //       zimopai: "z1",
  //     })
  //     .wait(500);

  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "main",
  //       status: "thinking",
  //     })
  //     .wait(500);

  //   cy.get("img.zimo.clickalble").click().get("img.zimo").should("be.hidden");
  //   cy.get("@websocket").should("be.called").wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "xiajia",
  //       status: "thinking",
  //       zimopai: "b0",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "xiajia",
  //       status: "ready",
  //       dapai: "s1",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "duimian",
  //       status: "thinking",
  //       zimopai: "b0",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "duimian",
  //       status: "ready",
  //       dapai: "s1",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "shangjia",
  //       status: "thinking",
  //       zimopai: "b0",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "shangjia",
  //       status: "ready",
  //       dapai: "s1",
  //     })
  //     .wait(500);

  //   //2巡目
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "main",
  //       status: "thinking",
  //       zimopai: "s2",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "main",
  //       status: "thinking",
  //     })
  //     .wait(500);
  //   cy.get("img.zimo.clickalble").click().get("img.zimo").should("be.hidden").wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "xiajia",
  //       status: "thinking",
  //       zimopai: "b0",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "xiajia",
  //       status: "ready",
  //       dapai: "s2",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "duimian",
  //       status: "thinking",
  //       zimopai: "b0",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "duimian",
  //       status: "ready",
  //       dapai: "s2",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "zimo",
  //       turn: "shangjia",
  //       status: "thinking",
  //       zimopai: "b0",
  //     })
  //     .wait(500);
  //   cy.wrap({ emit: gameEmit })
  //     .invoke("emit", {
  //       action: "dapai",
  //       turn: "shangjia",
  //       status: "ready",
  //       dapai: "s2",
  //     })
  //     .wait(500);
  // });
});
