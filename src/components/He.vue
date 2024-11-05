<script setup lang="ts">
import { usePai, type Pai } from '@/models/pai'
import { He, useHe } from "@/models/he";
import { type PlayerAction, type Position } from "@/models/type";
import PaiView from '../components/Pai.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref, onMounted } from 'vue';

const props = defineProps<{
    he: He,
    position: Position
}>()
const h = useHe(props.he)
const gameStore = useGameStore()
const lizhiIndex = ref(-1)
watchEffect(() => {
    gameStore.doneDapai(props.position) ? h.value.pai.push(gameStore.game.dapai as Pai) : null

    gameStore.isLizhi(props.position) ? lizhiIndex.value = h.value.pai.length - 1 : null

    gameStore.doneFulouToMe(props.position) ? h.value.pai.pop() : null
})


</script>

<template>
    <div class="he">
        <div class="grid">
            <PaiView :pai="(pai as Pai)" v-for="(pai, i) in h.pai" :key="pai.id" :class="{ roated: i == lizhiIndex }" />
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
    transform: rotate(-90deg) translateX(-20%);
    margin: 0 calc(20%);

}


/* .main {}

.xiajia {
    transform: rotate(-90deg);
}

.duimian {
    transform: rotate(-180deg);
}

.shangjia {
    transform: rotate(-270deg);
} */
</style>