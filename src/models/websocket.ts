import {type MessageType,type PlayerAction,type Position,type Feng} from './type'
import { Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";


export class GameContent {
  constructor(
    public action: PlayerAction,
    public turn?: Position,
    public dapai?: string,
    public baopai?: string,
    public zimopai?: string,
    public fulou?: string,
    public qipai?: string,
    public fulouCandidates?: string,
    public lizhipai?: string,
    public hule?: string
  ) {}
}

export class ScoreContent {
  constructor(
    public zhuangfeng?: Feng,
    public menfeng?: Feng,
    public jushu?: number,
    public jicun?: number,
    public changbang?: number,
    public defen?: number[],
    public baopai?: string[],
    public paishu?: number
  ) {}
}

export class GameContentFormat{
    constructor(
        public action?: PlayerAction,
        public turn?: Position,
        public dapai?: Pai,
        public dapaiIdx?: number,
        public baopai?: Pai,
        public zimopai?: Pai,
        public fulou?: Fulou,
        public fulouCandidates: Fulou[]=[],
        public qipai: Pai[]=[],
        public lizhipai: Pai[]=[],
        public hule: Pai[]=[]
      ) {
        
      }    
    
      public static create(payload?: Partial<GameContentFormat>): GameContentFormat {
        return new GameContentFormat(
            payload?.action,
            payload?.turn,
            payload?.dapai,
            payload?.dapaiIdx,
            payload?.baopai,
            payload?.zimopai,
            payload?.fulou,
            payload?.fulouCandidates ?? [],
            payload?.qipai ?? [],
            payload?.lizhipai ?? [],
            payload?.hule ?? []
        );
    }

    toGameContent(){
        return new GameContent(
            this.action ?? "kaiju",
            this.turn,
            this.dapai && this.dapaiIdx!=null ? `${this.dapai.serialize()},${this.dapaiIdx}` :undefined,
            this.baopai ? this.baopai.serialize():undefined,
            this.zimopai ? this.zimopai.serialize():undefined,
            this.fulou?this.fulou.serialize():undefined,
            this.qipai.length>0 ?this.qipai.map(x=>x.serialize()).join("+"):undefined,
            this.fulouCandidates.length>0?this.fulouCandidates.map(x=>x.serialize()).join("|"):undefined,
            this.lizhipai.length>0 ?this.lizhipai[0].serialize():undefined,
            this.hule.length>0?this.hule.map(x=>x.serialize()).join("+"):undefined,
        )
    }
}


export class WebSocketMsg {
  constructor(
    public type: MessageType, 
    public game?: GameContent, 
    public score?: ScoreContent,
    public gameFormat?:GameContentFormat
) {
    this._validateInstance();
  }

  _validateInstance() {
    //サブ関数
    const gameProcess = () => {
      if (this.game == null) throw  new Error(`ゲームメッセージがセットされていません`);
      if (this.gameFormat ==null) this.gameFormat=new GameContentFormat()
      if (this.game.action) this.gameFormat.action=this.game.action;
      if (this.game.turn) this.gameFormat.turn=this.game.turn;
      if (this.game.dapai) {const validatedDapai=this._validateDapai(this.game.dapai);this.gameFormat.dapai=validatedDapai.dapai;this.gameFormat.dapaiIdx=validatedDapai.dapaiIdx;}
      if (this.game.baopai) this.gameFormat.baopai=this._validatePai(this.game.baopai);
      if (this.game.zimopai) this.gameFormat.zimopai=this._validatePai(this.game.zimopai);
      if (this.game.fulou) this.gameFormat.fulou=this._validateFulou(this.game.fulou);
      if (this.game.fulouCandidates) this.gameFormat.fulouCandidates=this._validateFulouCandidates(this.game.fulouCandidates);
      if (this.game.qipai) this.gameFormat.qipai=this._validatePais(this.game.qipai);
      if (this.game.lizhipai) this.gameFormat.lizhipai=this._validatePais(this.game.lizhipai);
      if (this.game.hule) this.gameFormat.hule=this._validatePais(this.game.hule);
    };

    const scoreProcess = () => {
      if (this.score == null) throw  new Error(`スコアメッセージがセットされていません`);
    };

    //メイン処理
    if (this.type == "game") gameProcess();
    else if (this.type == "score") scoreProcess();
    else throw new Error(`メッセージタイプが正しくありません,type:${this.type}`);

    return this
  }

  _validatePai(pai: string) {
    return Pai.deserialize(pai) 
  }

  _validatePais(paisstr: string) {
    return paisstr.split("+").map(x => Pai.deserialize(x)) 
  }

  _validateFulou(fulou: string) {
    return Fulou.deserialize(fulou)
  }

  _validateFulouCandidates(fulouCandidates: string) {
    return fulouCandidates.split("|").map(x => Fulou.deserialize(x))
  }

  _validateDapaiIdx(idx:number){
    if ([
        0<=0 && idx<13,
        idx==99
    ].every(x=>x==false)){
        throw new Error(`打牌番号が正しくありません,idx:${idx}`)
    }
    return idx
  }

  _validateDapai(dapaistr: string) {
    try {
        const splitDapaiStrings = dapaistr.split(",");
        const dapai=this._validatePai(splitDapaiStrings[0])
        const dapaiIdx=this._validateDapaiIdx(Number(splitDapaiStrings[1]))
        return {
            dapai,
            dapaiIdx
        };
    } catch (error) {
        throw new Error(`メッセージが正しくありません.[打牌,牌番号]形式にしてください. dapai:${dapaistr},error:${error}`);
    }
  }

  public static deserialize(json:string){
    try {
        const data=JSON.parse(json) as WebSocketMsg
        const websocketmsg=new WebSocketMsg(data.type,data.game,data.score)
        return websocketmsg
    } catch (error) {
        throw new Error(`エラーが発生しました.json:${json},error:${error}`)
    }
  }
}
