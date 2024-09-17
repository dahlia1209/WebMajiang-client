<script setup lang="ts">
import { usePai, type Pai } from '@/models/pai'
import { Shoupai, useShoupai, type FulouType, Fulou } from "@/models/shoupai";
import PaiView from '../components/Pai.vue'
import FulouView from '../components/Fulou.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref } from 'vue';

const props = defineProps<{
  shoupai: Shoupai
}>()
const s = useShoupai(props.shoupai)
const gameStore = useGameStore()
const hiddenKey = ref(-1)
const selectingChi = ref(false)
const selectingAngang = ref(false)

if (s.value.position == 'main') {
  watchEffect(() => {
    //上家ツモ時に理牌
    gameStore.canLipai ? lipai() : null

  })
}


const dapai = (idx: number) => {
  if (!gameStore.canDapai) return;
  hiddenKey.value = idx
}

const lipai = () => {
  s.value.bingpai.forEach((_, i) => hiddenKey.value == i ? s.value.removPaiFromBingpai(i) : null)
  if (s.value.zimopai && hiddenKey.value == 99) s.value.removePaiFromZimopai()
  s.value.zimoIntoBingpai()
  s.value.bingpai = Shoupai.sortPai(s.value.bingpai as Pai[])
  hiddenKey.value = -1
}

const doFulou = (type: FulouType, nakipai: Pai) => {
  const fulouTemp = gameStore.waitingFulouPai.find(
    (f) => f.type === type && f.nakipai?.equals(nakipai)
  );

  if (!fulouTemp) throw Error(`次の牌で${type}できません。${nakipai}`);

  const fulou = new Fulou(type, nakipai, fulouTemp.fuloupais as Pai[], gameStore.turn)
  s.value.doFulou(fulou);
};


const chi = (nakipai: Pai) => {
  if (gameStore.canChi >= 2) {
    selectingChi.value = true;
  } else {
    doFulou('chi', nakipai);
  }
};

const peng = (nakipai: Pai) => {
  doFulou('peng', nakipai);
};

const minggang = (nakipai: Pai) => {
  doFulou('minggang', nakipai);
};

const angang = () => {
  if (gameStore.canChi >= 2) {
    selectingAngang.value = true;
  } else {
    const fulou = gameStore.waitingFulouPai.find(
      (f) => f.type === "angang" || f.type === "jiagang"
    );
    if(!fulou) throw new Error("カンができません")
    s.value.doFulou(fulou as Fulou);
  }
}

</script>

<template>
  <div class="shoupai">
    <div class="bingpai">
      <div v-if="s.position == 'main'" :class="['main-action',]">
        <button
          :class="{ hidden: !gameStore.canPeng && !gameStore.canAnGang && !gameStore.canMingGang && !gameStore.canChi }">×</button>
        <button v-if="gameStore.canPeng" @click="peng(gameStore.dapai as Pai)">ポン</button>
        <button v-if="gameStore.canAnGang || gameStore.canMingGang"
          @click="gameStore.canMingGang ? minggang(gameStore.dapai as Pai) : angang()">カン</button>
        <button v-if="gameStore.canChi" @click="chi(gameStore.dapai as Pai)">チー</button>
      </div>
      <div>
        <PaiView :pai="(pai as Pai)" v-for="(pai, i) in s.bingpai" :key="pai.id"
          @click="s.position == 'main' ? dapai(i) : null"
          :class="[{ 'clickalble': gameStore.canDapai }, { 'hidden': hiddenKey == i }]" />
        <PaiView v-if="s.zimopai" :pai="(s.zimopai as Pai)"
          :class="['zimo', { 'clickalble': gameStore.canDapai }, { 'hidden': hiddenKey == 99 }]"
          @click="s.position == 'main' ? dapai(99) : null" />
      </div>
    </div>
    <div class="fulou">
      <div class="mianzi" v-for="f in s.fulou" :key="f.id">
        <FulouView :fulou="(f as Fulou)"  />
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-action {
  display: flex;
  margin-left: auto;
  padding-bottom: 10px;
}

.bingpai {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  flex-direction: column;
}

.mianzi {
  display: flex;
  padding-right: 50px;
}

.fulou {
  display: flex;
  align-items: flex-end;
  transform-origin: bottom right;
  margin-top: auto;
  zoom: 0.7;

}

.shoupai {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 1280px;
}

.clickalble {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.clickalble:hover {
  transform: translateY(-10px);
}

.hidden {
  opacity: 0;
  pointer-events: none;
}

.zimo {
  padding-left: 10px;
}
</style>