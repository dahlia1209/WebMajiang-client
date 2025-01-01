<script setup lang="ts">
import { usePai, Pai,  } from '@/models/pai'
import { Shoupai, useShoupai, type FulouType, Fulou } from "@/models/shoupai";
import { type PlayerAction, type Position, type PaiSuit } from "@/models/type";
import PaiView from '../components/Pai.vue'
import BingpaiView from '../components/Bingpai.vue'
import FulouView from '../components/Fulou.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref, watch,computed } from 'vue';
import { useWebSocketStore } from '@/stores/websocket'
import { MessageType, useWebSocketService, type WebSocketMessage, type callbackProperty } from "@/services/webSocketService";

const props = defineProps<{
  bingpai: Pai[],
  zimopai: Pai,
  position: Position
}>()

// const s = useShoupai(props.shoupai)
const b=computed(() =>props.bingpai)
const z=computed(() =>props.zimopai)
const gameStore = useGameStore()
const wsStore = useWebSocketStore();
const hiddenKey = ref(-1)
const selectingChi = ref(false)
const selectingAngang = ref(false)
const emit = defineEmits(['dapai'])

//ウォッチャー
watch([
  () => gameStore.kaiju,
  () => gameStore.recievedZimopai(props.position),
  () => gameStore.tajiaDapaiStatus(props.position),
  () => gameStore.doneFulou(props.position),
  () => gameStore.canLipai(props.position) || gameStore.tajiaFulouToMe(props.position),
], (
  [newa, newb, newc, newd, newe],
  [olda, oldb, oldc, oldd, olde]
) => {
  //配牌
//   if (newa && !olda && props.position == "main") b.value = gameStore.game.qipai

  //ツモ時にツモ牌にセットと牌数減少
//   if (newb && !oldb) { 
//     s.value.setZimopai(gameStore.game.zimopai as Pai); 
//     gameStore.score.paishu--;
//     actionHandler({action:"zimo"})
//   }

  //他家打牌時にリアクション
//   if (newc && !oldc && props.position != "main") {
//     hiddenKey.value = 0 //他家手牌１枚非表示
//     if (gameStore.canChi ||gameStore.canPeng||gameStore.canMingGang ){

//     }else{
//       actionHandler({action:"dapai"})
//     }
    
//   }

  //他家副露時に副露牌公開
//   if (newd && !oldd && props.position != "main") {
//     const f = new Fulou(gameStore.game.fulou!.type, gameStore.game.fulou!.nakipai as Pai, gameStore.game.fulou?.fuloupais as Pai[], gameStore.game.fulou?.position)
//     s.value.addFulou(f)
//     for (let i = 0; i < gameStore.game.fulou!.fuloupais.length; i++) {
//       s.value.bingpai.pop();
//     }
//     gameStore.game.fulou = null
//   }

  //下家ツモまたは他家副露時に理牌
//   if (newe && !olde) lipai()

})


//イベント関数
// const dapai = (idx: number) => {
//   hiddenKey.value = idx
//   const dapai = idx == 99 ? s.value.zimopai as Pai : s.value.bingpai[idx] as Pai
//   actionHandler({ action: 'dapai', dapai: dapai })
// }

// const lipai = () => {
//   b.value.forEach((_, i) => hiddenKey.value == i ? s.value.removPaiFromBingpai(i) : null)
//   if (s.value.zimopai && hiddenKey.value == 99) s.value.removePaiFromZimopai()
//   s.value.zimoIntoBingpai()
//   s.value.bingpai = Shoupai.sortPai(s.value.bingpai as Pai[])
//   hiddenKey.value = -1
// }

// const doFulou = (type: FulouType, nakipai: Pai) => {
//   const fulouTemp = gameStore.game.canFulouList.find(
//     (f) => f.type === type && f.nakipai?.equals(nakipai)
//   );
//   if (!fulouTemp) throw Error(`次の牌で${type}できません。${nakipai}`);
//   const fulou = new Fulou(type, nakipai, fulouTemp.fuloupais as Pai[], gameStore.game.turn)
//   s.value.doFulou(fulou);
//   actionHandler({action:"fulou",fulou:fulou})
// };


// const chi = (nakipai: Pai) => {
//   if (gameStore.canChi >= 2) {
//     selectingChi.value = true; //todo
//   } else {
//     doFulou('chi', nakipai);
//   }
// };

// const peng = (nakipai: Pai) => {
//   doFulou('peng', nakipai);
// };

// const minggang = (nakipai: Pai) => {
//   doFulou('minggang', nakipai);
// };

// const angang = () => {
//   if (gameStore.canChi >= 2) {
//     selectingAngang.value = true;
//   } else {
//     const fulou = gameStore.game.canFulouList.find(
//       (f) => f.type === "angang" || f.type === "jiagang"
//     );
//     if (!fulou) throw new Error("カンができません")
//     s.value.doFulou(fulou as Fulou);
//   }
// }

// const cancel=()=>{
//   actionHandler({})
// }

// const actionHandler = (payload?: callbackProperty) => {
//   if (payload && payload.action == "dapai" && payload.dapai) {  
//     gameStore.game.dapai = payload.dapai
//   } else if (payload && payload.action == "fulou" && payload.fulou) {
//     gameStore.game.dapai =null
//   }
//   gameStore.game.status = "ready"
//   // console.log("clientSendMessage",payload)
//   wsStore.client.callbackMessage(payload)
// }



</script>

<template>
<div class="bingpai">
      <div>
        <PaiView :pai="(pai as Pai)" v-for="(pai, i) in bingpai" :key="pai.id"
          @click="props.position == 'main' && gameStore.mainZimoStatus ? $emit('dapai',i) : null"
          :class="[{ 'clickalble': gameStore.mainZimoStatus && props.position == 'main' }, { 'hidden': hiddenKey == i }]" />
        <PaiView v-if="zimopai" :pai="(zimopai as Pai)"
          :class="['zimo', { 'clickalble': gameStore.mainZimoStatus && props.position == 'main' }, { 'hidden': hiddenKey == 99 }]"
          @click="props.position == 'main' ? $emit('dapai',99)  : null" />
      </div>
    </div>
</template>