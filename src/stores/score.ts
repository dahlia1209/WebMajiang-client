import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import { type Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";
import { Settings } from "@/models/settings";
import { Score } from "@/models/score";

export const useScoreStore = defineStore("score", {
  state:()=>new Score(),
  getters: {
    
  },
  actions: {
    
  },
});
