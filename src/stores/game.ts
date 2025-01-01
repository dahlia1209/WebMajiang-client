import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import { type Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";
import { Settings } from "@/models/settings";
import { Score } from "@/models/score";
import { Board, GameStatus } from "@/models/board";
import { MessageType, useWebSocketService, type WebSocketMessage, type callbackProperty } from "@/services/webSocketService";

export const useGameStore = defineStore("game", {
  state: () => ({
    game: new GameStatus(),
    score: new Score(),
    settings: new Settings(),
  }),
  getters: {
    getStatus: (state) => {
      const a={action:"fulou"} as {action:PlayerAction}
      return (
        state.game.action == "zimo" && 
        state.game.turn == "main" &&
        state.game.zimopai !=null
      );
    },
    mainZimoStatus: (state) => {
      return (
        state.game.action == "zimo" && 
        state.game.turn == "main" &&
        state.game.zimopai !=null
        // state.game.status == "thinking"
      );
    },
    mainFulouStatus: (state) => {
      return (
        state.game.action == "fulou" && 
        state.game.turn == "main" 
        // state.game.status == "thinking"
      );
    },
    mainDapaiStatus: (state) => {
      return (
        state.game.action == "dapai" && 
        state.game.turn == "main" &&
        state.game.dapai != null
        // state.game.status == "thinking"
      );
    },
    kaiju: (state) => {
      return state.game.action == "kaiju" && state.game.qipai.length > 0;
    },
    qipai: (state) => {
      return state.game.action == "qipai" && state.game.qipai.length > 0;
    },
  },
  actions: {
    zimoStatus (position?: Position) {
      return (
        this.game.action == "zimo" && 
        this.game.zimopai !=null &&
        (this.game.turn == position || position==null)
        // state.game.status == "thinking"
      );
    },
    fulouStatus (position?: Position) {
      return (
        this.game.action == "fulou" && 
        this.game.fulou !=null &&
        (this.game.turn == position || position==null)
        // state.game.status == "thinking"
      );
    },
    canLipai(position: Position) {
      // if (position == "main") return this.zimoStatus("xiajia") || this.fulouStatus()
      if (position == "main") return this.game.turn == "xiajia" && this.game.action == "zimo"
      else if (position == "xiajia") return this.game.turn == "duimian" && this.game.action == "zimo";
      else if (position == "duimian") return this.game.turn == "shangjia" && this.game.action == "zimo";
      else return this.game.turn == "main" && this.game.action == "zimo";
    },
    recievedZimopai(position: Position) {
      return (
        this.game.action == "zimo" &&
        // this.game.status == "thinking" &&
        this.game.turn == position &&
        this.game.zimopai != null
      );
    },
    tajiaDapaiStatus(position?: Position) {
      return (
        (this.game.action == "dapai" || this.game.action == "lizhi") &&
        this.game.dapai != null &&
        (this.game.turn == position || position==null)
      );
    },
    isLizhi(position: Position) {
      return (
        this.game.action == "lizhi" &&
        // this.game.status == "ready" &&
        this.game.turn == position &&
        this.game.dapai != null
      );
    },
    tajiaFulouToMe(position: Position) {
      return (
        this.game.action == "fulou" &&
        // this.game.status == "ready" &&
        this.game.turn != position &&
        this.game.fulou != null &&
        (this.game.fulou.type == "chi" || this.game.fulou.type == "peng" || this.game.fulou.type == "minggang") &&
        this.game.fulou.position == position
      );
    },
    doneFulou(position: Position) {
      return (
        this.game.action == "fulou" &&
        // this.game.status == "ready" &&
        this.game.turn == position &&
        this.game.fulou != null
      );
    },
    doneZimo(position?: Position) {
      return (this.game.action == "zimo" && 
        // this.game.status == "ready" && 
        position) ? this.game.turn == position : true;
    },
  },
});
