import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { Score, useScore } from "@/models/score";
import OverviewView from "../Score.vue";
import { useGameStore } from "@/stores/game";
import { setActivePinia, createPinia } from "pinia";
import { Shoupai, Fulou, createPais } from "@/models/shoupai";

describe("Overview", () => {
  let wrapper;
  let overview;
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    setActivePinia(createPinia());
  });

  it("renders properly", async () => {
    wrapper = mount(OverviewView, {props:{score:new Score()}})
    expect(wrapper.classes("overview")).toBe(true);
    expect(wrapper.find('[class="baopai"]').findAllComponents("img").length).toBe(5);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("b0");
    expect(wrapper.findAllComponents("img")[4].attributes("name")).toBe("b0");
    expect(wrapper.find('[class="jushu"]').text()).toBe("東1局");
    expect(wrapper.find('[class="changbang"]').text()).toBe(":0");
    expect(wrapper.find('[class="jicun"]').text()).toBe(":0");
    expect(wrapper.find('[class="shangjia"]').text()).toBe("北:25000");
    expect(wrapper.find('[class="duimian"]').text()).toBe("西:25000");
    expect(wrapper.find('[class="main"]').text()).toBe("東:25000");
    expect(wrapper.find('[class="xiajia"]').text()).toBe("南:25000");
  })

  it("overview update", async () => {
    const gameStore = useGameStore();
    wrapper = mount(OverviewView, {props:{score:new Score()}})

    //カンドラ
    gameStore.score.baopai=createPais(["1m","2p","3s","4z","5z"])
    await flushPromises();
    expect(wrapper.find('[class="baopai"]').findAllComponents("img").length).toBe(5);
    expect(wrapper.findAllComponents("img")[0].attributes("name")).toBe("m1");
    expect(wrapper.findAllComponents("img")[4].attributes("name")).toBe("z5");
    
    //局数
    gameStore.score.jushu=8
    await flushPromises();
    expect(wrapper.find('[class="jushu"]').text()).toBe("南4局");

    //積み棒
    gameStore.score.changbang=1
    await flushPromises();
    expect(wrapper.find('[class="changbang"]').text()).toBe(":1");

    //供託
    gameStore.score.jicun=2
    await flushPromises();
    expect(wrapper.find('[class="jicun"]').text()).toBe(":2");

    //得点
    gameStore.score.defen=[10000,20000,30000,40000]
    await flushPromises();
    expect(wrapper.find('[class="shangjia"]').text()).toBe("北:40000");
    expect(wrapper.find('[class="duimian"]').text()).toBe("西:30000");
    expect(wrapper.find('[class="main"]').text()).toBe("東:10000");
    expect(wrapper.find('[class="xiajia"]').text()).toBe("南:20000");

    //自風
    gameStore.score.menfeng="南"
    await flushPromises();
    expect(wrapper.find('[class="shangjia"]').text()).toBe("東:40000");
    expect(wrapper.find('[class="duimian"]').text()).toBe("北:30000");
    expect(wrapper.find('[class="main"]').text()).toBe("南:10000");
    expect(wrapper.find('[class="xiajia"]').text()).toBe("西:20000");
  })
});
