import { ref, onMounted, onUnmounted } from "vue";

export type PaiSuit = "b" | "m" | "p" | "s" | "z";
export class Pai {
  readonly suit: PaiSuit;
  readonly num: number;
  readonly isRed: boolean;

  constructor(suit: PaiSuit, num: number, is_red: boolean = false) {
    this.suit = suit;
    this.num = this.validateNum(num, suit);
    this.isRed = this.validateIsRed(is_red, suit, num);
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
    if (is_red && (suit === "z"||suit === "m" || num !== 5)) {
      throw new Error("Only 5 in suits m, p, s can be red dora");
    }
    return is_red;
  }

  equals(other: Pai): boolean {
    return (
      this.num === other.num &&
      this.suit === other.suit &&
      this.isRed === other.isRed
    );
  }
}

export const usePai = (suit: PaiSuit, num: number, is_red: boolean = false) => {
  const pai = new Pai(suit, num, is_red);

  return pai;
};
