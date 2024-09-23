<script setup lang="ts">
import { usePai, type Pai } from '@/models/pai'
import { He, useHe } from "@/models/he";
import { type PlayerAction, type Position } from "@/models/type";
import PaiView from '../components/Pai.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref } from 'vue';

const props = defineProps<{
    he: He,
    position: Position
}>()
const h = useHe(props.he)
const gameStore = useGameStore()
const isLizhi = ref(false)

watchEffect(() => {
    // gameStore.doneDapai(props.position) ? h.value.pai.push(gameStore.dapai as Pai) : null
    if (gameStore.doneDapai(props.position)){
        if(isLizhi.value ){
            h.value.pai[-1]
        }
        h.value.pai.push(gameStore.dapai as Pai)
    } 
    gameStore.isLizhi(props.position) ? isLizhi.value = true : null
})


</script>

<template>
    <div class="he" :class="props.position">
        <div class="grid">
            <PaiView :pai="(pai as Pai)" v-for="(pai, i) in h.pai" :key="pai.id" :class="{roated:isLizhi}" ref="items"/>
        </div>
    </div>
</template>

<style scoped>
.he {
    display: flex;
    width: auto;
    zoom: 0.4;
}

.grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(3, 1fr);

}

.roated {
  transform: rotate(-90deg);
}


.main {}

.xiajia {
    transform: rotate(-90deg);
}

.duimian {
    transform: rotate(-180deg);
}

.shangjia {
    transform: rotate(-270deg);
}
</style>