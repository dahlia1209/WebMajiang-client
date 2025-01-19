import { describe, it, expect } from "vitest";

import { usePai, Pai } from "../pai";
import { useShoupai, Shoupai, Fulou, createPais } from "../shoupai";
import { useScore, Score } from "../score";
import { ref } from "vue";
import type { Position } from "../type";

describe("useScore", () => {
  it("useScore init", () => {
    let score;
    score = useScore(new Score());
    score = useScore(new Score({
      zhuangfeng:"南",
      menfeng:"南",
      baopai:[
        new Pai("m", 1),
        new Pai("m", 2),
        new Pai("m", 3),
        new Pai("m", 4),
        new Pai("m", 5),
      ],
      paishu:69,
      jushu:7,
      jicun:1,
      changbang:2,
      defen:[10000, 20000, 30000, 40000]}
    ));

    //例外
    expect(() => {
      useScore(new Score({baopai:[]}))
    }).toThrowError(); //ドラを指定しない
    expect(() => {
      new Score({baopai: [
        new Pai("m", 1),
        new Pai("m", 2),
        new Pai("m", 3),
        new Pai("m", 4),
        new Pai("m", 5),
        new Pai("m", 6),
      ]});
    }).toThrowError(); //ドラを多数指定
    expect(() => {
      useScore(new Score({defen:[10000, 20000, 30000]}));
    }).toThrowError(); //得点の要素が３つ
  })
  it("useScore getJushuName", () => {
    let score;
    score = useScore(new Score());
    expect(score.value.getJushuName()).toBe("東1局")
    score.value.jushu=4
    expect(score.value.getJushuName()).toBe("東4局")
    score.value.jushu=5
    expect(score.value.getJushuName()).toBe("南1局")
    score.value.jushu=9
    expect(score.value.getJushuName()).toBe("西1局")
    score.value.jushu=13
    expect(score.value.getJushuName()).toBe("北1局")
    
    //例外
    score.value.jushu=17
    expect(()=>score.value.getJushuName()).toThrowError()
    
  })

  it("getPlayerFeng", () => {
    let score;
    score = useScore(new Score());
    score.value.menfeng="東"
    expect(["main", "xiajia", "duimian", "shangjia"].map(x=>score.value.getPlayerFeng(x as Position))).toStrictEqual(["東","南","西","北",])
    score.value.menfeng="南"
    expect(["main", "xiajia", "duimian", "shangjia"].map(x=>score.value.getPlayerFeng(x as Position))).toStrictEqual(["南","西","北","東",])
    score.value.menfeng="西"
    expect(["main", "xiajia", "duimian", "shangjia"].map(x=>score.value.getPlayerFeng(x as Position))).toStrictEqual(["西","北","東","南",])
    score.value.menfeng="北"
    expect(["main", "xiajia", "duimian", "shangjia"].map(x=>score.value.getPlayerFeng(x as Position))).toStrictEqual(["北","東","南","西",])
  })

  it("update",()=>{
    let score;
    score = useScore(new Score());
  })
});
