import { type Ref, ref, onMounted, onUnmounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { type PaiSuit } from "./type";

export class Pai {
  readonly suit: PaiSuit;
  readonly num: number;
  readonly isRed: boolean;
  readonly id: string;

  constructor(
    suit: PaiSuit,
    num: number,
    isRed: boolean = false,
    id: string = uuidv4()
  ) {
    this.suit = suit;
    this.num = this.validateNum(num, suit);
    this.isRed = this.validateIsRed(isRed, suit, num);
    this.id = id;
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
      return (
        this.num === other.num &&
        this.suit === other.suit &&
        this.isRed === other.isRed
      );
    } else {
      return this.num === other.num && this.suit === other.suit;
    }
  }

  name() {
    const numStr = this.isRed && this.num == 5 ? "0" : this.num.toString();
    return this.suit.toString() + numStr;
  }

}

export const usePai = (pai: Pai) => {
  const reavtivePai = ref(pai);
  return reavtivePai;
};
