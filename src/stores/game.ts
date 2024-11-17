import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import { type Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";
import { Settings } from "@/models/settings";
import { Score } from "@/models/score";
import { Board, GameStatus } from "@/models/board";

export const useGameStore = defineStore("game", {
  state: () => ({
    game: new GameStatus(),
    score: new Score(),
    settings: new Settings(),
  }),
  getters: {
    canDapai: (state) => {
      return state.game.action == "dapai" && state.game.turn == "main" && state.game.status == "thinking";
    },
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
    kaiju: (state) => {
      return state.game.action == "kaiju" && state.game.qipai.length > 0;
    },
  },
  actions: {
    canLipai(position: Position) {
      if (position == "main") return this.game.turn == "xiajia" && this.game.action == "zimo";
      else if (position == "xiajia") return this.game.turn == "duimian" && this.game.action == "zimo";
      else if (position == "duimian") return this.game.turn == "shangjia" && this.game.action == "zimo";
      else return this.game.turn == "main" && this.game.action == "zimo";
    },
    recievedZimopai(position: Position) {
      return (
        this.game.action == "zimo" &&
        this.game.status == "thinking" &&
        this.game.turn == position &&
        this.game.zimopai != null
      );
    },
    doneDapai(position: Position) {
      return (
        (this.game.action == "dapai" || this.game.action == "lizhi") &&
        this.game.status == "ready" &&
        this.game.turn == position &&
        this.game.dapai != null
      );
    },
    isLizhi(position: Position) {
      return (
        this.game.action == "lizhi" &&
        this.game.status == "ready" &&
        this.game.turn == position &&
        this.game.dapai != null
      );
    },
    doneFulouToMe(position: Position) {
      return (
        this.game.action == "fulou" &&
        this.game.status == "ready" &&
        this.game.turn != position &&
        this.game.fulou != null &&
        (this.game.fulou.type == "chi" || this.game.fulou.type == "peng" || this.game.fulou.type == "minggang") &&
        this.game.fulou.position == position
      );
    },
    doneFulou(position: Position) {
      return (
        this.game.action == "fulou" &&
        this.game.status == "ready" &&
        this.game.turn == position &&
        this.game.fulou != null
      );
    },
    doneZimo(position?: Position) {
      return this.game.action == "zimo" && this.game.status == "ready" && position ? this.game.turn == position : true;
    },

  },
});
