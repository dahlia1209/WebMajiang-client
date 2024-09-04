<script setup lang="ts">
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import Pai from './components/Pai.vue'
import Shoupai from './components/Shoupai.vue'
import { usePai, type PaiSuit, type Pai as PaiModel } from '@/models/pai'

const isStart = ref(false)
const switchMessage = ref("Start")
</script>

<template>
  <header v-if="!isStart">
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>

  </header>

  <main v-if="!isStart">
    <TheWelcome />
  </main>

  <!-- ここから -->
  <div class="green start" v-if="!isStart" @click="isStart = !isStart; switchMessage = isStart ? 'Home' : 'Start'">
    {{ switchMessage }}
  </div>

  <div v-if="isStart">
    <Shoupai
      :bingpai="[usePai('m', 1), usePai('m', 2), usePai('m', 3),
       usePai('m', 4), usePai('m', 5), usePai('m', 6), usePai('m', 7), 
       usePai('m', 8), usePai('m', 9), usePai('p', 1), usePai('p', 1), 
       usePai('s', 1), usePai('z', 2)]" />
  </div>
</template>

<style scoped>
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
