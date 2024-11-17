import { type Ref, ref, onMounted, onUnmounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { type PaiSuit } from "./type";

export class Pai {
  readonly suit: PaiSuit;
  readonly num: number;
  readonly isRed: boolean;
  readonly id: string;

  constructor(suit: PaiSuit, num: number, isRed: boolean = false, id: string = uuidv4()) {
    this.suit = this.validateSuit(suit);
    this.num = this.validateNum(num, suit);
    this.isRed = this.validateIsRed(isRed, suit, num);
    this.id = id;
  }

  private validateSuit(suit: string) {
    if (suit === "m" || suit === "p" || suit === "s" || suit === "b" || suit === "z") {
      return suit;
    } else {
      throw new Error(`正しい牌種を指定してください。指定された牌種：${suit}`);
    }
  }

  private validateNum(num: number, suit: PaiSuit): number {
    if (suit === "m" || suit === "p" || suit === "s") {
      if (num < 1 || num > 9) {
        throw new Error("Number must be between 1 and 9 for suits m, p, s");
      }
    } else if (suit === "z") {
      if (num < 1 || num > 7) {
        throw new Error("Number must be between 1 and 7 for suit z");
      }
    } else if (suit === "b") {
      return 0;
    }
    return num;
  }

  private validateIsRed(is_red: boolean, suit: PaiSuit, num: number): boolean {
    if (is_red && (suit === "z" || suit === "b" || num !== 5)) {
      throw new Error("Only 5 in suits m, p, s can be red dora");
    }
    return is_red;
  }

  equals(other: Pai, isRed: boolean = false): boolean {
    if (isRed) {
      return this.num === other.num && this.suit === other.suit && this.isRed === other.isRed;
    } else {
      return this.num === other.num && this.suit === other.suit;
    }
  }

  name() {
    const numStr = this.isRed && this.num == 5 ? "0" : this.num.toString();
    return this.suit.toString() + numStr;
  }

  seriarize() {
    const a = this.isRed ? "t" : "f";
    const s = this.suit + String(this.num) + a;
    return s;
  }

  static deseriarize(str: string) {
    if (str.length < 2 || str.length > 3) {
      throw new Error("文字数は2~3文字にしてください");
    }

    try {
      const s = str[0] as PaiSuit;
      const n = Number(str[1]);
      const r = str.length == 3 && str[2] == "t";
      return new Pai(s, n, r);
    } catch (error) {
      console.log("error");
      throw new Error(`正しい文字を指定してください。与えられた文字:${str}`);
    }
  }
}

export const usePai = (pai: Pai) => {
  const reavtivePai = ref(pai);
  return reavtivePai;
};
