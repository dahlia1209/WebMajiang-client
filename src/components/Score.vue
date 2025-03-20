<script setup lang="ts">
import { usePai, Pai } from '@/models/pai'
import { Score, useScore } from "@/models/score";
import { type PlayerAction, type Position } from "@/models/type";
import PaiView from '../components/Pai.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref, onMounted,watch ,computed} from 'vue';

const props = defineProps<{
    score: Score,
}>()
onMounted(() => {
    // gameStore.overview = props.overview
})

const s = useScore(props.score)
const gameStore = useGameStore()

const scaleSize=computed(()=>Math.min(gameStore.windowWidth/800,1))

watchEffect(()=>{
    s.value.jushu=gameStore.score.jushu
    s.value.baopai=gameStore.score.baopai
    s.value.changbang=gameStore.score.changbang
    s.value.jicun=gameStore.score.jicun
    s.value.paishu=gameStore.score.paishu
    s.value.defen=gameStore.score.defen
    s.value.menfeng=gameStore.score.menfeng
    if (gameStore.getBaopai) s.value.baopai[s.value.baopai.filter(x=>x.serialize(2)!="b0").length]=gameStore.getBaopai
})

watch([
    () => gameStore.getAction
], (
  [ currentAction],[ previousAction]
) => {
  if (currentAction=="zimo") s.value.paishu--
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
            <div class="main">
                {{ s.getPlayerFeng("main") }}:{{ s.getPlayerDefen("main") }}
            </div>
            <div class="xiajia">
                {{ s.getPlayerFeng("xiajia") }}:{{ s.getPlayerDefen("xiajia") }}
            </div>
            <div class="duimian">
                {{ s.getPlayerFeng("duimian") }}:{{ s.getPlayerDefen("duimian") }}
            </div>
            <div class="shangjia">
                {{ s.getPlayerFeng("shangjia") }}:{{ s.getPlayerDefen("shangjia") }}
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
    zoom:v-bind('scaleSize')
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
    height: 100px;
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

.main {
    position: absolute;
    transform: translate(-30px, 30px);
}

.xiajia {
    position: absolute;
    transform: translate(60px, 15px);
}

.duimian {
    position: absolute;
    transform: translate(-30px, 0px);
}

.shangjia {
    position: absolute;
    transform: translate(-120px, 15px);
}
</style>