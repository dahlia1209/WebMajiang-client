import { ref, onMounted, onUnmounted } from "vue";
import { Pai } from "./pai";
import { type PaiSuit } from "./type";
import { v4 as uuidv4 } from "uuid";
import { type Position } from "@/models/type";

export class Settings {
    mode:number;

    constructor(mode=0){
        this.mode=mode
    }

}

export const useSettings = (settings: Settings) => {
    const reactiveSettings = ref(settings);
  
    return reactiveSettings;
  };
  