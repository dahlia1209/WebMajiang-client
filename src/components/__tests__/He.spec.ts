import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { He, useHe } from "@/models/he";
import HeView from "../He.vue";
import { useGameStore } from "@/stores/game";
import { setActivePinia, createPinia } from "pinia";
import { Shoupai, Fulou, createPais } from "@/models/shoupai";

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
    gameStore.dapai = new Pai("m", 1);
    gameStore.action = "dapai";
    gameStore.turn = "main";
    gameStore.status = "ready";
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(1);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("m1");
    gameStore.dapai = new Pai("m", 2);
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(2);
    expect(wrapper.findAllComponents("img")[1].attributes("name")).toBe("m2");
    //次手番のダパイでは捨て牌に表示されない
    gameStore.turn = "xiajia";
    gameStore.dapai = new Pai("m", 1);
    gameStore.action = "dapai";
    gameStore.status = "ready";
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(2);

    //対面の捨て牌
    wrapper = mount(HeView, {
      props: {
        he: new He([]),
        position: "duimian",
      },
    });
    gameStore.dapai = new Pai("m", 1);
    gameStore.action = "dapai";
    gameStore.turn = "main";
    gameStore.status = "ready";
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(0);
    gameStore.dapai = new Pai("m", 2);
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(0);
    gameStore.turn = "duimian";
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(1);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("m2");
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
    gameStore.dapai = new Pai("m", 1);
    gameStore.action = "dapai";
    gameStore.turn = "main";
    gameStore.status = "ready";
    await flushPromises();
    //下家にチーされた
    gameStore.dapai = null;
    gameStore.turn = "xiajia";
    gameStore.status = "ready";
    gameStore.action = "chi";
    gameStore.fulou = new Fulou(
      "chi",
      new Pai("m", 1),
      createPais(["2m", "3m"]),
      "main"
    );
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(0);
    gameStore.fulou =null
    gameStore.turn = "main";
    gameStore.action = "dapai";
    gameStore.status = "ready";
    gameStore.dapai = new Pai("m", 2);
    await flushPromises();
    //下家で関係ないポン
    gameStore.dapai = null;
    gameStore.turn = "xiajia";
    gameStore.status = "ready";
    gameStore.action = "peng";
    gameStore.fulou = new Fulou(
      "peng",
      new Pai("m", 2),
      createPais(["2m", "2m", "2m"]),
      "duimian"
    );
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
    gameStore.dapai = new Pai("m", 1);
    gameStore.action = "dapai";
    gameStore.turn = "main";
    gameStore.status = "ready";
    await flushPromises();
    //リーチ
    gameStore.dapai = null;
    gameStore.status = "thinking";
    gameStore.action = "dapai";
    gameStore.turn = "main";
    gameStore.action = "lizhi";
    gameStore.dapai = new Pai("m", 2);
    gameStore.status = "ready";
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(2);
    expect(wrapper.findAllComponents("img")[1].classes("roated")).toBe(true);
    //下家にリーチ牌をチーされた
    gameStore.dapai = null;
    gameStore.turn = "xiajia";
    gameStore.status = "ready";
    gameStore.action = "chi";
    gameStore.fulou = new Fulou(
      "chi",
      new Pai("m", 2),
      createPais(["1m", "3m"]),
      "main"
    );
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(1);
    //次のダパイで横に曲げる
    gameStore.fulou =null
    gameStore.turn = "main";
    gameStore.action = "dapai";
    gameStore.status = "ready";
    gameStore.dapai = new Pai("m", 3);
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(2);
    expect(wrapper.findAllComponents("img")[1].classes("roated")).toBe(true);
    //次のダパイでは通常通り
    gameStore.dapai = null;
    gameStore.turn = "main";
    gameStore.action = "dapai";
    gameStore.status = "ready";
    gameStore.dapai = new Pai("m", 4);
    await flushPromises();
    expect(wrapper.findAllComponents("img").length).toBe(3);
    expect(wrapper.findAllComponents("img")[2].classes("roated")).toBe(false);
  });
});
