<script setup lang="ts">
import { usePai, type PaiSuit,type Pai as PaiModel } from '@/models/pai'
import Pai from '../components/Pai.vue'

const props = defineProps<{
    bingpai: PaiModel[]
}>()

</script>

<template>
    <Pai :suit="pai.suit" :num="pai.num" :is-red="pai.isRed" v-for="pai in props.bingpai" />
</template>

<style scoped>
img {
  transition: transform 0.3s ease;
  cursor: pointer;
  /* user-select: none; */
}

img:hover {
  transform: translateY(-10px);
}
</style>