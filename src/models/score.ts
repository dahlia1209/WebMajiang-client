import { ref, onMounted, onUnmounted } from "vue";
import { Pai } from "./pai";
import { type PaiSuit } from "./type";
import { type Position, type Feng } from "@/models/type";

export interface ScoreProperty{
  zhuangfeng?: Feng;
  menfeng?: Feng;
  baopai?: Pai[];
  paishu?: number;
  jushu?: number;
  jicun?: number;
  changbang?: number;
  defen?: number[];
}
export class Score {
  zhuangfeng;
  menfeng;
  jushu;
  jicun;
  changbang;
  baopai;
  paishu;
  defen;

  constructor(option?: ScoreProperty) {
    this.zhuangfeng = option && option.zhuangfeng ? option.zhuangfeng : "東";
    this.menfeng = option && option.menfeng ? option.menfeng : "東";
    this.baopai = option && option.baopai ? this.validateBaopai(option.baopai) : this.validateBaopai([new Pai("b", 0)]);
    this.paishu = option && option.paishu ? option.paishu : 70;
    this.jushu = option && option.jushu ? option.jushu : 1;
    this.jicun = option && option.jicun ? option.jicun : 0;
    this.changbang = option && option.changbang ? option.changbang : 0;
    this.defen = option && option.defen ? this.validateDefen(option.defen) : [25000, 25000, 25000, 25000];
  }

  private validateBaopai(baopai: Pai[]) {
    if (baopai.length > 0 && baopai.length <= 5) {
      const fillCnt = 5 - baopai.length;
      const bpais: Pai[] = [];
      for (let index = 0; index < fillCnt; index++) {
        bpais.push(new Pai("b", 0));
      }
      return [...baopai, ...bpais];

    } else {
      throw new Error(`ドラ牌の枚数が正しくありません。1~5枚に設定してください。baopai:${baopai}`);
    }
  }

  private validateDefen(defen: number[]) {
    if (defen.length != 4) {
      throw new Error(`各プレイヤーの得点を指定してください。defen:${defen}`);
    }
    return defen;
  }

  getJushuName() {
    const quotient = Math.floor((this.jushu - 1) / 4);
    const remainder = ((this.jushu - 1) % 4) + 1;
    let jushuName;
    switch (quotient) {
      case 0:
        jushuName = `東${remainder}局`;
        break;
      case 1:
        jushuName = `南${remainder}局`;
        break;
      case 2:
        jushuName = `西${remainder}局`;
        break;
      case 3:
        jushuName = `北${remainder}局`;
        break;
      default:
        throw new Error(`局数が正しく設定されていません：${this.jushu}`);
    }
    return jushuName;
  }

  getPlayerFeng() {
    const fengOrder: Feng[] = ["東", "南", "西", "北"];
    const startIndex = fengOrder.indexOf(this.menfeng);
    return [...fengOrder.slice(startIndex), ...fengOrder.slice(0, startIndex)];
  }

  update(score:ScoreProperty){
    this.zhuangfeng =  score.zhuangfeng===undefined? this.zhuangfeng:score.zhuangfeng
    this.menfeng = score.menfeng===undefined? this.zhuangfeng:score.menfeng
    this.baopai = score.baopai ===undefined? this.baopai:score.baopai
    this.paishu = score.paishu ===undefined? this.paishu:score.paishu
    this.jushu =  score.jushu ===undefined? this.jushu:score.jushu
    this.jicun =  score.jicun ===undefined? this.jicun:score.jicun
    this.changbang = score.changbang ===undefined? this.changbang:score.changbang
    this.defen = score.defen ===undefined? this.defen:score.defen
  }
}

export const useScore = (score: Score) => {
  const reactiveScore = ref(score);

  return reactiveScore;
};
