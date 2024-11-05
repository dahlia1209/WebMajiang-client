import { describe, it, expect } from "vitest";

import { usePai, Pai } from "../pai";
import { useShoupai, Shoupai, Fulou, createPais } from "../shoupai";
import { useScore, Score } from "../score";
import { ref } from "vue";

describe("useScore", () => {
  it("useScore init", () => {
    let score;
    score = useScore(new Score());
    score = useScore(new Score(
      "南",
      "南",
      [
        new Pai("m", 1),
        new Pai("m", 2),
        new Pai("m", 3),
        new Pai("m", 4),
        new Pai("m", 5),
      ],
      69,
      7,
      1,
      2,
      [10000, 20000, 30000, 40000]
    ));

    //例外
    expect(() => {
      useScore(new Score("南", "南", []))
    }).toThrowError(); //ドラを指定しない
    expect(() => {
      new Score("南", "南", [
        new Pai("m", 1),
        new Pai("m", 2),
        new Pai("m", 3),
        new Pai("m", 4),
        new Pai("m", 5),
        new Pai("m", 6),
      ]);
    }).toThrowError(); //ドラを多数指定
    expect(() => {
      useScore(new Score("南",
      "南",
      [
        new Pai("m", 1),
        new Pai("m", 2),
        new Pai("m", 3),
        new Pai("m", 4),
        new Pai("m", 5),
      ],
      69,
      7,
      1,
      2,
      [10000, 20000, 30000]));
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
    expect(score.value.getPlayerFeng()).toStrictEqual(["東","南","西","北",])
    score.value.menfeng="南"
    expect(score.value.getPlayerFeng()).toStrictEqual(["南","西","北","東",])
    score.value.menfeng="西"
    expect(score.value.getPlayerFeng()).toStrictEqual(["西","北","東","南",])
    score.value.menfeng="北"
    expect(score.value.getPlayerFeng()).toStrictEqual(["北","東","南","西",])
  })
});
