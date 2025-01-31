import { ref, onMounted, onUnmounted, computed } from "vue";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import { Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";
import { GameStatus } from "@/models/board";

// メッセージ型
export enum MessageType {
  Message = "message",
  GameStart = "game_start",
  GameEnd = "game_end",
  Action = "player_action",
  Score = "score",
  Game = "game",
}

export interface SimpleMessage extends BaseMessage {
  type: MessageType.Message;
  msg: string;
}

export interface ScoreMessage extends BaseMessage {
  type: MessageType.Score;
  score: {
    zhuangfeng?: Feng;
    menfeng?: Feng;
    jushu?: number;
    jicun?: number;
    changbang?: number;
    defen?: number[];
    baopai?: string[];
    paishu?: number;
  };
}

export interface GameMessage extends BaseMessage {
  type: MessageType.Game;
  game: {
    action: PlayerAction | null;
    turn: Position | null;
    dapai: string | null;
    zimopai: string | null;
    fulou: string | null;
    qipai: string|null;
    fulouCandidates: string|null;
    lizhipai: string|null;
    hule: string|null;
  };
}

export const validateDapai=(dapai:string)=>{
  const splitDapaiStrings=dapai.split(",")
  try {
    if (splitDapaiStrings.length!=2 || typeof splitDapaiStrings[0] != "string" || typeof Number(splitDapaiStrings[1]) != "number"  ){
      throw new Error(`メッセージが正しくありません.[打牌,牌番号]形式にしてください. dapai:${dapai}`)
    }
    return {dapai:Pai.deserialize(splitDapaiStrings[0]),dapaiIdx:Number(splitDapaiStrings[1])}
   
  } catch (error) {
    return null
  }
}

export type WebSocketMessage = SimpleMessage | ScoreMessage | GameMessage;
interface BaseMessage {
  type: MessageType;
}

export interface callbackProperty{
  action?: PlayerAction,
  turn?:Position, 
  dapai?: Pai, 
  hule?: Pai, 
  dapaiIdx?: number, 
  fulou?: Fulou,
  lizhipai?:Pai
}

export const useWebSocketService = (connectionUrl: string) => {
  const url = connectionUrl;
  const socket = ref<null | WebSocket>(null);
  const messages = ref<WebSocketMessage[]>([]);

  const open = () => {
    if (socket.value != null &&  socket.value.readyState!=3) return
    socket.value = new WebSocket(url);
    socket.value.onopen = handleonopen;
    socket.value.onmessage = handleWebSocketMessage; //イベントリスナーの登録
  };

  const close = () => {
    if (socket.value) {
      socket.value.close();
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open.");
    }
  };

  const handleonopen = () => {
    callbackMessage({action:"kaiju"})
    console.log("websocket open");
  };

  //メッセージ受信時のハンドル
  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const message = parseWebSocketMessage(event);
      switch (message.type) {
        case MessageType.Score:
          const b = annotation<ScoreMessage>(event);
          messages.value.push(b);
          break;
        case MessageType.Message:
          const xyz = annotation<SimpleMessage>(event);
          messages.value.push(xyz);
          break;
        case MessageType.Game:
          const gm = annotation<GameMessage>(event);
          messages.value.push(gm);
          break;
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  };

  //メッセージの型解析
  const parseWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (isBaseMessage(data)) {
        return data;
      } else {
        throw new Error("Unknown message type");
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
      throw error;
    }
  };

  // 型ガード関数
  const isBaseMessage = (data: any): data is BaseMessage => {
    return typeof data === "object" && data !== null && Object.values(MessageType).includes(data.type);
  };

  const annotation = <T>(event: MessageEvent) => {
    const parse = JSON.parse(event.data);
    return parse as T;
  };

  //メッセージ送信関数
  const sendSampleMessage = (message: string) => {
    const format: SimpleMessage = {
      type: MessageType.Message,
      msg: message,
    };
    sendMessage(format);
  };

  const initGameMessage=( type: MessageType,game?: {
      action?: PlayerAction,
      turn?: Position ,
      status?: PlayerStatus ,
      dapai?: string ,
      zimopai?: string ,
      fulou?: string ,
      qipai?: string,
      fulouCandidates?:string,
      lizhipai?:string,
      hule?:string,
      
    })=>{
      const gameMessage={
          type:type,
          game:{
            action:game && game.action ? game.action:null,
            turn: game && game.turn ? game.turn:null,
          status: game && game.status ? game.status:null,
          dapai: game && game.dapai ? game.dapai:null,
          zimopai: game && game.zimopai ? game.zimopai:null,
          fulou: game && game.fulou ? game.fulou:null,
          qipai: game && game.qipai ? game.qipai:null,
          fulouCandidates:game && game.fulouCandidates?game.fulouCandidates:null,
          lizhipai:game && game.lizhipai?game.lizhipai:null,
          hule:game && game.hule?game.hule:null,
          }
        } as GameMessage
        return gameMessage
    }

  const callbackMessage = (cb?:callbackProperty) => {
    const action=cb && cb.action ? cb.action:undefined
    const turn=cb && cb.turn ? cb.turn:undefined
    const fulou=cb && cb.fulou ? cb.fulou.serialize():undefined
    const hule=cb && cb.hule ? cb.hule.serialize():undefined
    const dapai=cb && cb.dapai && cb.dapaiIdx!=null ? [cb.dapai.serialize(),cb.dapaiIdx.toString()].join(","):undefined
    const lizhipai=cb && cb.lizhipai && cb.dapaiIdx!=null ? [cb.lizhipai.serialize(),cb.dapaiIdx.toString()].join(","):undefined
    const format=initGameMessage(MessageType.Game,{action,fulou,dapai,lizhipai,turn,hule})
    // const format: GameMessage = {
    //   type: MessageType.Game,
    //   game: {
        // action:cb && cb.action ? cb.action:null,
        // fulou:cb && cb.fulou ? cb.fulou.serialize():null,
        // dapai:cb && cb.dapai ? cb.dapai.seriarize():null,
    //   },
    // };
    sendMessage(format);
  };

  onMounted(() => {
    open();
  });
  onUnmounted(() => {
    close();
  });

  //レスポンス
  const client = {
    messages,
    sendSampleMessage,
    callbackMessage,
    open,
    close,
    handleWebSocketMessage,
  };
  return client;
};
