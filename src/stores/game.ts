import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import { type Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";
import { Score } from "@/models/score";
import { Board, GameStatus } from "@/models/board";

// export interface GameStore {
//   action: PlayerAction | null;
//   turn: Position | null;
//   status: PlayerStatus | null;
//   dapai: Pai | null;
//   zimopai: Pai | null;
//   canFulouList: Fulou[];
//   fulou: Fulou | null;
//   score: Score;
// }

export const useGameStore = defineStore("game", {
  state: () => ({
    game: new GameStatus(),
    score: new Score(),
  }),
  getters: {
    canDapai: (state) => {
      return state.game.action == "dapai" && state.game.turn == "main" && state.game.status == "thinking";
    },
    // canLipai: (state) => {
    //   return state.action == "zimo"
    // },
    canPeng: (state) => {
      if (
        state.game.action !== "dapai" ||
        state.game.turn === "main" ||
        state.game.status !== "ready" ||
        !state.game.dapai
      ) {
        return false;
      }

      return state.game.canFulouList.some(
        (f) =>
          f.type === "peng" &&
          f.nakipai &&
          state.game.dapai &&
          f.nakipai.num === state.game.dapai.num &&
          f.nakipai.suit === state.game.dapai.suit
      );
    },
    canChi: (state) => {
      if (
        state.game.action !== "dapai" ||
        state.game.turn !== "shangjia" ||
        state.game.status !== "ready" ||
        !state.game.dapai
      ) {
        return 0;
      }

      const matchingFulou = state.game.canFulouList.filter(
        (f) =>
          f.type === "chi" &&
          f.nakipai &&
          state.game.dapai &&
          f.nakipai.num === state.game.dapai.num &&
          f.nakipai.suit === state.game.dapai.suit
      );
      return matchingFulou.length;
    },
    canMingGang: (state) => {
      if (
        state.game.action !== "dapai" ||
        state.game.turn === "main" ||
        state.game.status !== "ready" ||
        !state.game.dapai
      ) {
        return false;
      }

      return state.game.canFulouList.some(
        (f) =>
          f.type === "minggang" &&
          f.nakipai &&
          state.game.dapai &&
          f.nakipai.num === state.game.dapai.num &&
          f.nakipai.suit === state.game.dapai.suit
      );
    },
    canAnGang: (state) => {
      if (state.game.turn !== "main" && state.game.action !== "dapai" && state.game.status !== "thinking") {
        return 0;
      }
      const matchingFulou = state.game.canFulouList.filter((f) => f.type === "angang" || f.type === "jiagang");
      return matchingFulou.length;
    },
    // recievedZimopai: (state) => {
    //   return (
    //     state.action == "zimo" &&
    //     state.status == "thinking" &&
    //     state.zimopai
    //   );
    // },
    // doneDapai:(state)=>{
    //   return (
    //     state.action == "dapai" &&
    //     state.status == "ready" &&
    //     state.dapai
    //   )
    // }
  },
  actions: {
    canLipai(position: Position) {
      if (position == "main") return this.game.turn == "xiajia" && this.game.action == "zimo";
      else if (position == "xiajia") return this.game.turn == "duimian" && this.game.action == "zimo";
      else if (position == "duimian") return this.game.turn == "shangjia" && this.game.action == "zimo";
      else if (position == "shangjia") return this.game.turn == "main" && this.game.action == "zimo";
    },
    recievedZimopai(position: Position) {
      return (
        this.game.action == "zimo" && this.game.status == "thinking" && this.game.turn == position && this.game.zimopai
      );
    },
    doneDapai(position: Position) {
      return (
        (this.game.action == "dapai" || this.game.action == "lizhi") &&
        this.game.status == "ready" &&
        this.game.turn == position &&
        this.game.dapai
      );
    },
    isLizhi(position: Position) {
      return (
        this.game.action == "lizhi" && this.game.status == "ready" && this.game.turn == position && this.game.dapai
      );
    },
    doneFulouToMe(position: Position) {
      return (
        (this.game.action == "chi" || this.game.action == "peng" || this.game.action == "minggang") &&
        this.game.status == "ready" &&
        this.game.turn != position &&
        this.game.fulou &&
        this.game.fulou.position == position
      );
    },
    doneFulou(position: Position) {
      return (
        (this.game.action == "chi" ||
          this.game.action == "peng" ||
          this.game.action == "minggang" ||
          this.game.action == "angang" ||
          this.game.action == "jiagang") &&
        this.game.status == "ready" &&
        this.game.turn == position &&
        this.game.fulou 
      );
    },
    // increment() {
    //   this.count++;
    // },
  },
});
