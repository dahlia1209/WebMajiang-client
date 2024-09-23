import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { Pai } from "@/models/pai";
import { Shoupai,  Fulou, createPais } from "@/models/shoupai";
import ShoupaiView from "../Shoupai.vue";
import { useGameStore } from "@/stores/game";
import { setActivePinia, createPinia } from "pinia";

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
        
    })
})