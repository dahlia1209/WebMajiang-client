import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { Shoupai,  Fulou, createPais } from "@/models/shoupai";
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
    wrapper = mount(ShoupaiView, {
      props: { shoupai: new Shoupai( bingpai),position:"main", },
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
      props: { shoupai: new Shoupai( bingpai),position:"main", },
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
    gameStore.action = "dapai";
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
      props: { shoupai: new Shoupai(bingpai, zimopai),position:"main", },
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
      props: { shoupai: new Shoupai( bingpai),position:"xiajia", },
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
    gameStore.action = "dapai";
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
      props: { shoupai: new Shoupai( bingpai, zimopai),position:"main", },
    });
    //手牌選択
    await wrapper.findAllComponents("img")[0].trigger("click");
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(true);
    expect(wrapper.findAllComponents("img").length).toBe(14);
    gameStore.action = "zimo";
    gameStore.turn = "xiajia";
    await flushPromises();
    expect(wrapper.findAllComponents("img")[0].classes("hidden")).toBe(false);
    expect(wrapper.findAllComponents("img").length).toBe(13);
  });
  it("fulou", async () => {
    const gameStore = useGameStore()
    let bingpai: Pai[]=createPais(["8m","9m","1m","1m","5s","5s","5s","7z","7z","7z","7z"])
    let fulou: Fulou[]=[];
    let zimopai:Pai|null=null
    let shoupai:Shoupai=new Shoupai(bingpai,zimopai,fulou)
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai,position:"main", },
    });

    //チー
    let canFulouList = [
      new Fulou("chi", new Pai("m", 7), createPais(["8m", "9m"])),
    ];
    gameStore.canFulouList = canFulouList;
    gameStore.action="dapai"
    gameStore.turn="shangjia"
    gameStore.status="ready"
    gameStore.dapai=new Pai("m",7)
    
    await flushPromises();
    expect(wrapper.find(".main-action").exists()).toBe(true) //ボタンエリア
    expect(wrapper.findAll("button").length).toBe(2)
    expect(wrapper.findAll("button")[0].text()).toBe("×")
    expect(wrapper.findAll("button")[1].text()).toBe("チー")
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(11)
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(0)
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(9)
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(1)

    //ポン
    canFulouList = [
      new Fulou("peng", new Pai("m", 1), createPais(["1m", "1m"])),
    ];
    gameStore.canFulouList = canFulouList;
    gameStore.action="dapai"
    gameStore.turn="duimian"
    gameStore.status="ready"
    gameStore.dapai=new Pai("m",1)
    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(2)
    expect(wrapper.findAll("button")[0].text()).toBe("×")
    expect(wrapper.findAll("button")[1].text()).toBe("ポン")
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(7)
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(2)

    //明槓
    canFulouList = [
      new Fulou("minggang", new Pai("s", 5), createPais(["5s", "5s","5s",])),
    ];
    gameStore.canFulouList = canFulouList;
    gameStore.action="dapai"
    gameStore.turn="xiajia"
    gameStore.status="ready"
    gameStore.dapai=new Pai("s",5)
    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(2)
    expect(wrapper.findAll("button")[0].text()).toBe("×")
    expect(wrapper.findAll("button")[1].text()).toBe("カン")
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(4)
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(3)

    //暗槓
    canFulouList = [
      new Fulou("angang", null, createPais(["7z", "7z","7z","7z"])),
    ];
    gameStore.canFulouList = canFulouList;
    gameStore.action="dapai"
    gameStore.turn="main"
    gameStore.status="thinking"
    gameStore.dapai=null
    
    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(2)
    expect(wrapper.findAll("button")[0].text()).toBe("×")
    expect(wrapper.findAll("button")[1].text()).toBe("カン")
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(0)
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(4)


    //加槓
    bingpai=createPais(["8m","9m","1m","1m","5s","5s","5s","7z","7z","7z","7z"])
    fulou=[];
    zimopai=new Pai("m",7)
    shoupai=new Shoupai(bingpai,zimopai,fulou)
    shoupai.addFulou(new Fulou("peng",new Pai("m",7),createPais(["7m","7m"])))
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai,position:"main", },
    });
    
    canFulouList = [
      new Fulou("jiagang", new Pai("m", 7), createPais(["7m","7m","7m",])),
    ];
    gameStore.canFulouList = canFulouList;
    gameStore.action="dapai"
    gameStore.turn="main"
    gameStore.status="thinking"
    gameStore.dapai=null

    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(2)
    expect(wrapper.findAll("button")[0].text()).toBe("×")
    expect(wrapper.findAll("button")[1].text()).toBe("カン")
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(wrapper.find(".bingpai").findAll("img").length).toBe(11)
    expect(wrapper.find(".fulou").findAll(".mianzi").length).toBe(1)

    //他家
    bingpai=createPais(["8m","9m","1m","1m","5s","5s","5s","7z","7z","7z","7z"])
    fulou=[];
    zimopai=new Pai("m",7)
    shoupai=new Shoupai(bingpai,zimopai,fulou)
    shoupai.addFulou(new Fulou("peng",new Pai("m",7),createPais(["7m","7m"])))
    wrapper = mount(ShoupaiView, {
      props: { shoupai: shoupai,position:"xiajia", },
    });

    gameStore.canFulouList = canFulouList;
    gameStore.action="dapai"
    gameStore.turn="xiajia"
    gameStore.status="ready"
    gameStore.dapai=new Pai("s",5)
    await flushPromises();
    expect(wrapper.findAll("button").length).toBe(0)

  });
});
