<script setup lang="ts">
import { usePai, type PaiSuit } from '@/models/pai'

const props = defineProps<{
    suit: PaiSuit
    num: number
    isRed?: boolean
}>()

const pai = usePai(props.suit, props.num, props.isRed)
const paiName=()=>{
    const numStr = pai.isRed && pai.num == 5 ? '0' : pai.num.toString()
    return pai.suit.toString() + numStr
}
const generateImgPath = (): string => {
    return new URL(`../assets/pai/${paiName()}.gif`, import.meta.url).href
}

</script>

<template>
    <img :src="generateImgPath()" :name="paiName()" @click="" />
</template>

<style scoped>
img {
  user-select: none;
}

</style>