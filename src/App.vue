<script setup lang="ts">
import { Score } from "@/models/score";
import { usePai, Pai } from '@/models/pai'
import { Board, GameStatus } from '@/models/board'
import BoardView from './components/Board.vue'
import TestComponentView from './components/TestComponent.vue'
import { Shoupai, createPais, Fulou } from "@/models/shoupai";

// fulou = [
//   new Fulou("peng", new Pai("z", 3), createPais(["3z", "3z"]), 'duimian'),
//   new Fulou("peng", new Pai("p", 3), createPais(["3p", "3p"]), 'xiajia'),
//   new Fulou("chi", new Pai("p", 1), createPais(["2p", "3p"]), 'shangjia'),
// ]
// canFulouList = [
//   new Fulou("chi", new Pai("s", 2), createPais(["1s", "3s"])),
// ]

</script>

<template>
  <main>
    <BoardView :board="new Board(
      new GameStatus('dapai', 'main', 'thinking')
      , new Score('東', '東', [new Pai('z', 7)])
      , [new Shoupai(createPais(['1m', '1m', '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '9m', '9m']), new Pai('s', 1))]
    )" />
  </main>
  <!-- <header v-if="!isStart">
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>

  </header>

  <main v-if="!isStart">
    <TheWelcome />
  </main> -->

</template>

<style scoped>
main {
  width: 800px;
  height: 680px;
  position: relative;
  background: #154;

}


header {
  line-height: 1.5;
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
