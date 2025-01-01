import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { Shoupai, Fulou, createPais } from "@/models/shoupai";
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
    bingpai = createPais(["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "1p", "1p", "2p", "3p"]);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai(bingpai), position: "main" },
    });
    expect(wrapper.findAllComponents("img").length).toBe(13);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("m1");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(false);
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAllComponents("img")[12].attributes("name")).toBe("p3");
    expect(wrapper.findAllComponents("img")[12].classes("clickable")).toBe(false);
    //他人の手牌
    bingpai = createPais(["0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b"]);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai(bingpai), position: "main" },
    });
    expect(wrapper.findAllComponents("img").length).toBe(13);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("b0");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(false);
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAllComponents("img")[12].attributes("name")).toBe("b0");
    expect(wrapper.findAllComponents("img")[12].classes("clickable")).toBe(false);
  });

  it("dapai", async () => {
    const gameStore = useGameStore();
    gameStore.game.action = "zimo";
    gameStore.game.turn = "main";
    gameStore.game.zimopai = new Pai("z", 1)
    // gameStore.game.status = "thinking";

    //自分の手牌
    bingpai = createPais(["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "1p", "1p", "2p", "3p"]);
    zimopai = gameStore.game.zimopai as Pai;
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai(bingpai, zimopai), position: "main" },
    });
    //手牌選択
    expect(gameStore.mainZimoStatus).toBe(true)
    console.log(wrapper.findAllComponents("img")[0].classes());
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(true);
    await wrapper.findAllComponents("img")[0].trigger("click");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(false);
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(true);
    expect(wrapper.findAllComponents("img")[12].classes("clickable")).toBe(false);

    //他人の手牌
    bingpai = createPais(["0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b"]);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai(bingpai), position: "xiajia" },
    });
    //手牌選択
    await wrapper.findAllComponents("img")[0].trigger("click");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(false);
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(false);
  });

  it("lipai", async () => {
    const gameStore = useGameStore();
    gameStore.game.action = "zimo";
    // gameStore.game.status = "thinking";
    gameStore.game.turn = "main";
    gameStore.game.zimopai = new Pai("z", 1);
    //自分の手牌
    bingpai = createPais(["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "1p", "1p", "2p", "3p"]);
    zimopai = gameStore.game.zimopai as Pai;
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai(bingpai, zimopai), position: "main" },
    });
    //手牌選択
    await wrapper.findAllComponents("img")[0].trigger("click");
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(true);
    expect(wrapper.findAllComponents("img").length).toBe(14);
    gameStore.game.action = "zimo";
    gameStore.game.turn = "xiajia";
    await flushPromises();
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAllComponents("img").length).toBe(13);
  });
  it("fulou", async () => {
    const gameStore = useGameStore();
    let bingpai: Pai[] = createPais(["8m", "9m", "1m", "1m", "5s", "5s", "5s", "7z", "7z", "7z", "7z"]);
    let fulou: Fulou[] = [];
    let zimopai: Pai | null = null;
    let shoupai: Shoupai = new Shoupai(bingpai, zimopai, fulou);
    

    //チー
    shoupai.fulouCandidates=[Fulou.deserialize("chi,m7,m8+m9,shangjia")]
    // let fulouCandidates = [new Fulou("chi", new Pai("m", 7), createPais(["8m", "9m"]))];
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });
    // gameStore.game.fulouCandidates = fulouCandidates;
    gameStore.game.action = "dapai";
    gameStore.game.turn = "shangjia";
    // gameStore.game.status = "ready";
    gameStore.game.dapai = Pai.deseriarize("m7");
    console.log(shoupai.getCandidatesbyType(["chi"],gameStore.game.dapai as Pai))

    await flushPromises();
    expect(wrapper.find(".main-player-action").exists()).toBe(true); //ボタンエリア
    expect(wrapper.findAll("button").length).toBe(2);
    expect(wrapper.findAll("button")[0].text()).toBe("×");
    expect(wrapper.findAll("button")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAll("button")[1].text()).toBe("チー");
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(11);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(0);
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(9);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(1);

    //ポン
    shoupai.fulouCandidates=[Fulou.deserialize("peng,m1,m1+m1,null")]
    gameStore.game.action = "dapai";
    gameStore.game.turn = "duimian";
    gameStore.game.dapai = new Pai("m", 1);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });
    await flushPromises();
    console.log()
    expect(wrapper.findAll("button").length).toBe(2);
    expect(wrapper.findAll("button")[0].text()).toBe("×");
    expect(wrapper.findAll("button")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAll("button")[1].text()).toBe("ポン");
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(7);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(2);

    //明槓
    shoupai.fulouCandidates=[Fulou.deserialize("minggang,s5,s5+s5+s5,null"),Fulou.deserialize("peng,s5,s5+s5,null")]
    gameStore.game.action = "dapai";
    gameStore.game.turn = "xiajia";
    gameStore.game.dapai = new Pai("s", 5);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });
    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(3);
    expect(wrapper.findAll("button")[0].text()).toBe("×");
    expect(wrapper.findAll("button")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAll("button")[1].text()).toBe("ポン");
    expect(wrapper.findAll("button")[2].text()).toBe("カン");
    await wrapper.findAll("button")[2].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(4);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(3);

    //暗槓
    shoupai.fulouCandidates=[Fulou.deserialize("angang,null,z7+z7+z7+z7,null")]
    shoupai.zimopai=null
    gameStore.game.action = "zimo";
    gameStore.game.turn = "main";
    gameStore.game.zimopai = new Pai("s", 5);
    gameStore.game.dapai = null;
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });

    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(2);
    expect(wrapper.findAll("button")[0].text()).toBe("×");
    expect(wrapper.findAll("button")[0].classes("hidden")).toBe(true);
    expect(wrapper.findAll("button")[1].text()).toBe("カン");
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(1);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(4);

    //加槓
    shoupai=new Shoupai()
    shoupai.bingpai =["m8","m9","m1","m1","s5","s5","s5","z7","z7","z7"].map(x=> Pai.deseriarize(x))
    shoupai.fulou=[Fulou.deserialize("peng,m7,m7+m7,duimian")];
    shoupai.fulouCandidates = [Fulou.deserialize("jiagang,m7,m7+m7,null")];
    shoupai.zimopai = Pai.deseriarize("m7");
    gameStore.game.action = "zimo";
    gameStore.game.turn = "main";
    gameStore.game.zimopai = Pai.deseriarize("m7")
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });

    await flushPromises();

    expect(wrapper.find(".bingpai").findAll("img").length).toBe(11);
    expect(wrapper.findAll("button").length).toBe(2);
    expect(wrapper.findAll("button")[0].text()).toBe("×");
    expect(wrapper.findAll("button")[0].classes("hidden")).toBe(true);
    expect(wrapper.findAll("button")[1].text()).toBe("カン");
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(10);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(1);
  });
});
