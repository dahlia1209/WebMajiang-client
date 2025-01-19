<script setup lang="ts">
import { usePai, Pai,  } from '@/models/pai'
import { Shoupai, useShoupai, type FulouType, Fulou } from "@/models/shoupai";
import { type PlayerAction, type Position, type PaiSuit ,type HandlerType} from "@/models/type";
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
  position: Position,
  lizhiFlag:boolean,
  canMainZimoHule:boolean,
  canMainRongHule:boolean,
}>()

const emit = defineEmits<{
  fulouBy: [type: FulouType]
  cancel: []
  lizhi: []
  hule: [hule:Pai]
}>()

const gameStore = useGameStore()
const wsStore = useWebSocketStore();

//ヘルパー関数
const _isSelfTurn=computed(()=>props.position == gameStore.getTurn)
const _canMainFulouofType = (types: FulouType[]) => {
  return(
  props.position == 'main' &&
  ((
    types.filter(x => ["chi", "minggang", "peng"].includes(x)).length > 0 &&
    gameStore.tajiaDapaiStatus() &&
    props.shoupai.getCandidatesbyType(types, selfDapai.value).length > 0
  ) || (
      types.filter(x => ["angang", "jiagang"].includes(x)).length > 0 &&
      gameStore.mainZimoStatus &&
      props.shoupai.getCandidatesbyType(types).length > 0
    ))
)}

const canMainFulou=computed(()=>!(props.lizhiFlag) && gameStore.getTurn=="shangjia"? _canMainFulouofType(["chi","peng","minggang"]): _canMainFulouofType(["peng","minggang"]))
const canMainHule=computed(()=>props.canMainZimoHule || props.canMainRongHule)
const canMainPeng=computed(()=>!(props.lizhiFlag) && _canMainFulouofType(["peng"]) && gameStore.getTurn!="main")
const canMainMinggang=computed(()=>!(props.lizhiFlag) && _canMainFulouofType(["minggang"]) && gameStore.getTurn!="main")
const canMainChi=computed(()=>!(props.lizhiFlag) && gameStore.getTurn=="shangjia" && _canMainFulouofType(["chi"]))
const canMainAngang=computed(()=>_canMainFulouofType(["angang"]) && gameStore.getTurn=="main")
const canMainJiagang=computed(()=>_canMainFulouofType(["jiagang"])&& gameStore.getTurn=="main")
const selfDapaiIdx=computed(()=>_isSelfTurn ? gameStore.getDapaiIdx:null)
const selfDapai=computed(()=>_isSelfTurn ? gameStore.getDapai :null)
const selfZimopai=computed(()=>_isSelfTurn ? gameStore.getZimopai :null)
const canLizhi=computed(()=>gameStore.getLizhipai.length>0)

const doFulou = (type: FulouType, fuloupai: Pai|null) => {
  const fulouCandidates= props.shoupai.getCandidatesbyType([type],fuloupai)
  const fulou = new Fulou(type, fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
  wsStore.client.callbackMessage({action:"dapai",fulou:fulou})
};


const angang = () => {
  const fulouCandidates= props.shoupai.getCandidatesbyType(["angang"])
  const fulou = new Fulou("angang", null, fulouCandidates[0].menpais, null)
  
  props.shoupai.doFulou(fulou);

}

const jiagang = () => {
  const fulouCandidates= props.shoupai.getCandidatesbyType(["jiagang"])
  const fulou = new Fulou("jiagang", fulouCandidates[0].fuloupai, fulouCandidates[0].menpais as Pai[], null)
  props.shoupai.doFulou(fulou);

}

const cancel=()=>{
  const action=gameStore.getAction
  if (action==null)return
  wsStore.client.callbackMessage({action:action})
}

const doLizhi=()=>{
  const action=gameStore.getAction
  if (action==null)return
  wsStore.client.callbackMessage({action:action,lizhipai:gameStore.getLizhipai[0]})
}

</script>

<template>
  <div :class="['main-player-action',]">
    <button v-if="canMainFulou" @click="$emit('cancel')" :class="[ 'cancel']" >×</button>
    <button v-if="canMainHule" @click="$emit('cancel')" :class="[ 'cancel']" >×</button>
    <button v-if="canMainPeng" @click="$emit('fulouBy','peng')" class="peng">ポン</button>
    <button v-if="canMainMinggang" @click="$emit('fulouBy','minggang')" class="gang">カン</button>
    <button v-if="canMainChi" @click="$emit('fulouBy','chi')" class="chi">チー</button>
    <button v-if="canMainAngang" @click="doFulou('angang',null)" class="gang">カン</button>
    <button v-if="canMainJiagang" @click="doFulou('jiagang',null)" class="gang">カン</button>
    <button v-if="canLizhi" @click="$emit('lizhi')" class="lizhi">リーチ</button>
    <button v-if="canMainZimoHule" @click="$emit('hule',gameStore.getZimopai!)" class="hule">ツモ</button>
    <button v-if="canMainRongHule" @click="$emit('hule',gameStore.getDapai!)" class="hule">ロン</button>
  </div>
</template>
<style scoped>
.main-player-action {
  display: flex;
  margin-left: auto;
  padding-bottom: 10px;
  font-size: 30px; 
}

.main-player-action button  {
  font-size: inherit;  
}


.hidden {
  opacity: 0;
  pointer-events: none;
}
</style>