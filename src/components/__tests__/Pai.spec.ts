import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Pai from "../Pai.vue";

describe("Pai", () => {
  it("renders properly",async  () => {
    let wrapper;
    //萬子
    wrapper = mount(Pai, { props: { suit: "b", num: 1 } });
    expect(wrapper.findComponent('img').attributes().src).toContain("src/assets/pai/b0.gif");
    expect(wrapper.findComponent('img').attributes().name).toContain("b0");
    //萬子
    wrapper = mount(Pai, { props: { suit: "m", num: 1 } });
    expect(wrapper.findComponent('img').attributes().src).toContain("src/assets/pai/m1.gif");
    expect(wrapper.findComponent('img').attributes().name).toContain("m1");
    // await wrapper.find(buttonSelector).trigger('click')
    //筒子
    wrapper = mount(Pai, { props: { suit: "p", num: 5,isRed: true } });
    expect(wrapper.html()).toContain("src/assets/pai/p0.gif");
    //索子
    wrapper = mount(Pai, { props: { suit: "s", num: 9} });
    expect(wrapper.html()).toContain("src/assets/pai/s9.gif");
    //字牌
    wrapper = mount(Pai, { props: { suit: "z", num: 7} });
    expect(wrapper.html()).toContain("src/assets/pai/z7.gif");
  });
});
