import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PaiView from "../Pai.vue";
import { Pai } from "@/models/pai";

describe("Pai", () => {
  it("renders properly", async () => {
    let wrapper;
    //裏牌
    wrapper = mount(PaiView, { props: { pai: new Pai("b", 1) } });
    expect(wrapper.findComponent("img").attributes().src).toContain(
      "src/assets/pai/b0.gif"
    );
    expect(wrapper.findComponent("img").attributes().name).toContain("b0");

    //萬子
    wrapper = mount(PaiView, { props: { pai: new Pai("m", 1) } });
    expect(wrapper.findComponent("img").attributes().src).toContain(
      "src/assets/pai/m1.gif"
    );
    expect(wrapper.findComponent("img").attributes().name).toContain("m1");
    //筒子
    wrapper = mount(PaiView, { props: { pai: new Pai("p", 5, true) } });
    expect(wrapper.findComponent("img").attributes().src).toContain(
      "src/assets/pai/p0.gif"
    );
    expect(wrapper.findComponent("img").attributes().name).toContain("p0");
    //索子
    wrapper = mount(PaiView, { props: { pai: new Pai("s", 9) } });
    expect(wrapper.findComponent("img").attributes().src).toContain(
      "src/assets/pai/s9.gif"
    );
    expect(wrapper.findComponent("img").attributes().name).toContain("s9");
    //字牌
    wrapper = mount(PaiView, { props: { pai: new Pai("z", 7) } });
    expect(wrapper.findComponent("img").attributes().src).toContain(
      "src/assets/pai/z7.gif"
    );
    expect(wrapper.findComponent("img").attributes().name).toContain("z7");
    //clickable
    // wrapper = mount(PaiView, { props: { pai: new Pai("z", 7, false, true) } });
    // expect(wrapper.classes('clickable')).toBe(true);
    //hidden
    // wrapper = mount(PaiView, { props: { pai: new Pai("z", 7, false, true,true) } });
    // console.log(wrapper.classes())
    // expect(wrapper.classes('clickable')).toBe(true);
    // expect(wrapper.classes('hidden')).toBe(true);
  });
});
