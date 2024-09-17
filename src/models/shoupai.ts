import { ref, onMounted, onUnmounted } from "vue";
import { Pai } from "./pai";
import { type PaiSuit } from "./type";
import { v4 as uuidv4 } from "uuid";
import { type Position } from "@/models/type";

export type FulouType = "chi" | "peng" | "minggang" | "angang" | "jiagang";

export class Fulou {
  type: FulouType;
  nakipai: Pai | null;
  fuloupais: Pai[];
  position: Position | null;
  readonly id: string;

  constructor(
    type: FulouType,
    nakipai: Pai | null = null,
    fuloupais: Pai[] = [],
    position: Position | null = null
  ) {
    this.type = type;
    this.nakipai = nakipai;
    this.fuloupais = fuloupais;
    this.position = position;
    this.id = uuidv4();
  }
}

export class Shoupai {
  bingpai;
  fulou: Fulou[] = [];
  zimopai;
  waitingHulePai;
  waitingFulouPai;
  position: Position;

  constructor(
    position: Position,
    bingpai: Pai[] = [],
    zimopai: Pai | null = null,
    fulou: Fulou[] = [],
    waitingHulePai: Pai[] = [],
    waitingFulouPai: Fulou[] = []
  ) {
    this.position = position;
    this.bingpai = bingpai;
    fulou.forEach((f) => this.addFulou(f));
    this.zimopai = zimopai;
    this.waitingHulePai = waitingHulePai;
    this.waitingFulouPai = waitingFulouPai;
  }

  addPai(pai: Pai): void {
    this.zimopai = pai;
    this.zimoIntoBingpai();
  }

  setZimopai(pai: Pai): void {
    if (this.zimopai != null) {
      throw new Error("zimo is not None");
    }
    this.zimopai = pai;
  }

  getZimo() {
    if (this.zimopai == null) {
      throw new Error("zimo is None");
    }
    return this.zimopai;
  }

  static sortPai(pais: Pai[]): Pai[] {
    return pais.sort((a, b) => {
      if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
      if (a.num !== b.num) return a.num - b.num;
      return Number(a.isRed) - Number(b.isRed);
    });
  }

  removePaiFromZimopai() {
    if (this.zimopai != null) {
      const pai = this.zimopai;
      this.zimopai = null;
      return pai;
    } else {
      throw new Error("zimopai is None");
    }
  }

  removPaiFromBingpai(idx: number) {
    if (this.bingpai) {
      const pai = this.bingpai[idx];
      if (idx !== -1) this.bingpai.splice(idx, 1);
      return pai;
    } else {
      throw new Error("bingpai is not defined");
    }
  }

  removePai(isZimopai: boolean, index: number = -1): void {
    if (isZimopai) {
      this.removePaiFromZimopai();
    } else {
      this.removPaiFromBingpai(index);
    }
  }

  zimoIntoBingpai(): void {
    if (this.zimopai != null && this.bingpai) {
      this.bingpai.push(this.zimopai);
      this.removePaiFromZimopai();
    }
  }

  addFulou(fulou: Fulou) {
    this.fulou.unshift(fulou);
  }

  doFulou(fulou: Fulou) {
    if (
      fulou.type == "chi" ||
      fulou.type == "minggang" ||
      fulou.type == "peng" ||
      fulou.type == "angang"
    ) {
      fulou.fuloupais.forEach((p) => {
        const idx = this.bingpai.findIndex((bp) => p.equals(bp));
        if (idx < 0)
          throw Error(`${fulou.type}ができません。次の牌がありません:${p}`);
        this.removPaiFromBingpai(idx);
      });
      this.addFulou(fulou);
    } else if (fulou.type == "jiagang") {
      const matchedFulouIndex = this.fulou.findIndex(
        (f) =>
          f.type == "peng" &&
          f.nakipai &&
          fulou.nakipai &&
          f.nakipai.equals(fulou.nakipai)
      );
      if (matchedFulouIndex < 0) throw Error(`${fulou.type}ができません。`);
      const matchedBingpaiIdx = [...this.bingpai, this.zimopai].findIndex(
        (bz) => bz && bz.equals(this.fulou[matchedFulouIndex].nakipai!)
      );
      console.log("matchedBingpaiIdx", matchedBingpaiIdx);
      let pai;
      if (matchedBingpaiIdx < 0) {
        throw Error(`${fulou.type}ができません。`);
      } else if (matchedBingpaiIdx == this.bingpai.length) {
        pai = this.removePaiFromZimopai();
      } else {
        pai = this.removPaiFromBingpai(matchedBingpaiIdx);
      }
      const fuloupais = this.fulou[matchedFulouIndex].fuloupais;
      fuloupais.push(pai);

      const jiagangFulou = new Fulou(
        "jiagang",
        this.fulou[matchedFulouIndex].nakipai,
        fuloupais,
        this.fulou[matchedFulouIndex].position
      );
      this.fulou[matchedFulouIndex] = jiagangFulou;
    }
  }
}

export const useShoupai = (shoupai: Shoupai) => {
  const reactiveShoupai = ref(shoupai);

  return reactiveShoupai;
};

export const useFulou = (fulou: Fulou) => {
  const reactiveFulou = ref(fulou);

  return reactiveFulou;
};

export const createPais = (paiStrings: string[]): Pai[] => {
  return paiStrings
    .filter((p) => p.length >= 2)
    .map((p) => {
      const [num, suit, ...flags] = p.split("");
      const [isRed = false] = flags.map((f) => f === "t");
      return new Pai(suit as PaiSuit, Number(num), isRed);
    });
};
