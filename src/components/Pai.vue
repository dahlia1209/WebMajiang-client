<script setup lang="ts">
import { usePai,  type Pai } from '@/models/pai'

const props = defineProps<{
    pai: Pai
}>()

const p = usePai(props.pai)
const generateImgPath = (): string => {
    return new URL(`../assets/pai/${p.value.name()}.gif`, import.meta.url).href
}

</script>

<template>
    <img :src="generateImgPath()" :name="p.name()"  />
</template>

<style scoped>
img {
    user-select: none;
}

</style>