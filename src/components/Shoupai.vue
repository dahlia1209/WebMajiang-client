<script setup lang="ts">
import { usePai, Pai,  } from '@/models/pai'
import { Shoupai, useShoupai, type FulouType, Fulou } from "@/models/shoupai";
import { type PlayerAction, type Position, type PaiSuit } from "@/models/type";
import PaiView from '../components/Pai.vue'
import BingpaiView from '../components/Bingpai.vue'
import PlayerActionView from '../components/PlayerAction.vue'
import FulouView from '../components/Fulou.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref, watch, computed } from 'vue';
import { useWebSocketStore } from '@/stores/websocket'
import { MessageType, useWebSocketService, type WebSocketMessage, type callbackProperty } from "@/services/webSocketService";

const props = defineProps<{
  shoupai: Shoupai,
  position: Position
}>()
// const emit = defineEmits({
//   action(payload?: callbackProperty) {
//     // if (payload&&payload.action == 'dapai' && !payload.dapai) throw Error("打牌を指定してください")
//     if ((payload&&payload.action == 'fulou') && !payload.fulou) throw Error("副露牌を指定してください")
//     return payload
//   },

//   kaiju(payload?: callbackProperty){

//   }
// })
const s = useShoupai(props.shoupai)
const gameStore = useGameStore()
const wsStore = useWebSocketStore();
const hiddenKey = ref(-1)
const fulouKey=ref([-1])
const selectingChi = ref(false)
const selectingAngang = ref(false)

//ウォッチャー
watch([
  () => gameStore.qipai,
  () => gameStore.zimoStatus(props.position),
  () => gameStore.tajiaDapaiStatus(props.position),
  () => gameStore.doneFulou(props.position),
  () => gameStore.canLipai(props.position) || gameStore.tajiaFulouToMe(props.position),
  () => gameStore.mainDapaiStatus
], (
  [newa, newb, newc, newd, newe, newf],
  [olda, oldb, oldc, oldd, olde, oldf]
) => {
  //配牌
  if (newa && !olda && props.position == "main") {
    s.value.bingpai = gameStore.game.qipai
    wsStore.client.callbackMessage({action:"qipai"})
  }

  //ツモ時にツモ牌にセットと牌数減少
  if (newb && !oldb) { 
    gameStore.score.paishu--;
    if(gameStore.game.zimopai ==null || gameStore.game.zimopai.serialize() =="b0f" ) {
      wsStore.client.callbackMessage({action:"zimo"})
    }
    s.value.setZimopai(gameStore.game.zimopai as Pai); 
  }

  //他家打牌時にリアクション
  if (newc && !oldc && props.position != "main") {
    hiddenKey.value = 0 //他家手牌１枚非表示
    wsStore.client.callbackMessage({action:"dapai"})
    // actionHandler({action:"dapai"})
  }

  //自家打牌時にリアクション
  if (newf && !oldf && props.position == "main") {
    wsStore.client.callbackMessage({action:"dapai"})
  }

  //他家副露時に副露牌公開
  if (newd && !oldd && props.position != "main") {
    const f = new Fulou(gameStore.game.fulou!.type, gameStore.game.fulou!.fuloupai as Pai, gameStore.game.fulou?.menpais as Pai[], gameStore.game.fulou?.position)
    s.value.addFulou(f)
    for (let i = 0; i < gameStore.game.fulou!.menpais.length; i++) {
      s.value.bingpai.pop();
    }
    gameStore.game.fulou = null
  }

  //下家ツモまたは他家副露時に理牌
  if (newe && !olde) lipai()
  

})


//イベント関数
const mainDapai = (payload:{idx: number}) => {
  hiddenKey.value = payload.idx
  gameStore.game.action="dapai"
  const dapai = payload.idx == 99 ? s.value.zimopai as Pai : s.value.bingpai[payload.idx] as Pai
  wsStore.client.callbackMessage({action:"dapai",dapai:dapai,dapaiIdx:payload.idx})
}

const lipai = () => {
  s.value.bingpai.forEach((_, i) => hiddenKey.value == i ? s.value.removPaiFromBingpai(i) : null)
  if (s.value.zimopai && hiddenKey.value == 99) s.value.removePaiFromZimopai()
  s.value.zimoIntoBingpai()
  s.value.bingpai = Shoupai.sortPai(s.value.bingpai as Pai[])
  hiddenKey.value = -1
}

const doFulou = (type: FulouType, fuloupai: Pai|null) => {
  // const fulouTemp = gameStore.game.canFulouList.find(
  //   (f) => f.type === type && f.nakipai?.equals(nakipai)
  // );
  // if (!fulouTemp) throw Error(`次の牌で${type}できません。${nakipai}`);
  const fulouCandidates= s.value.getCandidatesbyType([type],fuloupai)
  const fulou = new Fulou(type, fuloupai, fulouCandidates[0].menpais as Pai[], gameStore.game.turn)
  
  s.value.doFulou(fulou);
  actionHandler({action:"fulou",fulou:fulou})
};


