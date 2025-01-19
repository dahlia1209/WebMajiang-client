import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { Board, GameStatus } from "@/models/board";
import { Shoupai, Fulou, createPais } from "@/models/shoupai";
import { He } from "@/models/he";
import BoardView from "../Board.vue";
import { createTestingPinia } from "@pinia/testing";
import { useGameStore } from "@/stores/game";
import { MessageType, useWebSocketService, type WebSocketMessage, type GameMessage } from "@/services/webSocketService";
import { setActivePinia, createPinia } from "pinia";
import { Score } from "@/models/score";
import WS from "vitest-websocket-mock";

describe("Board", () => {
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    setActivePinia(createPinia());
  });
  afterEach(() => {
    WS.clean();
  });
  it("renders properly", async () => {
    const server = new WS("ws://127.0.0.1:8000/ws");
    let wrapper;
    //初期状態
    wrapper = mount(BoardView, { props: { board: new Board() } });
    await server.connected;
    expect(wrapper.findComponent(".main-he").exists()).toBe(true);
    expect(wrapper.findComponent(".main-he").findAll("img").length).toBe(0);
    expect(wrapper.findComponent(".xiajia-he").exists()).toBe(true);
    expect(wrapper.findComponent(".xiajia-he").findAll("img").length).toBe(0);
    expect(wrapper.findComponent(".duimian-he").exists()).toBe(true);
    expect(wrapper.findComponent(".duimian-he").findAll("img").length).toBe(0);
    expect(wrapper.findComponent(".shangjia-he").exists()).toBe(true);
    expect(wrapper.findComponent(".shangjia-he").findAll("img").length).toBe(0);

    expect(wrapper.findComponent(".main-shoupai").exists()).toBe(true);
    expect(wrapper.findComponent(".main-shoupai").findAll("img").length).toBe(13);
    expect(wrapper.findComponent(".main-shoupai").findAll("img")[0].attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".main-shoupai").findAll("img")[12].attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".xiajia-shoupai").exists()).toBe(true);
    expect(wrapper.findComponent(".xiajia-shoupai").findAll("img")[0].attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".xiajia-shoupai").findAll("img")[12].attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".duimian-shoupai").exists()).toBe(true);
    expect(wrapper.findComponent(".duimian-shoupai").findAll("img")[0].attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".duimian-shoupai").findAll("img")[12].attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".shangjia-shoupai").exists()).toBe(true);
    expect(wrapper.findComponent(".duimian-shoupai").findAll("img")[0].attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".duimian-shoupai").findAll("img")[12].attributes("name")).toBe("b0");

    wrapper
      .findComponent(".main-shoupai")
      .findAll("img")
      .forEach(async (c) => {
        await c.trigger("click");
      });
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").findAll("img").length).toBe(13);
    wrapper
      .findComponent(".xiajia-shoupai")
      .findAll("img")
      .forEach(async (c) => {
        await c.trigger("click");
      });
    await flushPromises();
    expect(wrapper.findComponent(".xiajia-shoupai").findAll("img").length).toBe(13);
    wrapper
      .findComponent(".duimian-shoupai")
      .findAll("img")
      .forEach(async (c) => {
        await c.trigger("click");
      });
    await flushPromises();
    expect(wrapper.findComponent(".duimian-shoupai").findAll("img").length).toBe(13);
    wrapper
      .findComponent(".shangjia-shoupai")
      .findAll("img")
      .forEach(async (c) => {
        await c.trigger("click");
      });
    await flushPromises();
    expect(wrapper.findComponent(".shangjia-shoupai").findAll("img").length).toBe(13);

    expect(wrapper.findComponent(".score").exists()).toBe(true);
    expect(wrapper.findComponent(".score").find(".baopai").findAll("img").length).toBe(5);
    expect(wrapper.findComponent(".score").findAll("img")[0].attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".score").findAll("img")[4].attributes("name")).toBe("b0");

    //全部セット
    wrapper = mount(BoardView, {
      props: {
        board: new Board(
          new GameStatus({ action: "dapai", turn: "main" }),
          new Score({ zhuangfeng: "南", menfeng: "西", baopai: [new Pai("z", 7)] }),
          [
            new Shoupai(
              createPais(["1m", "1m", "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "9m", "9m"]),
              new Pai("z", 3)
            ),
          ],
          [
            new He(createPais(["1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s"])),
            new He(createPais(["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m"])),
            new He(createPais(["1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p"])),
            new He(createPais(["1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s"])),
          ]
        ),
      },
    });

    expect(wrapper.findComponent(".main-he").exists()).toBe(true);
    expect(wrapper.findComponent(".main-he").findAll("img").length).toBe(9);
    expect(wrapper.findComponent(".main-he").findAll("img")[0].attributes("name")).toBe("s1");
    expect(wrapper.findComponent(".main-he").findAll("img")[8].attributes("name")).toBe("s9");
    expect(wrapper.findComponent(".xiajia-he").exists()).toBe(true);
    expect(wrapper.findComponent(".xiajia-he").findAll("img").length).toBe(9);
    expect(wrapper.findComponent(".xiajia-he").findAll("img")[0].attributes("name")).toBe("m1");
    expect(wrapper.findComponent(".xiajia-he").findAll("img")[8].attributes("name")).toBe("m9");
    expect(wrapper.findComponent(".duimian-he").exists()).toBe(true);
    expect(wrapper.findComponent(".duimian-he").findAll("img").length).toBe(9);
    expect(wrapper.findComponent(".duimian-he").findAll("img")[0].attributes("name")).toBe("p1");
    expect(wrapper.findComponent(".duimian-he").findAll("img")[8].attributes("name")).toBe("p9");
    expect(wrapper.findComponent(".shangjia-he").exists()).toBe(true);
    expect(wrapper.findComponent(".shangjia-he").findAll("img").length).toBe(9);
    expect(wrapper.findComponent(".shangjia-he").findAll("img")[0].attributes("name")).toBe("s1");
    expect(wrapper.findComponent(".shangjia-he").findAll("img")[8].attributes("name")).toBe("s9");
  });

  it("zimo and dapai", async () => {
    let wrapper;
    const gameStore = useGameStore();
    wrapper = mount(BoardView, {
      props: {
        board: new Board(new GameStatus(), new Score({ zhuangfeng: "南", menfeng: "西", baopai: [new Pai("z", 7)] }), [
          new Shoupai(createPais(["1m", "1m", "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "9m", "9m"])),
        ]),
      },
    });
    // 自家ツモ
    gameStore.game = new GameStatus({action: "zimo",turn: "main",zimopai: new Pai("z", 1),});
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").attributes("name")).toBe("z1");
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").classes("dapai")).toBe(false);

    //自家打牌
    await wrapper.findComponent(".main-shoupai").findComponent(".zimo").trigger("click");
    gameStore.game = new GameStatus({ action: "dapai", turn: "main",dapai:Pai.deserialize("z1"),dapaiIdx:99});
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".main-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".main-he").findAllComponents("img")[0].attributes("name")).toBe("z1");
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".duimian-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".shangjia-he").findAllComponents("img").length).toBe(0);

    //下家ツモ
    gameStore.$state.game = new GameStatus({
      action: "zimo",
      turn: "xiajia",
      // status: "thinking",
      zimopai: new Pai("b", 0),
    });
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").exists()).toBe(false);

    //下家打牌
    await flushPromises();
    await wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").trigger("click"); //クリックしても反応しないことを確認
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").classes("dapai")).toBe(false);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").exists()).toBe(false);

    gameStore.game = new GameStatus({ action: "dapai", turn: "xiajia",dapai:Pai.deserialize("z2"),dapaiIdx:0 });
    await flushPromises();
    expect(wrapper.findComponent(".xiajia-shoupai").find(".bingpai").findAll("img")[0].classes("dapai")).toBe(true);
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").exists()).toBe(true);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".main-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img")[0].attributes("name")).toBe("z2");
    expect(wrapper.findComponent(".duimian-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".shangjia-he").findAllComponents("img").length).toBe(0);

    //対面ツモ
    gameStore.$state.game = new GameStatus({
      action: "zimo",
      turn: "duimian",
      // status: "thinking",
      zimopai: new Pai("b", 0),
    });
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").exists()).toBe(false);

    //対面打牌
    await flushPromises();
    await wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").trigger("click"); //クリックしても反応しないことを確認
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").classes("dapai")).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").exists()).toBe(false);

    gameStore.game = new GameStatus({ action: "dapai", turn: "duimian",dapai:Pai.deserialize("z3"),dapaiIdx:0 });
    await flushPromises();
    expect(wrapper.findComponent(".duimian-shoupai").find(".bingpai").findAll("img")[0].classes("dapai")).toBe(true);
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").exists()).toBe(true);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".main-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".duimian-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".duimian-he").findAllComponents("img")[0].attributes("name")).toBe("z3");
    expect(wrapper.findComponent(".shangjia-he").findAllComponents("img").length).toBe(0);

    //上家ツモ
    gameStore.$state.game = new GameStatus({
      action: "zimo",
      turn: "shangjia",
      // status: "thinking",
      zimopai: new Pai("b", 0),
    });
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").attributes("name")).toBe("b0");

    //上家打牌
    gameStore.$state.game = new GameStatus({ action: "dapai", turn: "shangjia",dapai:Pai.deserialize("z4") ,dapaiIdx:0 });
    await flushPromises();
    await wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").trigger("click"); //クリックしても反応しないことを確認
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").classes("dapai")).toBe(false);

    await flushPromises();
    expect(wrapper.findComponent(".shangjia-shoupai").find(".bingpai").findAll("img")[0].classes("dapai")).toBe(true);
    expect(wrapper.findComponent(".main-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".xiajia-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".duimian-shoupai").findComponent(".zimo").exists()).toBe(false);
    expect(wrapper.findComponent(".shangjia-shoupai").findComponent(".zimo").exists()).toBe(true);
    expect(wrapper.findComponent(".main-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".duimian-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".shangjia-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".shangjia-he").findAllComponents("img")[0].attributes("name")).toBe("z4");
  });
  it("chi", async () => {
    let wrapper;
    let fulouCandidates: Fulou[];
    let fulou: Fulou;
    let shoupai:Shoupai
    let score:Score
    let board:Board
    fulouCandidates = [Fulou.deserialize("chi,m1,m2+m3,shangjia")];
    const gameStore = useGameStore();
    shoupai=new Shoupai(
      createPais(["1m", "1m", "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "9m", "9m"]),
      null,
      [],
      [],
      fulouCandidates
    ),
    score=new Score({ zhuangfeng: "東", menfeng: "南", baopai: [new Pai("z", 7)] })
    board=new Board(new GameStatus(), score, [shoupai])
    wrapper = mount(BoardView, {props: {board: board,}});

    //上家ツモ
    gameStore.game = new GameStatus({action: "zimo",turn: "shangjia",zimopai: new Pai("b", 0),});
    await flushPromises();
    expect(wrapper.findComponent(".shangjia-shoupai").find(".bingpai").findAll("img").length).toBe(14);
    //上家打牌
    gameStore.game = new GameStatus({ action: "dapai", turn: "shangjia",dapai:Pai.deserialize("m1"),dapaiIdx:99});
    await flushPromises();
    expect(wrapper.findComponent(".shangjia-shoupai").find(".bingpai").findAll("img").length).toBe(13);
    expect(wrapper.findComponent(".shangjia-shoupai").find(".zimo").exists()).toBe(false);
    console.log("chi",shoupai.getCandidatesbyType(["chi"],Pai.deserialize("m1")))
    expect(wrapper.findComponent(".main-shoupai").findAll("button").length).toBe(2);
    expect(wrapper.findComponent(".main-shoupai").findAll("button")[0].classes("hidden")).toBe(false);
    expect(wrapper.findComponent(".main-shoupai").findAll("button")[1].classes("chi")).toBe(true);

    //自家チー
    await wrapper.findComponent(".main-shoupai").findAll("button")[1].trigger("click");
    fulou = fulouCandidates[0]; 
    fulou.position = "shangjia";
    gameStore.$state.game = new GameStatus({ action: "fulou", turn: "main", fulou });
    await flushPromises();
    expect(wrapper.findComponent(".shangjia-shoupai").find(".bingpai").findAll("img").length).toBe(13);
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img").length).toBe(11);
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img")[0].attributes("name")).toBe("m1");
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img")[1].attributes("name")).toBe("m1");
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img")[2].attributes("name")).toBe("m1");
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img")[3].attributes("name")).toBe("m4");
    expect(wrapper.findComponent(".main-shoupai").find(".fulou").findAll(".mianzi").length).toBe(1);
    expect(wrapper.findComponent(".main-shoupai").findAll("button").length).toBe(0);

    //自家打牌
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img")[0].classes("clickable")).toBe(true);
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img").length).toBe(11);
    await wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img")[0].trigger("click");
    gameStore.game = new GameStatus({ action: "dapai", turn: "main",dapai:Pai.deserialize("m9"),dapaiIdx:10});
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.findComponent(".main-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".duimian-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".shangjia-he").findAllComponents("img").length).toBe(0);

    //下家チー
    gameStore.game = new GameStatus({ action: "fulou", turn: "xiajia", fulou:Fulou.deserialize("chi,m1,m2+m3,main") });
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.findComponent(".xiajia-shoupai").find(".bingpai").findAll("img").length).toBe(11);
    expect(wrapper.findComponent(".duimian-shoupai").find(".bingpai").findAll("img").length).toBe(13);
    expect(wrapper.findComponent(".shangjia-shoupai").find(".bingpai").findAll("img").length).toBe(13);
    expect(wrapper.findComponent(".xiajia-shoupai").find(".fulou").findAll(".mianzi").length).toBe(1);
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img").length).toBe(0);

    //下家打牌
    gameStore.game = new GameStatus({ action: "dapai", turn: "xiajia",dapai:new Pai("p", 1),dapaiIdx:0});
    await flushPromises();
    expect(wrapper.findComponent(".main-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".duimian-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".shangjia-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.findComponent(".xiajia-shoupai").find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.findComponent(".duimian-shoupai").find(".bingpai").findAll("img").length).toBe(13);
    expect(wrapper.findComponent(".shangjia-shoupai").find(".bingpai").findAll("img").length).toBe(13);

    //対面チー
    fulou = new Fulou("chi", new Pai("p", 1), createPais(["2p", "3p"]), "xiajia");
    gameStore.game = new GameStatus({ action: "fulou", turn: "duimian", fulou });
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.findComponent(".xiajia-shoupai").find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.findComponent(".duimian-shoupai").find(".bingpai").findAll("img").length).toBe(11);
    expect(wrapper.findComponent(".shangjia-shoupai").find(".bingpai").findAll("img").length).toBe(13);
    expect(wrapper.findComponent(".duimian-shoupai").find(".fulou").findAll(".mianzi").length).toBe(1);

    //対面打牌
    gameStore.$state.game = new GameStatus({ action: "dapai", turn: "duimian",dapai: new Pai("s", 1),dapaiIdx:0 });
    await flushPromises();
    expect(wrapper.findComponent(".main-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".duimian-he").findAllComponents("img").length).toBe(1);
    expect(wrapper.findComponent(".shangjia-he").findAllComponents("img").length).toBe(0);

    //上家チー
    fulou = new Fulou("chi", new Pai("s", 1), createPais(["2s", "3s"]), "duimian");
    gameStore.$state.game = new GameStatus({ action: "fulou", turn: "shangjia", fulou });
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.findComponent(".xiajia-shoupai").find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.findComponent(".duimian-shoupai").find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.findComponent(".shangjia-shoupai").find(".bingpai").findAll("img").length).toBe(11);
    expect(wrapper.findComponent(".shangjia-shoupai").find(".fulou").findAll(".mianzi").length).toBe(1);

    //上家打牌
    gameStore.$state.game = new GameStatus({ action: "dapai", turn: "shangjia",dapai: new Pai("z", 1),dapaiIdx:0 });
    await flushPromises();
    expect(wrapper.findComponent(".main-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".xiajia-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".duimian-he").findAllComponents("img").length).toBe(0);
    expect(wrapper.findComponent(".shangjia-he").findAllComponents("img").length).toBe(1);
  });

  it("message handler", async () => {
    let wrapper;
    const gameStore = useGameStore();
    const server = new WS("ws://127.0.0.1:8000/ws");
    wrapper = mount(BoardView, {
      props: {
        board: new Board(),
      },
    });
    await server.connected;
    expect(wrapper.findComponent(".main-shoupai").findAllComponents("img").length).toBe(13);
    expect(wrapper.findComponent(".main-shoupai").findAllComponents("img")[0].attributes("name")).toBe("b0");
    expect(wrapper.findComponent(".main-shoupai").findAllComponents("img")[12].attributes("name")).toBe("b0");
    const gma = {
      type: MessageType.Game,
      game: {
        action: "qipai",
        qipai: "m1f+m1f+m1f+m2f+m3f+m4f+m5f+m6f+m7f+m8f+m9f+m9f+m9f",
      },
    } as GameMessage;
    //開始
    server.send(JSON.stringify(gma));
    await flushPromises();
    expect(wrapper.findComponent(".main-shoupai").findAllComponents("img").length).toBe(13);
    expect(wrapper.findComponent(".main-shoupai").findAllComponents("img")[0].attributes("name")).toBe("m1");
    expect(wrapper.findComponent(".main-shoupai").findAllComponents("img")[12].attributes("name")).toBe("m9");
  });
});
