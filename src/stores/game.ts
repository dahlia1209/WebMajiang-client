import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  type Position,
  type PlayerStatus,
  type PlayerAction,
} from "@/models/type";
import { type Pai } from "@/models/pai";
import { type Fulou } from "@/models/shoupai";

export const useGameStore = defineStore("game", {
  state: () => ({
    action: null as PlayerAction | null,
    turn: null as Position | null,
    status: null as PlayerStatus | null,
    dapai: null as Pai | null,
    zimopai: null as Pai | null,
    canFulouList: [] as Fulou[],
  }),
  getters: {
    canDapai: (state) => {
      return (
        state.action == "dapai" &&
        state.turn == "main" &&
        state.status == "thinking"
      );
    },
    // canLipai: (state) => {
    //   return state.action == "zimo"
    // },
    canPeng: (state) => {
      if (
        state.action !== "dapai" ||
        state.turn === "main" ||
        state.status !== "ready" ||
        !state.dapai
      ) {
        return false;
      }

      return state.canFulouList.some(
        (f) =>
          f.type === "peng" &&
          f.nakipai &&
          state.dapai &&
          f.nakipai.num === state.dapai.num &&
          f.nakipai.suit === state.dapai.suit
      );
    },
    canChi: (state) => {
      if (
        state.action !== "dapai" ||
        state.turn !== "shangjia" ||
        state.status !== "ready" ||
        !state.dapai
      ) {
        return 0;
      }

      const matchingFulou = state.canFulouList.filter(
        (f) =>
          f.type === "chi" &&
          f.nakipai &&
          state.dapai &&
          f.nakipai.num === state.dapai.num &&
          f.nakipai.suit === state.dapai.suit
      );
      return matchingFulou.length;
    },
    canMingGang: (state) => {
      if (
        state.action !== "dapai" ||
        state.turn === "main" ||
        state.status !== "ready" ||
        !state.dapai
      ) {
        return false;
      }

      return state.canFulouList.some(
        (f) =>
          f.type === "minggang" &&
          f.nakipai &&
          state.dapai &&
          f.nakipai.num === state.dapai.num &&
          f.nakipai.suit === state.dapai.suit
      );
    },
    canAnGang: (state) => {
      if (
        state.turn !== "main" &&
        state.action !== "dapai" &&
        state.status !== "thinking"
      ) {
        return 0;
      }
      const matchingFulou = state.canFulouList.filter(
        (f) => f.type === "angang" || f.type === "jiagang"
      );
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
      if (position == "main")
        return this.turn == "xiajia" && this.action == "zimo";
      else if (position == "xiajia")
        return this.turn == "duimian" && this.action == "zimo";
      else if (position == "duimian")
        return this.turn == "shangjia" && this.action == "zimo";
      else if (position == "shangjia")
        return this.turn == "main" && this.action == "zimo";
    },
    recievedZimopai(position: Position) {
      return (
        this.action == "zimo" &&
        this.status == "thinking" &&
        this.turn == position &&
        this.zimopai
      );
    },
    doneDapai(position: Position) {
      return (
        this.action == "dapai" &&
        this.status == "ready" &&
        this.turn == position &&
        this.dapai
      );
    },
    isLizhi(position: Position) {
      return (
        this.action == "lizhi" &&
        this.status == "ready" &&
        this.turn == position &&
        this.dapai
      );
    },
    // increment() {
    //   this.count++;
    // },
  },
});
