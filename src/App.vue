<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import { Score } from "@/models/score";
import { usePai, Pai } from '@/models/pai'
import { Board } from '@/models/board'
import { Settings } from '@/models/settings'
import BoardView from './components/Board.vue'
import TitleView from './components/Title.vue'
import TestComponentView from './components/TestComponent.vue'
import { Shoupai, createPais, Fulou } from "@/models/shoupai";
import { useGameStore } from '@/stores/game'
const selectedMode=ref(0)
const gameStore = useGameStore()


onMounted(()=>{
  gameStore.updateInnerWidth()
  window.addEventListener('resize', gameStore.updateInnerWidth)
})

onUnmounted(()=>{
  window.removeEventListener('resize',gameStore.updateInnerWidth)
})

</script>

<template>
  <main :class="[gameStore.getIsMobile?'sp-display':'pc-display']">
    <TitleView v-if="gameStore.settings.mode==0" :title="new Settings()" />
    <BoardView v-else-if="gameStore.settings.mode==1" :board="new Board()" />
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
  position: relative;
  background: #154;
}

.pc-display {
    width: 800px;
    height: 680px;
}

.sp-display {
  width: 100vw; 
  height: 100vw;
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
