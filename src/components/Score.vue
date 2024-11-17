<script setup lang="ts">
import { usePai, type Pai } from '@/models/pai'
import { Score, useScore } from "@/models/score";
import { type PlayerAction, type Position } from "@/models/type";
import PaiView from '../components/Pai.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref, onMounted } from 'vue';

const props = defineProps<{
    score: Score,
}>()
onMounted(() => {
    // gameStore.overview = props.overview
})

const s = useScore(props.score)
const gameStore = useGameStore()

watchEffect(()=>{
    s.value.jushu=gameStore.score.jushu
    s.value.baopai=gameStore.score.baopai
    s.value.changbang=gameStore.score.changbang
    s.value.jicun=gameStore.score.jicun
    s.value.paishu=gameStore.score.paishu
    s.value.defen=gameStore.score.defen
    s.value.menfeng=gameStore.score.menfeng
})

</script>

<template>
    <div class="overview">
        <div class="child-container">
            <div class="jushu">
                {{ s.getJushuName() }}
            </div>
            <div class="baopai">
                <PaiView :pai="(pai as Pai)" v-for="(pai, i) in s.baopai" :key="pai.id" />
            </div>
        </div>
        <div class="child-container">
            <div class="childchild-container">
                <div class="changbang">
                    <img src="../assets/tenbou/100.gif" alt="changbang">:{{ s.changbang }}
                </div>
                <div class="jicun">
                    <img src="../assets/tenbou/1000.gif" alt="jicun">:{{ s.jicun }}
                </div>
            </div>
            <div class="paishu">
                牌数:{{ s.paishu }}
            </div>
        </div>
        <div class="child-container">
            <div class="shangjia">
                
                {{ s.getPlayerFeng()[3] }}:{{ s.defen[3] }}
            </div>
            <div class="childchild-container">
                <div class="duimian">
                    {{ s.getPlayerFeng()[2] }}:{{ s.defen[2] }}
                </div>
                <div class="main">
                    {{ s.getPlayerFeng()[0] }}:{{ s.defen[0] }}
                </div>
            </div>
            <div class="xiajia">
                {{ s.getPlayerFeng()[1] }}:{{ s.defen[1] }}
            </div>
        </div>

    </div>

</template>

<style scoped>
.overview {
    width: 280px;
    height: 160px;
    background-color: black;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: white;
    user-select: none;
}

.changbang img{
    width: 70px;
}
.jicun img{
    width: 70px;
}

.child-container{
    display: flex;
    flex-direction: row;
}

.childchild-container{
    display: flex;
    flex-direction: column;
}

.jushu{
}

.baopai{
    zoom: 0.3
    
}
</style>