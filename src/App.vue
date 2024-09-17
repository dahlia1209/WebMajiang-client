<script setup lang="ts">
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import PaiView from './components/Pai.vue'
import ShoupaiView from './components/Shoupai.vue'
import { usePai, Pai } from '@/models/pai'
import { type PaiSuit } from "@/models/type"
import { useShoupai, Shoupai, createPais, Fulou } from "@/models/shoupai";
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
gameStore.action = "打牌"
gameStore.status = "ready"
gameStore.turn = "xiajia"
gameStore.dapai = new Pai('m', 3)

let bingpai: Pai[];
let zimo: Pai;
let fulou: Fulou[];
let waitingFulouPai: Fulou[];
let waitingHulePai: Pai[];
bingpai = createPais(['1s', '3m', '3m', '3z'])
// bingpai = createPais(['1m', '2m','3m','4m','5m','6m','7m','8m','9m','1p','1p','3p','4p',])
// zimo = new Pai('z', 3)
fulou = [
  new Fulou("peng", new Pai("z", 3), createPais(["3z", "3z"]), 'duimian'),
  new Fulou("peng", new Pai("p", 3), createPais(["3p", "3p"]), 'xiajia'),
  new Fulou("chi", new Pai("p", 1), createPais(["2p", "3p"]), 'shangjia'),
]
waitingFulouPai = [
  new Fulou("jiagang", new Pai("z", 3), createPais(["3z", "3z", "3z"])),
]
gameStore.waitingFulouPai = waitingFulouPai
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
    <ShoupaiView :shoupai="new Shoupai('main', bingpai, zimo, fulou, waitingHulePai, waitingFulouPai)" />
  </main>
</template>

<style scoped>
main {
  width: 100%;
}

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
