import { ref, onMounted, onUnmounted } from "vue";
import { Pai } from "./pai";
import { Shoupai, Fulou, createPais } from "./shoupai";
import { Score } from "./score";
import { He } from "./he";
import { WebSocketMsg,GameContentFormat } from "@/models/websocket";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";

export class Board {
  gameStatus;
  score;
  shoupai;
  he;

  constructor(gameStatus = new GameContentFormat(), score = new Score(), shoupai: Shoupai[] = [], he: He[] = []) {
    this.gameStatus = gameStatus;
    this.score = score;
    this.shoupai = this.validateShoupai(shoupai);
    this.he = this.validateHe(he);
  }

  private validateHe(he: He[]) {
    if (he.length >= 0 && he.length <= 4) {
      const fillCnt = 4 - he.length;
      const hes: He[] = [];
      for (let index = 0; index < fillCnt; index++) {
        hes.push(new He());
      }
      return [...he, ...hes];
    } else {
      throw new Error(`捨て牌配列の要素は4つにしてください。he:${he}`);
    }
  }

  private validateShoupai(shoupai: Shoupai[]) {
    if (shoupai.length >= 0 && shoupai.length <= 4) {
      const fillCnt = 4 - shoupai.length;
      const shoupais: Shoupai[] = [];
      for (let index = 0; index < fillCnt; index++) {
        shoupais.push(
          new Shoupai(createPais(["0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b", "0b"]))
        );
      }
      return [...shoupai, ...shoupais];
    } else {
      throw new Error(`手牌配列の要素は4つにしてください。shoupai:${shoupai}`);
    }
  }
}

export const useBoard = (board: Board) => {
  const reactiveBoard = ref(board);

  return reactiveBoard;
};
