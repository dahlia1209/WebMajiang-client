<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect, watchPostEffect, watch, computed } from 'vue'
import { usePai, Pai } from '@/models/pai'
import { type PaiSuit, type PlayerAction, type Position } from "@/models/type"
import { Shoupai, createPais, Fulou } from "@/models/shoupai";
import { Board, GameStatus, useBoard } from "@/models/board";
import { MessageType, useWebSocketService, type WebSocketMessage, type callbackProperty,validateDapai } from "@/services/webSocketService";
import { useGameStore } from '@/stores/game'
import { useWebSocketStore } from '@/stores/websocket'

const gameStore = useGameStore()
const wsStore = useWebSocketStore();

onMounted(() => {
  wsStore.client.open()
})

const messageHandler = (msg: any) => {
  if (!msg) return
  try {
    const m = msg as WebSocketMessage
    switch (m.type) {
      case MessageType.Game:
        console.log("clientonmessage,game",m)
        const gc = m.game
        const gdv=gc.dapai== null ? gc.dapai : validateDapai(gc.dapai) 
        const gd = gdv== null ?null : gdv.dapai 
        const gdi = gdv== null ?null : gdv.dapaiIdx
        const gz = gc.zimopai == null ? gc.zimopai : new Pai(gc.zimopai[0] as PaiSuit, Number(gc.zimopai[1]))
        const gf = gc.fulou == null ? gc.fulou : Fulou.deserialize(gc.fulou)
        const gq = gc.qipai == null ? [] : gc.qipai.split("+").map(x => Pai.deserialize(x))
        const gfc = gc.fulouCandidates == null ? [] : gc.fulouCandidates.split("|").map(x => Fulou.deserialize(x))
        const glp = gc.lizhipai == null ? [] : gc.lizhipai.split("+").map(x => Pai.deserialize(x))
        const gh = gc.hule == null ? [] : gc.hule.split("+").map(x => Pai.deserialize(x))
        
        gameStore.game=new GameStatus({ action: gc.action, turn: gc.turn, dapai: gd, dapaiIdx:gdi,zimopai: gz, fulou: gf, qipai: gq,fulouCandidates:gfc,lizhipai:glp,hule:gh })
        break;
      case MessageType.Score:
      console.log("clientonmessage,score",m)
        gameStore.score.update({
          baopai: m.score.baopai ? m.score.baopai.map(ps => Pai.deserialize(ps)) : undefined,
          zhuangfeng: m.score.zhuangfeng ?? undefined,
          menfeng: m.score.menfeng ?? undefined,
          changbang: m.score.changbang ?? undefined,
          defen: m.score.defen ?? undefined,
          jicun: m.score.jicun ?? undefined,
          jushu: m.score.jushu ?? undefined,
          paishu: m.score.paishu ?? undefined,
        })
        break;
      default:
        break;
    }
  } catch (error) {
    console.log("メッセージが正しくありません", msg)
  }
}

watch([
  wsStore.client.messages,
], (
  [newa,],
  [olda,]
) => {
  //メッセージの受信
  const msg = wsStore.client.messages.shift()
  messageHandler(msg)
})

</script>
