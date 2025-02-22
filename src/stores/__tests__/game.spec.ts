import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "../game";
import { setActivePinia, createPinia } from "pinia";
import { Pai } from "@/models/pai";
import {  Fulou, createPais } from "@/models/shoupai";

describe("useGameStore", () => {
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    setActivePinia(createPinia());
  });
  it("useGameStore init", () => {
    const gameStore = useGameStore();
    expect(gameStore.game.action).toBe(undefined);
    expect(gameStore.game.dapai).toBe(undefined);
    // expect(gameStore.game.status).toBe(null);
    expect(gameStore.game.turn).toBe(undefined);
    // expect(gameStore.game.canFulouList).toStrictEqual([]);
    gameStore.game.action = "zimo";
    const zimo = new Pai("m", 1);
    gameStore.game.dapai = zimo;
    // gameStore.game.status = "ready";
    gameStore.game.turn = "shangjia";
    const fulouCandidates = [
      new Fulou("chi", new Pai("m", 3), createPais(["1m", "2m"])),
      new Fulou("chi", new Pai("s", 3), createPais(["1s", "2s"])),
    ];

    // gameStore.game.canFulouList = fulouCandidates;
    expect(gameStore.game.action).toBe("zimo");
    expect(gameStore.game.dapai).toStrictEqual(zimo);
    // expect(gameStore.game.status).toBe("ready");
    expect(gameStore.game.turn).toBe("shangjia");
    // expect(gameStore.game.canFulouList).toStrictEqual(fulouCandidates);
  });
  it("useGameStore getter", () => {
    const gameStore = useGameStore();
    //dapai判定
    gameStore.game.action = "zimo";
    gameStore.game.turn = "main";
    gameStore.game.zimopai = new Pai("b",0);

    //リー牌判定
    gameStore.game.action = "zimo";
    gameStore.game.turn = "shangjia";
    gameStore.game.action = "dapai";

    //暗槓判定
    // gameStore.game.action = "dapai";
    // gameStore.game.turn = "main";
    // gameStore.game.canFulouList = [
    //   new Fulou("angang", null, createPais(["1m", "1m", "1m", "1m"])),
    // ];
    // expect(gameStore.canAnGang).toBe(1);
    // gameStore.game.canFulouList = [];
    // expect(gameStore.canAnGang).toBe(0);

    //加槓判定
    // gameStore.game.action = "dapai";
    // gameStore.game.turn = "main";
    // gameStore.game.canFulouList = [
    //   new Fulou("jiagang", new Pai("m", 1), createPais(["1m", "1m", "1m"])),
    // ];
    // expect(gameStore.canAnGang).toBe(1);
    // gameStore.game.canFulouList = [];
    // expect(gameStore.canAnGang).toBe(0);

    //明槓判定
    // gameStore.game.action = "dapai";
    // gameStore.game.turn = "xiajia";
    // gameStore.game.canFulouList = [
    //   new Fulou("minggang", new Pai("m", 1), createPais(["1m", "1m", "1m"])),
    // ];
    // gameStore.game.dapai = new Pai("m", 1);
    // expect(gameStore.canMingGang).toBe(true);
    // gameStore.game.canFulouList = [];
    // expect(gameStore.canMingGang).toBe(false);

    //ポン判定
    // gameStore.game.action = "dapai";
    // gameStore.game.turn = "duimian";
    // gameStore.game.canFulouList = [
    //   new Fulou("peng", new Pai("m", 1), createPais(["1m", "1m"])),
    // ];
    // gameStore.game.dapai = new Pai("m", 1);
    // expect(gameStore.canPeng).toBe(true);
    // gameStore.game.canFulouList = [];
    // expect(gameStore.canPeng).toBe(false);
    
    //チー判定
    // gameStore.game.action = "dapai";
    // gameStore.game.turn = "shangjia";
    // gameStore.game.canFulouList = [
    //   new Fulou("chi", new Pai("m", 4), createPais(["2m", "3m"])),

    // ];
    // gameStore.game.dapai = new Pai("m", 4);
    // expect(gameStore.canChi).toBe(1);
    // gameStore.game.canFulouList = [
    //   new Fulou("chi", new Pai("m", 4), createPais(["2m", "3m"])),
    //   new Fulou("chi", new Pai("m", 4), createPais(["5m", "6m"])),
    // ];
    // expect(gameStore.canChi).toBe(2);
    // gameStore.game.canFulouList = [];
    // expect(gameStore.canChi).toBe(0);
    
  });
});
