<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect, watchPostEffect, watch, computed } from 'vue'
import { usePai, Pai } from '@/models/pai'
import { type PaiSuit, type PlayerAction, type Position } from "@/models/type"
import { Shoupai, createPais, Fulou } from "@/models/shoupai";
import { WebSocketMsg } from "@/models/websocket";
import { useGameStore } from '@/stores/game'
import { useWebSocketStore } from '@/stores/websocket'

const gameStore = useGameStore()
const wsStore = useWebSocketStore();

onMounted(() => {
  wsStore.client.open()
})

const messageHandler = (wsm: WebSocketMsg) => {
  //サブ関数
  const gameMessageProcess=()=>{
    console.log("clientonmessage,game",wsm)
    const gcm=wsm.gameFormat!
    gameStore.game=gcm
  }

  const scoreMessageProcess=()=>{
    console.log("clientonmessage,score",wsm)
    const gs=wsm.score!
        gameStore.score.update({
          baopai: gs.baopai ? gs.baopai.map(ps => Pai.deserialize(ps)) : undefined,
          zhuangfeng: gs.zhuangfeng ?? undefined,
          menfeng: gs.menfeng ?? undefined,
          changbang: gs.changbang ?? undefined,
          defen: gs.defen ?? undefined,
          jicun: gs.jicun ?? undefined,
          jushu: gs.jushu ?? undefined,
          paishu: gs.paishu ?? undefined,
        })
  }

  //メイン処理
  if (wsm.type=="game") gameMessageProcess()
  else if (wsm.type=="score") scoreMessageProcess()
}

watch([
  wsStore.client.msgs,
], (
  [newa,],
  [olda,]
) => {
  //メッセージの受信
  const msg = wsStore.client.msgs.shift() as WebSocketMsg
  if (msg==null) return
  messageHandler(msg)
})

</script>
