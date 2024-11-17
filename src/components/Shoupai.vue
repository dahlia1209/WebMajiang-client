<script setup lang="ts">
import { usePai, type Pai } from '@/models/pai'
import { Shoupai, useShoupai, type FulouType, Fulou } from "@/models/shoupai";
import { type PlayerAction, type Position } from "@/models/type";
import PaiView from '../components/Pai.vue'
import FulouView from '../components/Fulou.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref, watch } from 'vue';
import {type callbackProperty } from "@/services/webSocketService";
const props = defineProps<{
  shoupai: Shoupai,
  position: Position
}>()
const emit = defineEmits({
  action(payload?: callbackProperty) {
    // if (payload&&payload.action == 'dapai' && !payload.dapai) throw Error("打牌を指定してください")
    if ((payload&&payload.action == 'fulou') && !payload.fulou) throw Error("副露牌を指定してください")
    return payload
  },

  kaiju(payload?: callbackProperty){

  }
})
const s = useShoupai(props.shoupai)
const gameStore = useGameStore()
const hiddenKey = ref(-1)
const selectingChi = ref(false)
const selectingAngang = ref(false)

//ウォッチャー
watch([
  () => gameStore.kaiju,
  () => gameStore.recievedZimopai(props.position),
  () => gameStore.doneDapai(props.position),
  () => gameStore.doneFulou(props.position),
  () => gameStore.canLipai(props.position) || gameStore.doneFulouToMe(props.position),
], (
  [newa, newb, newc, newd, newe],
  [olda, oldb, oldc, oldd, olde]
) => {
  //配牌
  if (newa && !olda && props.position == "main") s.value.bingpai = gameStore.game.qipai

  //ツモ時にツモ牌にセットと牌数減少
  if (newb && !oldb) { 
    s.value.setZimopai(gameStore.game.zimopai as Pai); 
    gameStore.score.paishu--;
    emit("action",{action:"zimo"})
  }

  //他家打牌時にリアクション
  if (newc && !oldc && props.position != "main") {
    hiddenKey.value = 0 //他家手牌１枚非表示
    if (gameStore.canChi ||gameStore.canPeng||gameStore.canMingGang ){

    }else{
      emit("action",{action:"dapai"})
    }
    
  }

  //他家副露時に副露牌公開
  if (newd && !oldd && props.position != "main") {
    const f = new Fulou(gameStore.game.fulou!.type, gameStore.game.fulou!.nakipai as Pai, gameStore.game.fulou?.fuloupais as Pai[], gameStore.game.fulou?.position)
    s.value.addFulou(f)
    for (let i = 0; i < gameStore.game.fulou!.fuloupais.length; i++) {
      s.value.bingpai.pop();
    }
    gameStore.game.fulou = null
  }

  //下家ツモまたは他家副露時に理牌
  if (newe && !olde) lipai()

})


//イベント関数
const dapai = (idx: number) => {
  hiddenKey.value = idx
  const dapai = idx == 99 ? s.value.zimopai as Pai : s.value.bingpai[idx] as Pai
  emit("action", { action: 'dapai', dapai: dapai })
}

const lipai = () => {
  s.value.bingpai.forEach((_, i) => hiddenKey.value == i ? s.value.removPaiFromBingpai(i) : null)
  if (s.value.zimopai && hiddenKey.value == 99) s.value.removePaiFromZimopai()
  s.value.zimoIntoBingpai()
  s.value.bingpai = Shoupai.sortPai(s.value.bingpai as Pai[])
  hiddenKey.value = -1
}

const doFulou = (type: FulouType, nakipai: Pai) => {
  const fulouTemp = gameStore.game.canFulouList.find(
    (f) => f.type === type && f.nakipai?.equals(nakipai)
  );
  if (!fulouTemp) throw Error(`次の牌で${type}できません。${nakipai}`);
  const fulou = new Fulou(type, nakipai, fulouTemp.fuloupais as Pai[], gameStore.game.turn)
  s.value.doFulou(fulou);
  emit("action",{action:"fulou",fulou:fulou})
};


const chi = (nakipai: Pai) => {
  if (gameStore.canChi >= 2) {
    selectingChi.value = true; //todo
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
    const fulou = gameStore.game.canFulouList.find(
      (f) => f.type === "angang" || f.type === "jiagang"
    );
    if (!fulou) throw new Error("カンができません")
    s.value.doFulou(fulou as Fulou);
  }
}

const cancel=()=>{
  emit("action",{})
}

</script>

<template>
  <div class="shoupai" :class="props.position">
    <div class="bingpai">
      <div v-if="props.position == 'main'" :class="['main-action',]">
        <button
          :class="[{ hidden: !gameStore.canPeng && !gameStore.canAnGang && !gameStore.canMingGang && !gameStore.canChi }, 'cancel','testcan']"
          @click="cancel">×</button>
        <button v-if="gameStore.canPeng" @click="peng(gameStore.game.dapai as Pai)" class="peng">ポン</button>
        <button v-if="gameStore.canAnGang || gameStore.canMingGang"
          @click="gameStore.canMingGang ? minggang(gameStore.game.dapai as Pai) : angang()" class="gang">カン</button>
        <button v-if="gameStore.canChi" @click="chi(gameStore.game.dapai as Pai)" class="chi">チー</button>
      </div>
      <div>
        <PaiView :pai="(pai as Pai)" v-for="(pai, i) in s.bingpai" :key="pai.id"
          @click="props.position == 'main' && gameStore.canDapai ? dapai(i) : null"
          :class="[{ 'clickalble': gameStore.canDapai && props.position == 'main' }, { 'hidden': hiddenKey == i }]" />
        <PaiView v-if="s.zimopai" :pai="(s.zimopai as Pai)"
          :class="['zimo', { 'clickalble': gameStore.canDapai && props.position == 'main' }, { 'hidden': hiddenKey == 99 }]"
          @click="props.position == 'main' ? dapai(99) : null" />
      </div>
    </div>
    <div class="fulou">
      <div class="mianzi" v-for="f in s.fulou" :key="f.id">
        <FulouView :fulou="(f as Fulou)" :position="props.position" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shoupai {
  display: flex;
  width: auto;
  zoom: 0.45;
}

.main {}

.xiajia {
  /* transform: rotate(-90deg); */
}

.duimian {
  /* transform: rotate(-180deg); */
}

.shangjia {
  /* transform: rotate(-270deg); */
}

.main-action {
  display: flex;
  margin-left: auto;
  padding-bottom: 10px;
}

.bingpai {
  display: flex;
  flex-wrap: wrap;
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
  zoom: 0.7;
  padding-left: 50px;
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