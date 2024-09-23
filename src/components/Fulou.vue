<script setup lang="ts">
import { usePai,  type Pai } from '@/models/pai'
import { Shoupai, useShoupai, type Fulou, useFulou } from "@/models/shoupai";
import PaiView from '../components/Pai.vue'
import { useGameStore } from '@/stores/game'
import { computed, watchEffect, watchSyncEffect } from 'vue';

const props = defineProps<{
    fulou: Fulou
}>()

const f = useFulou(props.fulou)
const pais=f.value.fuloupais
const key = (function () {
    if (f.value.position == 'main') {
        return -1
    } else if (f.value.position == 'xiajia') {
        return pais.length
    } else if (f.value.position == "duimian") {
        return 1
    } else if (f.value.position == "shangjia") {
        return 0
    } else {
        return -1
    }
})();
if (f.value.nakipai) pais.splice(key,0,f.value.nakipai as Pai)

</script>

<template>
    <PaiView :pai="(pai as Pai)" v-for="(pai, i) in pais" :key="pai.id"
        :class="[ { rotated: i == key }]" />

</template>

<style scoped>
.rotated {
    transform: rotate(-90deg) translateX(-20%);
    margin: 0 calc(7%);
}

.pai-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.pai-container img[name="z3"]:last-child {
  margin-left: auto;
}
</style>