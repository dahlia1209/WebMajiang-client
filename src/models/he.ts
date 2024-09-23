import { ref, onMounted, onUnmounted } from "vue";
import { Pai } from "./pai";
import { type PaiSuit } from "./type";
import { v4 as uuidv4 } from "uuid";
import { type Position } from "@/models/type";

export class He {
    pai:Pai[];

    constructor(pai:Pai[]=[]){
        this.pai=pai
    }



}

export const useHe = (he: He) => {
    const reactiveHe = ref(he);
  
    return reactiveHe;
  };
  