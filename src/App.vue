<script setup lang="ts">
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import PaiView from './components/Pai.vue'
import ShoupaiView from './components/Shoupai.vue'
import HeView from './components/He.vue'
import { usePai, Pai } from '@/models/pai'
import { type PlayerAction } from "@/models/type"
import {  Shoupai, createPais, Fulou } from "@/models/shoupai";
import { He } from "@/models/he";
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
gameStore.action = "dapai"
gameStore.status = "thinking"
gameStore.turn = "main"
gameStore.zimopai = new Pai('s', 2)

let bingpai: Pai[];
let zimo: Pai=new Pai("s", 3);
let fulou: Fulou[];
let canFulouList: Fulou[];
let waitingHulePai: Pai[];
bingpai = createPais(['1m', '2m', '3m', '4m'])
fulou = [
  new Fulou("peng", new Pai("z", 3), createPais(["3z", "3z"]), 'duimian'),
  new Fulou("peng", new Pai("p", 3), createPais(["3p", "3p"]), 'xiajia'),
  new Fulou("chi", new Pai("p", 1), createPais(["2p", "3p"]), 'shangjia'),
]
canFulouList = [
  // new Fulou("chi", new Pai("s", 2), createPais(["1s", "3s"])),
]
gameStore.canFulouList = canFulouList

const actionHandler = (payload: { action: PlayerAction, dapai?: Pai, fulou?: Fulou }) => {
  if(payload.action=="dapai" && payload.dapai){
    gameStore.status = "ready"
    gameStore.dapai=payload.dapai
  }
}
</script>

<template>
  <!-- <header v-if="!isStart">
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>

  </header>

  <main v-if="!isStart">
    <TheWelcome />
  </main> -->

  <main>
    <!-- <HeView :he="new He(createPais(['1m','2m','3m','4m','5m','6m','7m','8m','9m','1s','2s','3s','4s','5s','6s','7s','8s','9s']))" :position="'shangjia'"/> -->
    <HeView :he="new He(createPais(['1m','2m','3m','4m','5m','6m','7m','8m','9m','1s','2s','3s','4s','5s','6s','7s','8s','9s']))" :position="'main'"/>
    <!-- <ShoupaiView :shoupai="new Shoupai(bingpai, zimo, fulou, waitingHulePai, canFulouList)" :position="'main'"
      @action="actionHandler" /> -->
  </main>
</template>

<style scoped>
main {}

header {
  line-height: 1.5;
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
