import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { Shoupai, type Fulou, createPais } from "@/models/shoupai";
import ShoupaiView from "../Shoupai.vue";
import { createTestingPinia } from "@pinia/testing";
import { useGameStore } from "@/stores/game";
import { setActivePinia, createPinia } from "pinia";

describe("Shoupai", () => {
  let wrapper;
  let shoupai;
  let bingpai: Pai[];
  let fulou: Fulou[];
  let zimopai;
  let waiting_hule_pai;
  let waiting_fulou_pai;
  let id;
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    setActivePinia(createPinia());
  });
  it("renders properly", async () => {
    const gameStore = useGameStore();
    //自分の手牌
    bingpai = createPais([
      "1mfff",
      "2mfff",
      "3mfff",
      "4mfff",
      "5mfff",
      "6mfff",
      "7mfff",
      "8mfff",
      "9mfff",
      "1pfff",
      "1pfff",
      "2pfff",
      "3pfff",
    ]);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai("main", bingpai) },
    });
    expect(wrapper.findAllComponents("img").length).toBe(13);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("m1");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(
      false
    );
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAllComponents("img")[12].attributes("name")).toBe("p3");
    expect(wrapper.findAllComponents("img")[12].classes("clickable")).toBe(
      false
    );
    //他人の手牌
    bingpai = createPais([
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
    ]);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai("main", bingpai) },
    });
    expect(wrapper.findAllComponents("img").length).toBe(13);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("b0");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(
      false
    );
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAllComponents("img")[12].attributes("name")).toBe("b0");
    expect(wrapper.findAllComponents("img")[12].classes("clickable")).toBe(
      false
    );
  });

  it("dapai", async () => {
    const gameStore = useGameStore();
    gameStore.action = "打牌";
    gameStore.status = "thinking";
    gameStore.turn = "main";

    //自分の手牌
    bingpai = createPais([
      "1m",
      "2m",
      "3m",
      "4m",
      "5m",
      "6m",
      "7m",
      "8m",
      "9m",
      "1p",
      "1p",
      "2p",
      "3p",
    ]);
    zimopai = new Pai("z", 1);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai("main", bingpai, zimopai) },
    });
    //手牌選択
    await wrapper.findAllComponents("img")[0].trigger("click");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(
      false
    );
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(true);
    expect(wrapper.findAllComponents("img")[12].classes("clickable")).toBe(
      false
    );

    //他人の手牌
    bingpai = createPais([
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
      "0b",
    ]);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai("xiajia", bingpai) },
    });
    //手牌選択
    await wrapper.findAllComponents("img")[0].trigger("click");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(
      false
    );
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(false);
  });

  it("lipai", async () => {
    const gameStore = useGameStore();
    gameStore.action = "打牌";
    gameStore.status = "thinking";
    gameStore.turn = "main";
    //自分の手牌
    bingpai = createPais([
      "1m",
      "2m",
      "3m",
      "4m",
      "5m",
      "6m",
      "7m",
      "8m",
      "9m",
      "1p",
      "1p",
      "2p",
      "3p",
    ]);
    zimopai = new Pai("z", 1);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai("main", bingpai, zimopai) },
    });
    //手牌選択
    await wrapper.findAllComponents("img")[0].trigger("click");
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(true);
    expect(wrapper.findAllComponents("img").length).toBe(14);
    gameStore.action = "ツモ";
    gameStore.turn = "shangjia";
    await flushPromises();
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAllComponents("img").length).toBe(13);
  });
  it("")
});
