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
    expect(gameStore.action).toBe(null);
    expect(gameStore.dapai).toBe(null);
    expect(gameStore.status).toBe(null);
    expect(gameStore.turn).toBe(null);
    expect(gameStore.waitingFulouPai).toStrictEqual([]);
    gameStore.action = "ツモ";
    const zimo = new Pai("m", 1);
    gameStore.dapai = zimo;
    gameStore.status = "ready";
    gameStore.turn = "shangjia";
    const waitingFulouPai = [
      new Fulou("chi", new Pai("m", 3), createPais(["1m", "2m"])),
      new Fulou("chi", new Pai("s", 3), createPais(["1s", "2s"])),
    ];

    gameStore.waitingFulouPai = waitingFulouPai;
    expect(gameStore.action).toBe("ツモ");
    expect(gameStore.dapai).toStrictEqual(zimo);
    expect(gameStore.status).toBe("ready");
    expect(gameStore.turn).toBe("shangjia");
    expect(gameStore.waitingFulouPai).toStrictEqual(waitingFulouPai);
  });
  it("useGameStore getter", () => {
    const gameStore = useGameStore();
    //打牌判定
    gameStore.action = "打牌";
    gameStore.status = "thinking";
    gameStore.turn = "main";
    expect(gameStore.canDapai).toBe(true);
    gameStore.status = "ready";
    expect(gameStore.canDapai).toBe(false);

    //リー牌判定
    gameStore.action = "ツモ";
    gameStore.turn = "shangjia";
    expect(gameStore.canLipai).toBe(true);
    gameStore.action = "打牌";
    expect(gameStore.canLipai).toBe(false);

    //暗槓判定
    gameStore.action = "打牌";
    gameStore.status = "thinking";
    gameStore.turn = "main";
    gameStore.waitingFulouPai = [
      new Fulou("angang", null, createPais(["1m", "1m", "1m", "1m"])),
    ];
    expect(gameStore.canAnGang).toBe(1);
    gameStore.waitingFulouPai = [];
    expect(gameStore.canAnGang).toBe(0);

    //加槓判定
    gameStore.action = "打牌";
    gameStore.status = "thinking";
    gameStore.turn = "main";
    gameStore.waitingFulouPai = [
      new Fulou("jiagang", new Pai("m", 1), createPais(["1m", "1m", "1m"])),
    ];
    expect(gameStore.canAnGang).toBe(1);
    gameStore.waitingFulouPai = [];
    expect(gameStore.canAnGang).toBe(0);

    //明槓判定
    gameStore.action = "打牌";
    gameStore.status = "ready";
    gameStore.turn = "xiajia";
    gameStore.waitingFulouPai = [
      new Fulou("minggang", new Pai("m", 1), createPais(["1m", "1m", "1m"])),
    ];
    gameStore.dapai = new Pai("m", 1);
    expect(gameStore.canMingGang).toBe(true);
    gameStore.waitingFulouPai = [];
    expect(gameStore.canMingGang).toBe(false);

    //ポン判定
    gameStore.action = "打牌";
    gameStore.status = "ready";
    gameStore.turn = "duimian";
    gameStore.waitingFulouPai = [
      new Fulou("peng", new Pai("m", 1), createPais(["1m", "1m"])),
    ];
    gameStore.dapai = new Pai("m", 1);
    expect(gameStore.canPeng).toBe(true);
    gameStore.waitingFulouPai = [];
    expect(gameStore.canPeng).toBe(false);
    
    //チー判定
    gameStore.action = "打牌";
    gameStore.status = "ready";
    gameStore.turn = "shangjia";
    gameStore.waitingFulouPai = [
      new Fulou("chi", new Pai("m", 4), createPais(["2m", "3m"])),

    ];
    gameStore.dapai = new Pai("m", 4);
    expect(gameStore.canChi).toBe(1);
    gameStore.waitingFulouPai = [
      new Fulou("chi", new Pai("m", 4), createPais(["2m", "3m"])),
      new Fulou("chi", new Pai("m", 4), createPais(["5m", "6m"])),
    ];
    expect(gameStore.canChi).toBe(2);
    gameStore.waitingFulouPai = [];
    expect(gameStore.canChi).toBe(0);
    
  });
});
