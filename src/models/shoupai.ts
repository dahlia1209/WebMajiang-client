import { ref, onMounted, onUnmounted } from "vue";
import { Pai } from "./pai";
import { type PaiSuit } from "./type";
import { v4 as uuidv4 } from "uuid";
import { type Position } from "@/models/type";

export type FulouType = "chi" | "peng" | "minggang" | "angang" | "jiagang";
export type PaiIdx = [ Pai,number];
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
    const n = ss[1] == "null" ? null : Pai.deserialize(ss[1]);
    const f = ss[2] == "null" ? [] : ss[2].split("+").map((fs) => Pai.deserialize(fs));
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

  doLipai() {
    const sortedPai = [...this.bingpai, ...(this.zimopai == null ? [] : [this.zimopai])];
    sortedPai.sort((a, b) => a.serialize().localeCompare(b.serialize()));

    this.zimopai = null;
    this.bingpai = sortedPai;
  }

  doDapai(dapai: Pai, dapaiIdx: number, validation: boolean) {
    if (validation) this.checkDapai(dapai, dapaiIdx);

    if (0 <= dapaiIdx && dapaiIdx < this.bingpai.length) {
      this.bingpai = this.bingpai.filter((x, i) => i != dapaiIdx);
    } else if (dapaiIdx == 99) {
      this.zimopai = null;
    }
  }

  private checkDapai(dapai: Pai, dapaiIdx: number) {}

  addPai(pai: Pai): void {
    this.zimopai = pai;
    this.zimoIntoBingpai();
  }

  setZimopai(pai: Pai): void {
    if (this.zimopai != null) {
      throw new Error(
        `ツモ牌がセットされています。与えられたツモ牌:${pai.serialize()},セット中のツモ牌：${this.zimopai.serialize()},`
      );
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

  _getRemovedBingpai(tar:Pai[]){
    const bingpaiStrs=this.getBingpai().map(([p])=>p.serialize())
    const tarStrs=tar.map(x=>x.serialize())
    tarStrs.forEach(ts=>{
      const idx=bingpaiStrs.findIndex(bs=>bs===ts)
      if (idx !== -1) {
          bingpaiStrs.splice(idx, 1);
      }else{
        throw Error(`手牌に次の牌がありません:${ts}`); 
      }
    })

    return bingpaiStrs.map(x=>Pai.deserialize(x))
  }

  _processFulouCommon(fulou: Fulou) {
    
    this.bingpai=this._getRemovedBingpai(fulou.menpais)
    this.zimopai=null
    this.fulou.unshift(fulou)
    

  }

  _processJiagang(fulou: Fulou) {
    if (fulou.fuloupai==null) throw Error(`加槓の副露牌が指定されていません,fulou:${fulou.serialize()}`);
    const fulou_idx=this.fulou.findIndex((f)=>f.type=="peng" && f.menpais[0].serialize(2)==fulou.menpais[0].serialize(2))
    if (fulou_idx==-1) throw Error(`加槓のポンがありません。`)
    const peng=Fulou.deserialize(this.fulou[fulou_idx].serialize())
    const jiagangpai=this.getBingpai().map(([pai])=>pai).filter(pai=>pai.serialize(2)==fulou.menpais[0].serialize(2))
    if (jiagangpai.length!=1) throw Error(`加槓牌が手牌にないか、複数存在します`)
    const jiagang=Fulou.deserialize(`jiagang,${peng.fuloupai!.serialize()},${peng.menpais.map(x=>x.serialize()).join("+")},${peng.position}`)
    jiagang.menpais.push(jiagangpai[0])
    this.fulou[fulou_idx]=jiagang
    this.bingpai=this._getRemovedBingpai(jiagangpai)
    this.zimopai=null
  }


  doFulou(fulou: Fulou) {
    
    const processes={
      chi:() =>this._processFulouCommon(fulou),
      peng:() =>this._processFulouCommon(fulou),
      minggang:() =>this._processFulouCommon(fulou),
      angang:() =>this._processFulouCommon(fulou),
      jiagang:() =>this._processJiagang(fulou),
    }
    processes[fulou.type]();

  }

  getFulouCandidates(type?: FulouType, fuloupai?: Pai) {
    let fulouCandidates=this.fulouCandidates.map(x=>x)
    if (type==null) return fulouCandidates
    fulouCandidates=fulouCandidates.filter(x=>x.type==type)
    if (fuloupai==null) return fulouCandidates
    fulouCandidates=fulouCandidates.filter(x=>x.fuloupai!=null && x.fuloupai.serialize(2)==fuloupai.serialize(2))
    return fulouCandidates
  }

  reset() {
    const shoupai = new Shoupai();
    Array(13).map((_) => this.bingpai.push(Pai.deserialize("b0")));
    this.fulou = shoupai.fulou;
    this.zimopai = shoupai.zimopai;
    this.huleCandidates = shoupai.huleCandidates;
    this.fulouCandidates = shoupai.fulouCandidates;
  }

  getBingpai() {
    const bingpai = [
      ...this.bingpai.map((x, i) => [Pai.deserialize(x.serialize()), i] as PaiIdx), //bingpai
      ...(this.zimopai == null ? [] : [[Pai.deserialize(this.zimopai.serialize()), 99] as PaiIdx]), //zimopai
    ];
    return bingpai;
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
