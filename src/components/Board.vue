<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect, watchPostEffect, watch, computed } from 'vue'
import ShoupaiView from './Shoupai.vue'
import HeView from './He.vue'
import ScoreView from './Score.vue'
import HuleView from './Hule.vue'
import WebsocketHandler from './WebsocketHandler.vue'
import { type PaiSuit, type PlayerAction, type Position } from "@/models/type"
import { Shoupai, createPais, Fulou } from "@/models/shoupai";
import { Board, useBoard } from "@/models/board";
import { He } from "@/models/he";
import { Score } from "@/models/score";
import { useGameStore } from '@/stores/game'
import { useWebSocketStore } from '@/stores/websocket'

const props = defineProps<{
  board: Board,
}>()
const gameStore = useGameStore()
const wsStore = useWebSocketStore();
const b = useBoard(props.board)
onMounted(() => {
  wsStore.client.open()
  gameStore.game = props.board.gameStatus
  gameStore.score = props.board.score
})
const isHule=computed(()=>gameStore.getAction=="pingju" || gameStore.getAction=="hule")
const scaleSize=computed(()=>Math.min(gameStore.windowWidth/2000,0.45))

watch([
  () => gameStore.getAction
], (
  [currentStatus],
  [previousStatus]
) => {
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
  <div :class="[gameStore.getIsMobile?'sp-display':'pc-display']">
    <WebsocketHandler />
    <HeView v-for="(p, i) in (['main', 'xiajia', 'duimian', 'shangjia'] as Position[])" :he="(b.he[i] as He)"
      :position="p"
      :class="[{ 'main-he': p == 'main' }, { 'xiajia-he': p == 'xiajia' }, { 'duimian-he': p == 'duimian' }, { 'shangjia-he': p == 'shangjia' }, 'component']" />
    <ShoupaiView v-for="(p, i) in (['main', 'xiajia', 'duimian', 'shangjia'] as Position[])"
      :shoupai="(b.shoupai[i] as Shoupai)" :position="p"
      :class="[{ 'main-shoupai': p == 'main' }, { 'xiajia-shoupai': p == 'xiajia' }, { 'duimian-shoupai': p == 'duimian' }, { 'shangjia-shoupai': p == 'shangjia' }, 'component']"/>
    <ScoreView :score="new Score()" class="score component" />
    <HuleView v-if="isHule" />
  </div>
</template>

<style scoped>
.pc-display {
  position: relative;
  background: #154;
  max-width: 800px;
  max-height: 680px;
  width: 100vw; 
  height: 100vw;
  margin-left: auto;
  margin-right: auto;
}

.sp-display {
  position: relative;
  background: #154;
  width: 100vw; 
  height: 100vw;
}


.shoupai {
  display: flex;
  width: auto;
  zoom: v-bind('scaleSize');
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

.title-container {
    position: relative;
    width: 800px;
    height: 680px;
}

.sp-title-container {
    position: relative;
    width: 100%;
}

</style>