const chi = (nakipai: Pai) => {
  doFulou('chi', nakipai);
};

const peng = (nakipai: Pai) => {
  doFulou('peng', nakipai);
};

const minggang = (nakipai: Pai) => {
  doFulou('minggang', nakipai);
};

const angang = () => {
  const fulouCandidates= s.value.getCandidatesbyType(["angang"])
  const fulou = new Fulou("angang", null, fulouCandidates[0].menpais as Pai[], null)
  
  s.value.doFulou(fulou);

}

const jiagang = () => {
  const fulouCandidates= s.value.getCandidatesbyType(["jiagang"])
  const fulou = new Fulou("jiagang", fulouCandidates[0].fuloupai, fulouCandidates[0].menpais as Pai[], null)
  s.value.doFulou(fulou);

}

const cancel=()=>{
  actionHandler({})
}

const actionHandler = (payload?: callbackProperty) => {
  if (payload && payload.action == "dapai" && payload.dapai) {  
    gameStore.game.dapai = payload.dapai
  } else if (payload && payload.action == "fulou" && payload.fulou) {
    gameStore.game.dapai =null
  }
  wsStore.client.callbackMessage(payload)
}

const canMainDapai=computed(
  ()=>props.position == 'main' && (gameStore.mainZimoStatus || gameStore.mainFulouStatus)
)



const _canMainFulouofType = (types: FulouType[]) => (
  props.position == 'main' &&
  ((
    types.filter(x => ["chi", "minggang", "peng"].includes(x)).length > 0 &&
    gameStore.tajiaDapaiStatus() &&
    s.value.getCandidatesbyType(types, gameStore.game.dapai as Pai | null).length > 0
  ) || (
      types.filter(x => ["angang", "jiagang"].includes(x)).length > 0 &&
      gameStore.mainZimoStatus &&
      s.value.getCandidatesbyType(types).length > 0
    ))
)

const canMainFulou=computed(()=>_canMainFulouofType(["chi","peng","minggang"]))
const canMainPeng=computed(()=>_canMainFulouofType(["peng"]))
const canMainMinggang=computed(()=>_canMainFulouofType(["minggang"]))
const canMainChi=computed(()=>_canMainFulouofType(["chi"]))
const canMainAngang=computed(()=>_canMainFulouofType(["angang"]))
const canMainJiagang=computed(()=>_canMainFulouofType(["jiagang"]))

const paiClickAction=(payload:{idx:number,pai:Pai})=>{
  canMainDapai ? mainDapai({idx:payload.idx}) : null;
  canMainPeng ? peng(payload.pai) : null;
  canMainMinggang ? mainDapai({idx:payload.idx}) : null;
  canMainChi ? mainDapai({idx:payload.idx}) : null;
}


</script>

<template>
  <div class="shoupai" :class="props.position">
    <div>
      <!-- <PlayerActionView @fulou="" @lizhi="" @hule="" @cancel=""/> -->
      <!-- <BingpaiView :bingpai="(s.bingpai as Pai[])" :zimopai="(s.zimopai as Pai)" :position="props.position"  @dapai="dapai" /> -->
    </div>

    <div class="bingpai">
      <div v-if="props.position == 'main'" :class="['main-player-action',]">
        <button
          :class="[{ hidden: !canMainFulou }, 'cancel','testcan']"
          @click="cancel">×</button>
        <button v-if="canMainPeng" @click="peng(gameStore.game.dapai as Pai)" class="peng">ポン</button>
        <button v-if="canMainMinggang" @click="minggang(gameStore.game.dapai as Pai)" class="gang">カン</button>
        <button v-if="canMainAngang" @click="angang()" class="gang">カン</button>
        <button v-if="canMainJiagang" @click="jiagang()" class="gang">カン</button>
        <button v-if="canMainChi" @click="chi(gameStore.game.dapai as Pai)" class="chi">チー</button>
      </div>
      <div>
        <PaiView :pai="(pai as Pai)" v-for="(pai, i) in s.bingpai" :key="pai.id"
          @click="canMainDapai ? mainDapai({idx:i}) : null;"
          :class="[{ 'clickable': canMainDapai }, { 'hidden': hiddenKey == i }]" />
        <PaiView v-if="s.zimopai" :pai="(s.zimopai as Pai)"
          :class="['zimo', { 'clickable': canMainDapai }, { 'hidden': hiddenKey == 99 }]"
          @click="canMainDapai ? mainDapai({idx:99}) : null" />
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

.main-player-action {
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


.clickable {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.clickable:hover {
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