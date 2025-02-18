import { ref, onMounted, onUnmounted, computed } from "vue";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import { Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";
import { WebSocketMsg,GameContentFormat } from "@/models/websocket";

export const useWebSocketService = (connectionUrl: string) => {
  const url = connectionUrl;
  const socket = ref<null | WebSocket>(null);
  // const messages = ref<WebSocketMessage[]>([]);
  const msgs = ref<WebSocketMsg[]>([]);

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

  const sendMessage = (message: WebSocketMsg) => {
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
    const data = JSON.parse(event.data)
    try {
      if (data.hasOwnProperty('type') && ['game','score'].includes(data.type)) {
        const wsm =WebSocketMsg.deserialize(event.data)
        msgs.value.push(wsm)
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  };

  const callbackMessage = (cb?:Partial<GameContentFormat>) => {
    const gcf=GameContentFormat.create(cb)
    const wsm=new WebSocketMsg("game",gcf.toGameContent())
    wsm.score=undefined;wsm.gameFormat=undefined;
    sendMessage(wsm);
  };

  onMounted(() => {
    open();
  });
  onUnmounted(() => {
    close();
  });

  //レスポンス
  const client = {
    msgs,
    callbackMessage,
    open,
    close,
    handleWebSocketMessage,
  };
  return client;
};
