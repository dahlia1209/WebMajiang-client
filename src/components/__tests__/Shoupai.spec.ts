import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { Shoupai, Fulou, createPais } from "@/models/shoupai";
import ShoupaiView from "../Shoupai.vue";
import { createTestingPinia } from "@pinia/testing";
import { useGameStore } from "@/stores/game";
import { setActivePinia, createPinia } from "pinia";
import { GameContent, GameContentFormat } from "@/models/websocket";

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
    expect(wrapper.findAllComponents("img")[0].classes("dapai")).toBe(false);
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
    expect(wrapper.findAllComponents("img")[0].classes("dapai")).toBe(false);
    expect(wrapper.findAllComponents("img")[12].attributes("name")).toBe("b0");
    expect(wrapper.findAllComponents("img")[12].classes("clickable")).toBe(false);
  });

  it("dapai", async () => {
    const gameStore = useGameStore();
    //自分の手牌
    bingpai = createPais(["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "1p", "1p", "2p", "3p"]);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai(bingpai), position: "main" },
    });
    gameStore.game=GameContentFormat.create({ action: "zimo", turn: "main",zimopai:new Pai("z", 1)});
    await flushPromises();
    //手牌選択
    console.log(wrapper.findAllComponents("img")[0].classes());
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(true);
    await wrapper.findAllComponents("img")[0].trigger("click");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(false);
    gameStore.game=GameContentFormat.create({ action: "dapai", turn: "main",dapai:Pai.deserialize("m1"),dapaiIdx:0});
    await flushPromises();
    expect(wrapper.findAllComponents("img")[0].classes("dapai")).toBe(true);
    expect(wrapper.findAllComponents("img")[12].classes("clickable")).toBe(false);

    //他人の手牌
    bingpai = createPais(["0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b"]);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai(bingpai), position: "xiajia" },
    });
    gameStore.game=GameContentFormat.create({ action: "zimo", turn: "xiajia",zimopai:Pai.deserialize("b0")});
    //手牌選択
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(false);
    await wrapper.findAllComponents("img")[0].trigger("click");
    expect(wrapper.findAllComponents("img")[0].classes("clickable")).toBe(false);
  });

  it("lipai", async () => {
    const gameStore = useGameStore();
    //自分の手牌
    bingpai = createPais(["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "1p", "1p", "2p", "3p"]);
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai(bingpai), position: "main" },
    });
    gameStore.game=GameContentFormat.create({ action: "zimo", turn: "main",zimopai:new Pai("z", 1)});
    await flushPromises();
    //手牌選択
    expect(wrapper.findAllComponents("img")[0].classes("dapai")).toBe(false);
    await wrapper.findAllComponents("img")[0].trigger("click");
    gameStore.game=GameContentFormat.create({ action: "dapai", turn: "main",dapai:Pai.deserialize("m1"),dapaiIdx:0});
    await flushPromises();
    expect(wrapper.findAllComponents("img")[0].classes("dapai")).toBe(true);
    expect(wrapper.findAllComponents("img").length).toBe(13);
    gameStore.game=GameContentFormat.create({ action: "dapai", turn: "main",dapai:new Pai("z", 1),dapaiIdx:99});
    await flushPromises();
    gameStore.game=GameContentFormat.create({ action: "zimo", turn: "xiajia",zimopai:new Pai("z", 1)});
    await flushPromises();
    expect(wrapper.findAllComponents("img")[0].classes("dapai")).toBe(false);
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
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });
    gameStore.game=GameContentFormat.create({ action: "dapai", turn: "shangjia",dapai:new Pai("m", 7),dapaiIdx:0});
    // console.log("shoupai.getCandidatesbyType",shoupai.getCandidatesbyType(["chi"],gameStore.game.dapai as Pai))
    
    await flushPromises();
    expect(wrapper.find(".main-player-action").exists()).toBe(true); //ボタンエリア
    expect(wrapper.findAll("button").length).toBe(2);
    expect(wrapper.findAll("button")[0].text()).toBe("チー");
    expect(wrapper.findAll("button")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAll("button")[1].text()).toBe("×");
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(11);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(0);
    await wrapper.findAll("button")[1].trigger("click");
    gameStore.game=GameContentFormat.create({ action: "fulou", turn: "main", fulou: shoupai.fulouCandidates[0]});
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(9);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(1);
    wrapper.unmount()

    //ポン
    shoupai = new Shoupai()
    shoupai.bingpai=["m1","m1","s5","s6"].map(x=>Pai.deserialize(x))
    shoupai.fulouCandidates=[Fulou.deserialize("peng,m1,m1+m1,null")]
    console.log("shoupai.fulouCandidates",shoupai.fulouCandidates)
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });
    gameStore.game=GameContentFormat.create({ action: "dapai", turn: "duimian",dapai:new Pai("m", 1),dapaiIdx:0});
    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(2);
    expect(wrapper.findAll("button")[0].text()).toBe("ポン");
    expect(wrapper.findAll("button")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAll("button")[1].text()).toBe("×");
    await wrapper.findAll("button")[1].trigger("click");
    gameStore.game=GameContentFormat.create({ action: "fulou", turn: "main", fulou: shoupai.fulouCandidates[0]});
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(2);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(1);
    wrapper.unmount()

    //明槓
    shoupai = new Shoupai()
    shoupai.bingpai=["s5","s5","s5","s6"].map(x=>Pai.deserialize(x))
    shoupai.fulouCandidates=[Fulou.deserialize("minggang,s5,s5+s5+s5,null"),Fulou.deserialize("peng,s5,s5+s5,null")]
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });
    gameStore.game=GameContentFormat.create({ action: "dapai", turn: "xiajia",dapai:new Pai("s", 5),dapaiIdx:0});
    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(3);
    expect(wrapper.findAll("button")[0].text()).toBe("ポン");
    expect(wrapper.findAll("button")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAll("button")[1].text()).toBe("カン");
    expect(wrapper.findAll("button")[2].text()).toBe("×");
    await wrapper.findAll("button")[2].trigger("click");
    gameStore.game=GameContentFormat.create({ action: "fulou", turn: "main", fulou: shoupai.fulouCandidates[0]});
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(1);
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(1);
    wrapper.unmount()

    //暗槓
    shoupai = new Shoupai()
    shoupai.bingpai=["z5","z7","z7","z7"].map(x=>Pai.deserialize(x))
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });
    
    gameStore.game=GameContentFormat.create({ action: "zimo", turn: "main",zimopai:new Pai("z", 7),fulouCandidates:[Fulou.deserialize("angang,null,z7+z7+z7+z7,null")]});
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(5);
    expect(wrapper.find(".zimo").exists()).toBe(true);
    expect(wrapper.findAll("button").length).toBe(1);
    expect(wrapper.findAll("button")[0].text()).toBe("暗カン");
    await wrapper.findAll("button")[0].trigger("click");
    await flushPromises();
    // expect(wrapper.find(".bingpai").findAll("img").length).toBe(1);
    // expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(1);

    //加槓
    // shoupai=new Shoupai()
    // shoupai.bingpai =["m8","m9","m1","m1","s5","s5","s5","z7","z7","z7"].map(x=> Pai.deserialize(x))
    // shoupai.fulou=[Fulou.deserialize("peng,m7,m7+m7,duimian")];
    // shoupai.fulouCandidates = [Fulou.deserialize("jiagang,m7,m7+m7,null")];
    // shoupai.zimopai = Pai.deserialize("m7");
    // gameStore.game=new GameStatus({ action: "zimo", turn: "main",zimopai:Pai.deserialize("m7")});
    // wrapper = mount(ShoupaiView, {
    //   props: { shoupai: shoupai, position: "main" },
    // });
    // await flushPromises();

    // expect(wrapper.find(".bingpai").findAll("img").length).toBe(11);
    // expect(wrapper.findAll("button").length).toBe(2);
    // expect(wrapper.findAll("button")[0].text()).toBe("×");
    // expect(wrapper.findAll("button")[0].classes("hidden")).toBe(true);
    // expect(wrapper.findAll("button")[1].text()).toBe("カン");
    // await wrapper.findAll("button")[1].trigger("click");
    // await flushPromises();
    // expect(wrapper.find(".bingpai").findAll("img").length).toBe(10);
    // expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(1);
  });
  it("tingpaibuqing", async () => {
    const gameStore = useGameStore();
    // let bingpai: Pai[] = createPais(["8m", "9m", "1m", "1m", "5s", "5s", "5s", "7z", "7z", "7z", "7z"]);
    let bingpai: Pai[] = ["m1", "m1", "m1", "m3", "m4", "m5", "p2", "p3", "p4", "p7", "p7","s5","s6"].map(x=>Pai.deserialize(x));
    let fulou: Fulou[] = [];
    let zimopai: Pai | null = null;
    let shoupai: Shoupai = new Shoupai(bingpai, zimopai, fulou);

    //フリテン
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai, position: "main" },
    });
    gameStore.game=GameContentFormat.create({ action: "dapai", turn: "shangjia",dapai:new Pai("s", 7),dapaiIdx:0,hule:["s4","s7","b0"].map(x=>Pai.deserialize(x))});
    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(2);
    expect(wrapper.findAll("button")[0].text()).toBe("ロン");
    expect(wrapper.findAll("button")[1].text()).toBe("×");
    await wrapper.findAll("button")[0].trigger("click");
    expect(wrapper.find(".tingpaibuqing-message").text()).toBe("フリテンです");
    await wrapper.findAll("button")[1].trigger("click");
    expect(wrapper.find(".tingpaibuqing-message").text()).toBe("");
  })
});
