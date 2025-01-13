import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { He, useHe } from "@/models/he";
import HeView from "../He.vue";
import { useGameStore } from "@/stores/game";
import { setActivePinia, createPinia } from "pinia";
import { Shoupai, Fulou, createPais } from "@/models/shoupai";
import { Board, GameStatus } from "@/models/board";

describe("He", () => {
  let wrapper;
  let he;
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    setActivePinia(createPinia());
  });
  it("renders properly", async () => {
    wrapper = mount(HeView, {
      props: {
        he: new He(
          createPais([
            "1m",
            "2m",
            "3m",
            "4m",
            "5m",
            "6m",
            "7m",
            "8m",
            "9m",
            "1s",
            "2s",
            "3s",
            "4s",
            "5s",
            "6s",
            "7s",
            "8s",
            "9s",
          ])
        ),
        position: "main",
      },
    });
    expect(wrapper.findAllComponents("img").length).toBe(18);
  });
  it("dapai", async () => {
    const gameStore = useGameStore();
    //自分の捨て牌
    wrapper = mount(HeView, {
      props: {
        he: new He([]),
        position: "main",
      },
    });
    gameStore.game=new GameStatus({ action: "dapai", turn: "main",dapai:new Pai("m", 1),dapaiIdx:0});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(1);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("m1");
    await flushPromises();
    gameStore.game=new GameStatus({ action: "zimo", turn: "main",zimopai:new Pai("m", 2)});
    await flushPromises();
    gameStore.game=new GameStatus({ action: "dapai", turn: "main",dapai:new Pai("m", 2),dapaiIdx:99});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(2);
    expect(wrapper.findAllComponents("img")[1].attributes("name")).toBe("m2");
    //次手番のダパイでは捨て牌に表示されない
    gameStore.game=new GameStatus({ action: "dapai", turn: "xiajia",dapai:new Pai("m", 1),dapaiIdx:99});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(2);

    //対面の捨て牌
    wrapper = mount(HeView, {
      props: {
        he: new He([]),
        position: "duimian",
      },
    });
    gameStore.game=new GameStatus({ action: "dapai", turn: "main",dapai:new Pai("m", 1),dapaiIdx:99});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(0);
    gameStore.game=new GameStatus({ action: "zimo", turn: "main",zimopai:new Pai("m", 2)});
    await flushPromises();
    gameStore.game=new GameStatus({ action: "dapai", turn: "main",dapai:new Pai("m", 2),dapaiIdx:99});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(0);
    gameStore.game=new GameStatus({ action: "zimo", turn: "duimian",zimopai:new Pai("m", 3)});
    await flushPromises();
    gameStore.game=new GameStatus({ action: "dapai", turn: "duimian",dapai:new Pai("m", 3),dapaiIdx:99});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(1);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("m3");
  });
  it("fulou", async () => {
    const gameStore = useGameStore();
    //自分の捨て牌
    wrapper = mount(HeView, {
      props: {
        he: new He([]),
        position: "main",
      },
    });
    gameStore.game=new GameStatus({ action: "dapai", turn: "main",dapai:new Pai("m", 1),dapaiIdx:0});
    await flushPromises();
    //下家にチーされた
    gameStore.game=new GameStatus({ action: "fulou", turn: "xiajia",fulou:Fulou.deserialize("chi,m1,m2+m3,main")});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(0);
    gameStore.game=new GameStatus({ action: "dapai", turn: "xiajia",dapai:new Pai("m", 2),dapaiIdx:0});
    await flushPromises();
    //対面チー
    gameStore.game=new GameStatus({ action: "fulou", turn: "duimian",fulou:Fulou.deserialize("chi,m2,m3+m4,xiajia")});
    expect(wrapper.findAllComponents("img").length).toBe(0);
    gameStore.game=new GameStatus({ action: "dapai", turn: "duimian",dapai:new Pai("m", 3),dapaiIdx:0});
    await flushPromises();
    gameStore.game=new GameStatus({ action: "fulou", turn: "main",fulou:Fulou.deserialize("peng,m3,m3+m3,dumian")});
    await flushPromises();
    gameStore.game=new GameStatus({ action: "dapai", turn: "main",dapai:new Pai("m", 4),dapaiIdx:0});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(1);

    
  });
  it("lizhi", async () => {
    const gameStore = useGameStore();
    //自分の捨て牌
    wrapper = mount(HeView, {
      props: {
        he: new He([]),
        position: "main",
      },
    });
    gameStore.game=new GameStatus({ action: "dapai", turn: "main",dapai:new Pai("m", 1),dapaiIdx:0});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(1);
    console.log(wrapper.findAllComponents("img")[0].html())
    //リーチ
    gameStore.game=new GameStatus();
    await flushPromises();
    gameStore.game=new GameStatus({ action: "lizhi", turn: "main",dapai:new Pai("m", 2),dapaiIdx:0});
    await flushPromises();
    console.log(wrapper.findAllComponents("img")[0].html())
    expect(wrapper.findAllComponents("img").length).toBe(2);
    expect(wrapper.findAllComponents("img")[1].classes("roated")).toBe(true);
    //下家にリーチ牌をチーされた
    gameStore.game.dapai = null;
    gameStore.game.turn = "xiajia";
    // gameStore.game.status = "ready";
    gameStore.game.action = "fulou";
    gameStore.game.fulou = new Fulou(
      "chi",
      new Pai("m", 2),
      createPais(["1m", "3m"]),
      "main"
    );
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(1);
    //次のダパイで横に曲げる
    gameStore.game.fulou =null
    gameStore.game.turn = "main";
    gameStore.game.action = "dapai";
    // gameStore.game.status = "ready";
    gameStore.game.dapai = new Pai("m", 3);
    gameStore.game=new GameStatus({ action: "dapai", turn: "main",dapai:new Pai("m", 3),dapaiIdx:0});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(2);
    expect(wrapper.findAllComponents("img")[1].classes("roated")).toBe(true);
    gameStore.game=new GameStatus({ action: "zimo", turn: "main",zimopai:new Pai("m", 4)});
    await flushPromises();
    //次のダパイでは通常通り
    gameStore.game=new GameStatus({ action: "dapai", turn: "main",dapai:new Pai("m", 4),dapaiIdx:99});
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(3);
    expect(wrapper.findAllComponents("img")[2].classes("roated")).toBe(false);
  });
});
