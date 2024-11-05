import { ref, onMounted, onUnmounted } from "vue";
import { Pai } from "./pai";
import { type PaiSuit } from "./type";
import { type Position, type Feng } from "@/models/type";

export class Score {
  zhuangfeng;
  menfeng;
  jushu;
  jicun;
  changbang;
  baopai;
  paishu;
  defen  ;

  constructor(
    zhuangfeng: Feng = "東",
    menfeng: Feng = "東",
    baopai: Pai[] = [new Pai("b", 0)],
    paishu = 69,
    jushu = 1,
    jicun = 0,
    changbang = 0,
    defen = [25000, 25000, 25000, 25000]
  ) {
    this.zhuangfeng = zhuangfeng;
    this.menfeng = menfeng;
    this.jushu = jushu;
    this.jicun = jicun;
    this.changbang = changbang;
    this.baopai = this.validateBaopai(baopai);
    this.paishu = paishu;
    this.defen = this.validateDefen(defen);
  }

  private validateBaopai(baopai: Pai[]) {
    if (baopai.length > 0 && baopai.length <= 5) {
      const fillCnt = 5 - baopai.length;
      const bpais:Pai[]=[]
      for (let index = 0; index < fillCnt; index++) {
        bpais.push(new Pai("b", 0))
      }
      return [...baopai, ...bpais];
      // return [...baopai, ...Array(fillCnt).fill(new Pai("b", 0))];
      
      return [...baopai, ...bpais]; //裏牌で埋める
    } else {
      throw new Error(
        `ドラ牌の枚数が正しくありません。1~5枚に設定してください。baopai:${baopai}`
      );
    }
  }

  private validateDefen(defen: number[]) {
    if (defen.length != 4) {
      throw new Error(`各プレイヤーの得点を指定してください。defen:${defen}`);
    }
    return defen
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
}

export const useScore = (score: Score) => {
  const reactiveScore = ref(score);

  return reactiveScore;
};
