import { Server, WebSocket,type Client  } from "mock-socket";
export class GameContent {
  constructor(
    public action?: string,
    public turn?: string,
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
    public zhuangfeng?: string,
    public menfeng?: string,
    public jushu?: number,
    public jicun?: number,
    public changbang?: number,
    public defen?: number[],
    public baopai?: string[],
    public paishu?: number
  ) {}
}

export class GameMessage{
  constructor(
    public type:string,
    public game:GameContent
  ){}

  public static create(payload: Partial<GameContent>) {
    return new GameMessage(
      "game",payload
    );
  }

  // public static create(payload: Partial<GameContent>) {
  //   if(payload.turn=="")payload.turn=undefined
  //   if(payload.dapai=="")payload.dapai=undefined
  //   if(payload.baopai=="")payload.baopai=undefined
  //   if(payload.zimopai=="")payload.zimopai=undefined
  //   if(payload.fulou=="")payload.fulou=undefined
  //   if(payload.qipai=="")payload.qipai=undefined
  //   if(payload.fulouCandidates=="")payload.fulouCandidates=undefined
  //   if(payload.lizhipai)payload.lizhipai=undefined
  //   if(payload.hule)payload.hule=undefined
  //   return new GameMessage(
  //     "game",payload
  //   );
  // }
}

// export class GameMessage {
//     type: string;
//     game: { action: string | null,
//       turn: string | null,
//       dapai: string | null,
//       baopai: string | null,
//       zimopai: string | null,
//       fulou: string | null,
//       qipai: string|null,
//       fulouCandidates: string|null,
//       lizhipai: string|null,
//       hule: string|null
//     };
  
//     constructor(game:{
//       action?: string | null,
//       turn?: string | null,
//       dapai?: string | null,
//       baopai?: string | null,
//       zimopai?: string | null,
//       fulou?: string | null,
//       qipai?: string|null,
//       fulouCandidates?: string|null,
//       lizhipai?: string|null,
//       hule?: string|null,
//     }){
//       this.type="game",
//       this.game={
//         action: game.action??null,
//         turn:game.turn??null,
//         dapai: game.dapai??null,
//         baopai: game.baopai??null,
//         zimopai: game.zimopai??null,
//         fulou: game.fulou??null,
//         qipai:game.qipai??null,
//         fulouCandidates: game.fulouCandidates??null,
//         lizhipai:game.lizhipai??null,
//         hule:game.hule??null,
//       }
//     }
//   }

export const gameModule = (() => {
  const getScoreMessage = () => ({
    type: "score",
    score: {
      zhuangfeng: "東",
      menfeng: "東",
      jushu: 1,
      jicun: 0,
      changbang: 0,
      defen: [25000, 25000, 25000, 25000],
      baopai: ["m1f", "b0f", "b0f", "b0f", "b0f"],
      paishu: 70,
    },
  });
  const getNextPosition = (pos: string) => {
    const positions = ["main", "xiajia", "duimian", "shangjia", "main"];
    const nexIdx = positions.indexOf(pos) + 1;
    if (nexIdx == 0) throw new Error(`正しいポジションを指定してください.position:${pos}`);
    return positions[nexIdx];
  };
  return {
    getScoreMessage,
    getNextPosition,
  };
})();

export class ServerActions{
    server:Server
    zimoCounter:number=0
    zimoCountLimit:number=6

    constructor(localurl='ws://localhost:4173/'){
        this.server=new Server(localurl, { mock: false });
    }

    mockServer(serverurl:string="ws://127.0.0.1:8000/ws"){
        this.server=new Server(serverurl)
    }

    close(){
        if (this.server) this.server.close()
    }
}
