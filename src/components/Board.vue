<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect, watchPostEffect, watch, computed } from 'vue'
import ShoupaiView from './Shoupai.vue'
import HeView from './He.vue'
import ScoreView from './Score.vue'
import HuleView from './Hule.vue'
import { usePai, Pai } from '@/models/pai'
import { type PaiSuit, type PlayerAction, type Position } from "@/models/type"
import { Shoupai, createPais, Fulou } from "@/models/shoupai";
import { Board, GameStatus, useBoard } from "@/models/board";
import { He } from "@/models/he";
import { Score } from "@/models/score";
import { MessageType, useWebSocketService, type WebSocketMessage, type callbackProperty,validateDapai } from "@/services/webSocketService";
import { useGameStore } from '@/stores/game'
import { useWebSocketStore } from '@/stores/websocket'
// import { useScoreStore } from '@/stores/score'

const props = defineProps<{
  board: Board,
}>()
const gameStore = useGameStore()
const wsStore = useWebSocketStore();
// const scoreStore = useScoreStore();
const b = useBoard(props.board)
onMounted(() => {
  wsStore.client.open()
  gameStore.game = props.board.gameStatus
  gameStore.score = props.board.score
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
        const glp = gc.lizhiPai == null ? [] : gc.lizhiPai.split("+").map(x => Pai.deserialize(x))
        
        gameStore.game=new GameStatus({ action: gc.action, turn: gc.turn, dapai: gd, dapaiIdx:gdi,zimopai: gz, fulou: gf, qipai: gq,fulouCandidates:gfc,lizhiPai:glp })
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

const isHule=computed(()=>gameStore.getAction=="pingju" || gameStore.getAction=="hule")

watch([
  wsStore.client.messages,
  () => gameStore.getAction
], (
  [newa,currentStatus],
  [olda,previousStatus]
) => {
  //メッセージの受信
  const msg = wsStore.client.messages.shift()
  messageHandler(msg)

  //流局
  if (currentStatus=="pingju") {
    // wsStore.client.callbackMessage({ action: "pingju" })
  }
  //終局
  else if (currentStatus=="jieju") {
    gameStore.settings.mode=0
  }


})

</script>

<template>
  <HeView v-for="(p, i) in (['main', 'xiajia', 'duimian', 'shangjia'] as Position[])" :he="(b.he[i] as He)"
    :position="p"
    :class="[{ 'main-he': p == 'main' }, { 'xiajia-he': p == 'xiajia' }, { 'duimian-he': p == 'duimian' }, { 'shangjia-he': p == 'shangjia' }, 'component']" />
  <ShoupaiView v-for="(p, i) in (['main', 'xiajia', 'duimian', 'shangjia'] as Position[])"
    :shoupai="(b.shoupai[i] as Shoupai)" :position="p" 
    :class="[{ 'main-shoupai': p == 'main' }, { 'xiajia-shoupai': p == 'xiajia' }, { 'duimian-shoupai': p == 'duimian' }, { 'shangjia-shoupai': p == 'shangjia' }, 'component']"/>
  <ScoreView :score="new Score()" class="score component" />
  <HuleView v-if="isHule" />
</template>

<style scoped>
.shoupai {
  display: flex;
  width: auto;
  zoom: 0.45;
}

.component {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}

.score {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.main-shoupai {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.xiajia-shoupai {
  width: 100px;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  transform: rotate(-90deg);
  white-space: nowrap;
}

.duimian-shoupai {
  width: 100px;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  transform: rotate(-180deg);
  white-space: nowrap;
}

.shangjia-shoupai {
  width: 100px;
  top: 50%;
  left: 20px;
  transform: translateX(-50%);
  transform: rotate(-270deg);
  white-space: nowrap;
}

.main-he {
  bottom: 250px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.xiajia-he {
  width: 100px;
  top: 40%;
  right: 350px;
  transform: translateY(-50%);
  transform: rotate(-90deg);
  white-space: nowrap;
}

.duimian-he {
  width: 100px;
  top: 250px;
  left: 50%;
  transform: translateX(-50%);
  transform: rotate(-180deg);
  white-space: nowrap;
}

.shangjia-he {
  width: 100px;
  top: 40%;
  left: 350px;
  transform: translateX(-50%);
  transform: rotate(-270deg);
  white-space: nowrap;
}


.logo {
  display: block;
  margin: 0 auto 2rem;
}

.start {
  font-weight: 500;
  font-size: 2.6rem;
  cursor: pointer;
  user-select: none;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
    flex-direction: column
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
