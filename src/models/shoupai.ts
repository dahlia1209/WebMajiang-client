import { ref, onMounted, onUnmounted } from "vue";
import { Pai } from "./pai";
import { type PaiSuit } from "./type";
import { v4 as uuidv4 } from "uuid";
import { type Position } from "@/models/type";

export type FulouType = "chi" | "peng" | "minggang" | "angang" | "jiagang";

export class Fulou {
  type: FulouType;
  fuloupai: Pai | null;
  menpais: Pai[];
  position: Position | null;
  readonly id: string;

  constructor(type: FulouType, nakipai: Pai | null = null, fuloupais: Pai[] = [], position: Position | null = null) {
    this.type = type;
    this.fuloupai = nakipai;
    this.menpais = fuloupais;
    this.position = position;
    this.id = uuidv4();
  }

  serialize() {
    const ns = this.fuloupai ? this.fuloupai.serialize() : "null";
    const fs = this.menpais.length == 0 ? "null" : this.menpais.map((p) => p.serialize()).join("+");
    const ps = this.position ? this.position : "null";
    const s = [String(this.type), ns, fs, ps].join(",");
    return s;
  }

  static deserialize(str: string) {
    const ss = str.split(",");
    if (ss.length != 4) throw new Error(`指定した文字列に誤りがあります:${str}`);
    const t = ss[0] as FulouType;
    const n = ss[1] == "null" ? null : Pai.deseriarize(ss[1]);
    const f = ss[2] == "null" ? [] : ss[2].split("+").map((fs) => Pai.deseriarize(fs));
    const p = ss[3] == "null" ? null : (ss[3] as Position);
    return new Fulou(t, n, f, p);
  }
}

export class Shoupai {
  bingpai;
  fulou: Fulou[] = [];
  zimopai;
  huleCandidates;
  fulouCandidates: Fulou[] = [];
  // position: Position;

  constructor(
    bingpai: Pai[] = [],
    zimopai: Pai | null = null,
    fulou: Fulou[] = [],
    huleCandidates: Pai[] = [],
    fulouCandidates: Fulou[] = []
  ) {
    this.bingpai = bingpai;
    fulou.forEach((f) => this.addFulou(f));
    this.zimopai = zimopai;
    this.huleCandidates = huleCandidates;
    this.fulouCandidates = fulouCandidates;
  }

  addPai(pai: Pai): void {
    this.zimopai = pai;
    this.zimoIntoBingpai();
  }

  setZimopai(pai: Pai): void {
    if (this.zimopai != null) {
      throw new Error(`ツモ牌がセットされています。与えられたツモ牌:${pai.serialize()},セット中のツモ牌：${this.zimopai.serialize()},`);
    }
    this.zimopai = pai;
  }

  getZimo() {
    if (this.zimopai == null) {
      throw new Error("zimo is None");
    }
    return this.zimopai;
  }

  static sortPai(pais: Pai[]): Pai[] {
    return pais.sort((a, b) => {
      if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
      if (a.num !== b.num) return a.num - b.num;
      return Number(a.isRed) - Number(b.isRed);
    });
  }

  removePaiFromZimopai() {
    if (this.zimopai != null) {
      const pai = this.zimopai;
      this.zimopai = null;
      return pai;
    } else {
      throw new Error("zimopai is None");
    }
  }

  removPaiFromBingpai(idx: number) {
    if (this.bingpai) {
      const pai = this.bingpai[idx];
      if (idx !== -1) this.bingpai.splice(idx, 1);
      return pai;
    } else {
      throw new Error("bingpai is not defined");
    }
  }

  removePai(isZimopai: boolean, index: number = -1): void {
    if (isZimopai) {
      this.removePaiFromZimopai();
    } else {
      this.removPaiFromBingpai(index);
    }
  }

  zimoIntoBingpai(): void {
    if (this.zimopai != null && this.bingpai) {
      this.bingpai.push(this.zimopai);
      this.removePaiFromZimopai();
    }
  }

  addFulou(fulou: Fulou) {
    this.fulou.unshift(fulou);
  }

  doFulou(fulou: Fulou) {
    if (fulou.type == "chi" || fulou.type == "minggang" || fulou.type == "peng" || fulou.type == "angang") {
      fulou.menpais.forEach((p) => {
        const idx = this.bingpai.findIndex((bp) => p.equals(bp));
        if (idx < 0) throw Error(`${fulou.type}ができません。次の牌がありません:${p}`);
        this.removPaiFromBingpai(idx);
      });
      this.addFulou(fulou);
    } else if (fulou.type == "jiagang") {
      const matchedFulouIndex = this.fulou.findIndex(
        (f) => f.type == "peng" && f.fuloupai && fulou.fuloupai && f.fuloupai.serialize()==fulou.fuloupai.serialize()
      );
      if (matchedFulouIndex < 0) throw Error(`${fulou.type}ができません。`);
      const matchedBingpaiIdx = [...this.bingpai, this.zimopai].findIndex(
        (bz) => bz && bz.equals(this.fulou[matchedFulouIndex].fuloupai!)
      );
      let pai;
      if (matchedBingpaiIdx < 0) {
        throw Error(`${fulou.type}ができません。`);
      } else if (matchedBingpaiIdx == this.bingpai.length) {
        pai = this.removePaiFromZimopai();
      } else {
        pai = this.removPaiFromBingpai(matchedBingpaiIdx);
      }
      const fuloupais = this.fulou[matchedFulouIndex].menpais;
      fuloupais.push(pai);

      const jiagangFulou = new Fulou(
        "jiagang",
        this.fulou[matchedFulouIndex].fuloupai,
        fuloupais,
        this.fulou[matchedFulouIndex].position
      );
      this.fulou[matchedFulouIndex] = jiagangFulou;
    }
  }

  getCandidatesbyType(types:FulouType[],fuloupai?:Pai|null){
    let fileteredFulouCandidates= this.fulouCandidates.filter(x=>types.includes(x.type))
    if (fuloupai!=null){
      fileteredFulouCandidates= fileteredFulouCandidates.filter(x=>["angang","jiagang"].includes(x.type) || x.fuloupai!.serialize().slice(0,1)==fuloupai.serialize().slice(0,1))
    }
    return fileteredFulouCandidates
    // const bingpai=[...this.bingpai,...(this.zimopai==null?[]:[this.zimopai])]
    // let fulouCandidateswithRed: Fulou[]=[]
    // fileteredFulouCandidates.forEach(f => {
    //   if (f.type=="jiagang") return
    //   if (bingpai.filter(x=>x.seriarize()===f.menpais[0].seriarize().slice(0,1)+"t")){
    //     fulouCandidateswithRed.push()
    //   }
    //   if (f.type=="chi"){
    //     f.menpais.forEach(p=>{
    //       bingpai.filter(x=>x.seriarize()===p.seriarize().slice(0,1)+"t")
    //     })
    //   }else if (["angang","peng","minggang"].includes(f.type)){

    //   }
    // });
    // return fileteredFulouCandidates
  }


}

export const useShoupai = (shoupai: Shoupai) => {
  const reactiveShoupai = ref(shoupai);

  return reactiveShoupai;
};

export const useFulou = (fulou: Fulou) => {
  const reactiveFulou = ref(fulou);

  return reactiveFulou;
};

export const createPais = (paiStrings: string[]): Pai[] => {
  return paiStrings
    .filter((p) => p.length >= 2)
    .map((p) => {
      const [num, suit, ...flags] = p.split("");
      const [isRed = false] = flags.map((f) => f === "t");
      return new Pai(suit as PaiSuit, Number(num), isRed);
    });
};
