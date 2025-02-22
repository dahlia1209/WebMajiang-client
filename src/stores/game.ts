import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import { Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";
import { Settings } from "@/models/settings";
import { Score } from "@/models/score";
import { WebSocketMsg,GameContentFormat,ScoreContent } from "@/models/websocket";

export const useGameStore = defineStore("game", {
  state: () => ({
    game: new GameContentFormat(),
    score: new Score(),
    settings: new Settings(),
  }),
  getters: {
    getDapai:(state)=>state.game.dapai ==null ? null : Pai.deserialize(state.game.dapai.serialize()),
    getHule:(state)=> state.game.hule.map(x=>Pai.deserialize(x.serialize())),
    getZimopai:(state)=>state.game.zimopai ==null ? null : Pai.deserialize(state.game.zimopai.serialize()),
    getLizhipai:(state)=> state.game.lizhipai.map(x=>Pai.deserialize(x.serialize())),
    getFulou:(state)=>state.game.fulou ==null ? null : Fulou.deserialize(state.game.fulou.serialize()),
    getQipai:(state)=>state.game.qipai.map(x=>Pai.deserialize(x.serialize())),
    getDapaiIdx:(state)=>state.game.dapaiIdx,
    getAction:(state)=>state.game.action,
    getTurn:(state)=>state.game.turn,
    getFulouCandidates:(state)=>state.game.fulouCandidates.map(x=>Fulou.deserialize(x.serialize())),
    getScore:(state)=>new Score({baopai:state.score.baopai as Pai[]}),
    getBaopai:(state)=>state.game.baopai ==null ? null : Pai.deserialize(state.game.baopai.serialize()),
  },
  actions: {
    isLizhi(position: Position) {
      return (
        this.game.action == "lizhi" &&
        // this.game.status == "ready" &&
        this.game.turn == position &&
        this.game.dapai != null
      );
    },

  },
});
