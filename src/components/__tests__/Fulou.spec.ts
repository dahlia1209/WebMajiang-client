import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { Shoupai, Fulou, createPais } from "@/models/shoupai";
// import ShoupaiView from "../Shoupai.vue";
import FulouView from "../Fulou.vue";
import { useGameStore } from "@/stores/game";
import { setActivePinia, createPinia } from "pinia";

describe("Fulou", () => {
  let wrapper;
  let fulou: Fulou;
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    setActivePinia(createPinia());
  });
  it("propery render", async () => {
    // const gameStore = useGameStore();
    //ポン:下家
    fulou= new Fulou("peng", new Pai("m", 1), createPais(["1m", "1m"]),"xiajia"),
    wrapper = mount(FulouView, {
      props: { fulou: fulou,position:"main" },
    });
    expect(wrapper.findAll("img").length).toBe(3);
    wrapper.findAll("img").forEach(e=>expect(e.attributes("name")).toBe("m1"))
    expect(wrapper.findAll("img")[0].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[1].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[2].classes("rotated")).toBe(true)
    //ポン:対面
    fulou= new Fulou("peng", new Pai("s", 1), createPais(["1s", "1s"]),"duimian"),
    wrapper = mount(FulouView, {
      props: { fulou: fulou ,position:"main"},
    });
    expect(wrapper.findAll("img").length).toBe(3);
    wrapper.findAll("img").forEach(e=>expect(e.attributes("name")).toBe("s1"))
    expect(wrapper.findAll("img")[0].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[1].classes("rotated")).toBe(true)
    expect(wrapper.findAll("img")[2].classes("rotated")).toBe(false)
    //ポン:上家
    fulou= new Fulou("peng", new Pai("p", 1), createPais(["1p", "1p"]),"shangjia"),
    wrapper = mount(FulouView, {
      props: { fulou: fulou ,position:"main"},
    });
    expect(wrapper.findAll("img").length).toBe(3);
    wrapper.findAll("img").forEach(e=>expect(e.attributes("name")).toBe("p1"))
    expect(wrapper.findAll("img")[0].classes("rotated")).toBe(true)
    expect(wrapper.findAll("img")[1].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[2].classes("rotated")).toBe(false)
    //カン:下家
    fulou= new Fulou("minggang", new Pai("m", 1), createPais(["1m", "1m", "1m"]),"xiajia"),
    wrapper = mount(FulouView, {
      props: { fulou: fulou,position:"main" },
    });
    expect(wrapper.findAll("img").length).toBe(4);
    wrapper.findAll("img").forEach(e=>expect(e.attributes("name")).toBe("m1"))
    expect(wrapper.findAll("img")[0].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[1].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[2].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[3].classes("rotated")).toBe(true)
    //カン:対面
    fulou= new Fulou("minggang", new Pai("s", 1), createPais(["1s", "1s", "1s"]),"duimian"),
    wrapper = mount(FulouView, {
      props: { fulou: fulou ,position:"main"},
    });
    expect(wrapper.findAll("img").length).toBe(4);
    wrapper.findAll("img").forEach(e=>expect(e.attributes("name")).toBe("s1"))
    expect(wrapper.findAll("img")[0].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[1].classes("rotated")).toBe(true)
    expect(wrapper.findAll("img")[2].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[3].classes("rotated")).toBe(false)
    //カン:上家
    fulou= new Fulou("minggang", new Pai("p", 1), createPais(["1p", "1p", "1p"]),"shangjia"),
    wrapper = mount(FulouView, {
      props: { fulou: fulou ,position:"main"},
    });
    expect(wrapper.findAll("img").length).toBe(4);
    wrapper.findAll("img").forEach(e=>expect(e.attributes("name")).toBe("p1"))
    expect(wrapper.findAll("img")[0].classes("rotated")).toBe(true)
    expect(wrapper.findAll("img")[1].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[2].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[3].classes("rotated")).toBe(false)
    //チー:上家
    fulou= new Fulou("chi", new Pai("p", 2), createPais(["1p", "3p"]),"shangjia"),
    wrapper = mount(FulouView, {
      props: { fulou: fulou,position:"main" },
    });
    expect(wrapper.findAll("img").length).toBe(3);
    expect(wrapper.findAll("img")[0].attributes("name")).toBe("p2")
    expect(wrapper.findAll("img")[1].attributes("name")).toBe("p1")
    expect(wrapper.findAll("img")[2].attributes("name")).toBe("p3")
    expect(wrapper.findAll("img")[0].classes("rotated")).toBe(true)
    expect(wrapper.findAll("img")[1].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[2].classes("rotated")).toBe(false)
    //暗カン
    fulou= new Fulou("angang", null, createPais(["1p", "1p", "1p", "1p"])),
    wrapper = mount(FulouView, {
      props: { fulou: fulou ,position:"main" },
    });
    expect(wrapper.findAll("img").length).toBe(4);
    wrapper.findAll("img").forEach(e=>expect(e.attributes("name")).toBe("p1"))
    expect(wrapper.findAll("img")[0].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[1].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[2].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[3].classes("rotated")).toBe(false)
    //加槓
    fulou= new Fulou("jiagang", new Pai("p",1), createPais([ "1p", "1p", "1p"]),"duimian"),
    wrapper = mount(FulouView, {
      props: { fulou: fulou ,position:"main"  },
    });
    expect(wrapper.findAll("img").length).toBe(4);
    wrapper.findAll("img").forEach(e=>expect(e.attributes("name")).toBe("p1"))
    expect(wrapper.findAll("img")[0].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[1].classes("rotated")).toBe(true)
    expect(wrapper.findAll("img")[2].classes("rotated")).toBe(false)
    expect(wrapper.findAll("img")[3].classes("rotated")).toBe(false)
    
  });
});
