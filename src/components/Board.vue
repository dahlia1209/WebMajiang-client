<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect, watchPostEffect, watch } from 'vue'
import HelloWorld from './HelloWorld.vue'
import TheWelcome from './TheWelcome.vue'
import PaiView from './Pai.vue'
import ShoupaiView from './Shoupai.vue'
import HeView from './He.vue'
import ScoreView from './Score.vue'
import { usePai, Pai } from '@/models/pai'
import { type PaiSuit, type PlayerAction, type Position } from "@/models/type"
import { Shoupai, createPais, Fulou } from "@/models/shoupai";
import { Board, GameStatus, useBoard } from "@/models/board";
import { He } from "@/models/he";
import { Score } from "@/models/score";
import { MessageType, useWebSocketService, type WebSocketMessage, } from "@/services/webSocketService";
import { useGameStore } from '@/stores/game'

const props = defineProps<{
  board: Board,
}>()
const gameStore = useGameStore()
const client = useWebSocketService("ws://localhost:8000/ws")
const b = useBoard(props.board)
onMounted(() => {
  gameStore.game = props.board.gameStatus
  gameStore.score = props.board.score
})

const messageHandler = (msg: any) => {
  try {
    const m = msg as WebSocketMessage
    switch (m.type) {
      case MessageType.Game:
        const content = m.game
        const dapai = content.dapai ? new Pai(content.dapai[0] as PaiSuit, Number(content.dapai[1])) : null
        const zimo = content.zimopai ? new Pai(content.zimopai[0] as PaiSuit, Number(content.zimopai[1])) : null
        gameStore.game = new GameStatus(content.action, content.turn, content.status, dapai, zimo,)

        break;

      default:
        break;
    }
  } catch (error) {
    console.log("メッセージタイプが正しくありません", msg)
  }
}

watchEffect(() => {
  const msgs = client.messages.value
  messageHandler(msgs[msgs.length - 1])


})

const actionHandler = (payload: { action: PlayerAction, dapai?: Pai, fulou?: Fulou }) => {
  if (payload.action == "dapai" && payload.dapai) {
    gameStore.game.status = "ready"
    gameStore.game.dapai = payload.dapai
    client.sendSampleMessage("dapai done")
  }
}



// const update = () => {
//   console.log(client.messages.value)
//   client.messages.value.push({ "type": "message", "msg": `Msg No ${client.messages.value.length}` } as SimpleMessage)
// }

</script>

<template>
  <HeView v-for="(p, i) in (['main', 'xiajia', 'duimian', 'shangjia'] as Position[])" :he="(b.he[i] as He)"
    :position="p"
    :class="[{ 'main-he': p == 'main' }, { 'xiajia-he': p == 'xiajia' }, { 'duimian-he': p == 'duimian' }, { 'shangjia-he': p == 'shangjia' }, 'component']" />
  <ShoupaiView v-for="(p, i) in (['main', 'xiajia', 'duimian', 'shangjia'] as Position[])"
    :shoupai="(b.shoupai[i] as Shoupai)" :position="p" @action="actionHandler"
    :class="[{ 'main-shoupai': p == 'main' }, { 'xiajia-shoupai': p == 'xiajia' }, { 'duimian-shoupai': p == 'duimian' }, { 'shangjia-shoupai': p == 'shangjia' }, 'component']" />
  <ScoreView :score="new Score()" class="score component" />
</template>

<style scoped>
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
