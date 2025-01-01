import { ref, onMounted, onUnmounted } from "vue";
import { Pai } from "./pai";
import { Shoupai, Fulou, createPais } from "./shoupai";
import { Score } from "./score";
import { He } from "./he";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";

export interface GameStatusProperty {
  action?: PlayerAction | null;
  turn?: Position | null;
  // status?: PlayerStatus | null;
  dapai?: Pai | null;
  zimopai?: Pai | null;
  // fulouCandidates?: Fulou[];
  fulou?: Fulou | null;
  qipai?: Pai[];
}

export class GameStatus {
  action;
  turn;
  dapai;
  zimopai;
  fulou;
  qipai;

  constructor(option?: GameStatusProperty) {
    this.action = option && option.action ? option.action : null;
    this.turn = option && option.turn ? option.turn : null;
    this.dapai = option && option.dapai ? option.dapai : null;
    this.zimopai = option && option.zimopai ? option.zimopai : null;
    this.fulou = option && option.fulou ? option.fulou : null;
    this.qipai = option && option.qipai ? option.qipai : [];
  }

  update(option: GameStatusProperty) {
    this.action = option.action === undefined ? this.action : option.action;
    this.turn = option.turn === undefined ? this.turn : option.turn;
    this.dapai = option.dapai === undefined ? this.dapai : option.dapai;
    this.zimopai = option.zimopai === undefined ? this.zimopai : option.zimopai;
    this.fulou = option.fulou === undefined ? this.fulou : option.fulou;
    this.qipai = option.qipai === undefined ? this.qipai : option.qipai;
  }

  serialize(){
    const as=this.action ==null ? "null": this.action.toString()
    const ts=this.turn ==null ? "null": this.turn.toString()
    const ds=this.dapai ==null ? "null": this.dapai.serialize()
    const zs=this.zimopai ==null ? "null": this.zimopai.serialize()
    const fs=this.fulou ==null ? "null": this.fulou.serialize()
    const qs=this.qipai.length==0 ? "null": this.qipai.map(x=>x.serialize()).join("+")

    return [as,ts,ds,zs,fs,qs].join(",")
  }

  static deserialize (str:string){
    const strs=str.split(",")
    if (strs.length != 6) {
      throw new Error(`与えられた文字列に誤りがあります。分割した要素の数が正しくありません。str:${str},splitStrings:${strs}`)
    }
    const action=strs[0]=="null"?null:strs[0] as PlayerAction
    const turn=strs[1]=="null"?null:strs[1] as Position
    const dapai=strs[2]=="null"?null:Pai.deseriarize(strs[2])
    const zimopai=strs[3]=="null"?null:Pai.deseriarize(strs[3]) 
    const fulou=strs[4]=="null"?null:Fulou.deserialize(strs[4]) 
    const qipai=strs[5]=="null"?[]:strs[5].split("+").map(x=>Pai.deseriarize(x))

    return new GameStatus({action,turn,dapai,zimopai,fulou,qipai})
  }

  


}

export class Board {
  gameStatus;
  score;
  shoupai;
  he;

  constructor(gameStatus = new GameStatus(), score = new Score(), shoupai: Shoupai[] = [], he: He[] = []) {
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
