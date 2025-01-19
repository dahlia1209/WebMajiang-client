<script setup lang="ts">
import { usePai, Pai,  } from '@/models/pai'
import { Shoupai, useShoupai, type FulouType, Fulou } from "@/models/shoupai";
import { type PlayerAction, type Position, type PaiSuit,type HandlerType } from "@/models/type";
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
const s = useShoupai(props.shoupai)
const gameStore = useGameStore()
const wsStore = useWebSocketStore();
const isClicked=ref(false)
// const lizhiFlag=ref(false)
const selectedFulou=ref<Fulou|null>(null)
const selectedFulouMenpaiIdx=ref<number[]>([])
const selectedLizhi=ref<Pai|null>(null)

//ヘルパー関数
const _isMainShoupai=computed(()=>props.position=="main")
const _isSelfTurn=computed(()=>props.position == gameStore.getTurn)
const _getHandlerType = computed((): HandlerType => {
  if (_isMainShoupai.value && _isSelfTurn.value) return 'mainSelfTurn';
  if (_isMainShoupai.value && !_isSelfTurn.value) return 'mainOtherTurn';
  if (!_isMainShoupai.value && _isSelfTurn.value) return 'tajiaSelfTurn';
  return 'tajiaOtherTurn';
});
const _canMainFulouofType = (types: FulouType[]) => {
  return(
  props.position == 'main' &&
  ((
    types.filter(x => ["chi", "minggang", "peng"].includes(x)).length > 0 &&
    gameStore.tajiaDapaiStatus() &&
    s.value.getCandidatesbyType(types, selfDapai.value).length > 0
  ) || (
      types.filter(x => ["angang", "jiagang"].includes(x)).length > 0 &&
      gameStore.mainZimoStatus &&
      s.value.getCandidatesbyType(types).length > 0
    ))
)}
const canMainFulou=computed(()=>gameStore.getTurn=="shangjia"? _canMainFulouofType(["chi","peng","minggang"]): _canMainFulouofType(["peng","minggang"]))
const selfDapaiIdx=computed(()=>_isSelfTurn ? gameStore.getDapaiIdx:null)
const selfDapai=computed(()=>_isSelfTurn ? gameStore.getDapai :null)
const selfZimopai=computed(()=>_isSelfTurn ? gameStore.getZimopai :null)
const canMainDapai=computed(()=>_isMainShoupai.value && _isSelfTurn.value && (["zimo","fulou"] as PlayerAction[]).includes(gameStore.getAction as PlayerAction) && !isClicked.value )
const isInSelectingMenpai=computed(()=>selectedFulou.value != null && selectedFulou.value.menpais.length<2 && ["chi","peng"].includes(selectedFulou.value.type))
const menpaiCandidates=computed(()=>{
      if(isInSelectingMenpai.value){
        return s.value.fulouCandidates
          .filter(x=>x.type==selectedFulou.value?.type && x.fuloupai?.serialize().slice(0,2) == selectedFulou.value?.fuloupai?.serialize().slice(0,2))
          .filter(x=>selectedFulou.value!.menpais.length==1 ? x.menpais[0].serialize().slice(0,2)==selectedFulou.value!.menpais[0].serialize().slice(0,2):true)
          .map(x=>x.menpais[selectedFulou.value!.menpais.length].serialize().slice(0,2))
      }
      return []
    })
const isInSelectingLizhipai=computed(()=>selectedLizhi.value!=null && selectedLizhi.value.serialize()=="b0f")
const isLizhi=computed(()=>selectedLizhi.value !=null && selectedLizhi.value.serialize()!="b0f")
const lizhipaiCandidates=computed(()=>{
  if (isInSelectingLizhipai){
    return gameStore.getLizhipai.map(x=>x.serialize().slice(0,2))
  }
  return []
})
const canMainZimoHule=computed(()=>_isSelfTurn.value &&_isMainShoupai.value &&gameStore.getHule.length>0&&gameStore.getZimopai!=null&& gameStore.getHule.map(x=>x.serialize().slice(0,2)).includes(gameStore.getZimopai!.serialize().slice(0,2)))
const canMainRongHule=computed(()=>!_isSelfTurn.value&&_isMainShoupai.value &&gameStore.getHule.length>0&&gameStore.getDapai!=null&& gameStore.getHule.map(x=>x.serialize().slice(0,2)).includes(gameStore.getDapai!.serialize().slice(0,2)))

//配牌ハンドラー
const _qipaiHandler = () => {
  //ハンドラー関数
  const handlers = {
    mainSelfTurn: () => { },
    mainOtherTurn: () => {
      s.value.bingpai = gameStore.getQipai
      wsStore.client.callbackMessage({ action: "qipai" })
    },
    tajiaSelfTurn: () => { },
    tajiaOtherTurn: () => { }
  }
  const commonProcess = () => {
    s.value.reset()
    selectedLizhi.value=null

  }

  //メイン処理
  commonProcess()
  handlers[_getHandlerType.value]();
}

//ツモハンドラー
const _zimoHandler = () => {
  //ハンドラー関数
  const handlers = {
    mainSelfTurn: () => {
      if (selfZimopai.value==null) return
      if (isLizhi.value && !canMainZimoHule.value){
        wsStore.client.callbackMessage({ action: gameStore.getAction!,turn:gameStore.getTurn!,dapai:gameStore.getZimopai!,dapaiIdx:99 })
        return
      }
      s.value.setZimopai(selfZimopai.value);
    },
    mainOtherTurn: () => {
      wsStore.client.callbackMessage({ action: gameStore.getAction!,turn:gameStore.getTurn! })
      // lipai()
      s.value.doLipai()
    },
    tajiaSelfTurn: () => {
      if (selfZimopai.value==null) return
      s.value.setZimopai(selfZimopai.value);
    },
    tajiaOtherTurn: () => {
      s.value.doLipai()
    }
  }
  const commonProcess = () => { }

  //メイン処理
  commonProcess()
  handlers[_getHandlerType.value]();
}

//打牌ハンドラー
const _dapaiHandler = () => {
  //ハンドラー関数
  const handlers = {
    mainSelfTurn: () => {
      if (selfDapai.value ==null || selfDapaiIdx.value==null) return
      s.value.doDapai(selfDapai.value,selfDapaiIdx.value,true)
      s.value.fulouCandidates = gameStore.getFulouCandidates
      wsStore.client.callbackMessage({ action: gameStore.getAction!,turn:gameStore.getTurn! })
    },
    mainOtherTurn: () => {
      if ((canMainFulou.value && !isLizhi.value) || canMainRongHule.value)  return
      wsStore.client.callbackMessage({ action: gameStore.getAction!,turn:gameStore.getTurn! })
    },
    tajiaSelfTurn: () => {
      if (selfDapai.value ==null || selfDapaiIdx.value==null) return
      s.value.doDapai(selfDapai.value,selfDapaiIdx.value,false)
    },
    tajiaOtherTurn: () => { }
  }
  const commonProcess = () => {isClicked.value = false }

  //メイン処理
  commonProcess()
  handlers[_getHandlerType.value]();
}

//立直ハンドラー
const _lizhiHandler = () => {
  //ハンドラー関数
  _dapaiHandler()
}


//副露ハンドラー
const _fulouHandler = () => {
  //ハンドラー関数
  const handlers = {
    mainSelfTurn: () => {
      const fulou = gameStore.getFulou
      if (fulou == null) return
      s.value.doFulou(fulou)
    },
    mainOtherTurn: () => {
      // lipai()
      s.value.doLipai()
    },
    tajiaSelfTurn: () => {
      const fulou = gameStore.getFulou
      if (fulou == null) return
      s.value.addFulou(fulou);
      for (let i = 0; i < fulou.menpais.length; i++) {
        s.value.bingpai.pop();
      }
    },
    tajiaOtherTurn: () => { 
      s.value.doLipai()
    }
  }
  const commonProcess = () => { isClicked.value = false}

  //メイン処理
  commonProcess()
  handlers[_getHandlerType.value]();
}

//ウォッチャー
watch([() => gameStore.getAction], (
  [ currentStatus],[ previousStatus]
) => {
  if (currentStatus=="qipai") _qipaiHandler()
  else if (currentStatus=="zimo") _zimoHandler()
  else if (currentStatus=="dapai") _dapaiHandler()
  else if (currentStatus=="lizhi") _lizhiHandler()
  else if (currentStatus=="fulou") _fulouHandler()
})


//イベント関数
const mainDapai = (payload:{idx: number}) => {
  // hiddenKey.value = payload.idx
  isClicked.value = true
  const dapai = payload.idx == 99 ? s.value.zimopai as Pai : s.value.bingpai[payload.idx] as Pai
  wsStore.client.callbackMessage({action:gameStore.getAction as PlayerAction,dapai:dapai,dapaiIdx:payload.idx,turn:gameStore.getTurn!})
}

const doFulou = (type: FulouType) => {
  const fuloupai=gameStore.getDapai
  if (fuloupai!=null){
    const fulouCandidates= s.value.getCandidatesbyType([type],fuloupai)
    const fulou = new Fulou(type, fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
    wsStore.client.callbackMessage({action:"dapai",fulou:fulou,turn:gameStore.getTurn!})
  }
};


const chi = (fuloupai: Pai) => {
  const fulouCandidates= s.value.getCandidatesbyType(["chi"],fuloupai)
  const fulou = new Fulou("chi", fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
  wsStore.client.callbackMessage({action:"dapai",fulou:fulou,turn:gameStore.getTurn!})
};

const peng = (fuloupai: Pai) => {
  const fulouCandidates= s.value.getCandidatesbyType(["peng"],fuloupai)
  const fulou = new Fulou("peng", fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
  wsStore.client.callbackMessage({action:"dapai",fulou:fulou,turn:gameStore.getTurn!})
};

const minggang = (fuloupai: Pai) => {
  const fulouCandidates= s.value.getCandidatesbyType(["minggang"],fuloupai)
  const fulou = new Fulou("minggang", fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
  wsStore.client.callbackMessage({action:"dapai",fulou:fulou,turn:gameStore.getTurn!})
};

const angang = () => {
  const fulouCandidates= s.value.getCandidatesbyType(["angang"])
  const fulou = new Fulou("angang", null, fulouCandidates[0].menpais, null)
  
  s.value.doFulou(fulou);

}

const jiagang = () => {
  const fulouCandidates= s.value.getCandidatesbyType(["jiagang"])
  const fulou = new Fulou("jiagang", fulouCandidates[0].fuloupai, fulouCandidates[0].menpais as Pai[], null)
  s.value.doFulou(fulou);

}

const cancel=()=>{
  selectedFulou.value=null
  selectedFulouMenpaiIdx.value=[]
  selectedLizhi.value =null
  const action=gameStore.getAction
  if (action==null)return
  wsStore.client.callbackMessage({action:action,turn:gameStore.getTurn!})

}

const doLizhi=()=>{
  const action=gameStore.getAction
  if (action==null)return
  wsStore.client.callbackMessage({action:action,lizhipai:gameStore.getLizhipai[0],turn:gameStore.getTurn!})
}

const isMenpaiCandidates=(pai:Pai)=> menpaiCandidates.value.includes(pai.serialize().slice(0,2))
const isLizhipaiCandidates=(pai:Pai)=> lizhipaiCandidates.value.includes(pai.serialize().slice(0,2))

const clickHandler=(payload:{dapai:Pai,dapaiIdx:number})=>{
  //立直の手牌選択
  if (isInSelectingLizhipai.value){
    if (isLizhipaiCandidates(payload.dapai)){
      selectedLizhi.value = payload.dapai
      wsStore.client.callbackMessage({ action: gameStore.getAction!, lizhipai: selectedLizhi.value as Pai,dapaiIdx:payload.dapaiIdx,turn:gameStore.getTurn! })
      return
    }
    return
  }

  //副露の手牌選択
  if (isInSelectingMenpai.value) {
    if (isMenpaiCandidates(payload.dapai) && !selectedFulouMenpaiIdx.value.includes(payload.dapaiIdx)) {
      selectedFulou.value!.menpais.push(payload.dapai)
      selectedFulouMenpaiIdx.value.push(payload.dapaiIdx)
    }
    if (isInSelectingMenpai.value) {
      return
    } else {
      wsStore.client.callbackMessage({ action: gameStore.getAction!, fulou: selectedFulou.value as Fulou })
      selectedFulou.value = null
      selectedFulouMenpaiIdx.value = []
      return
    }
  }
  

  //打牌選択
  if (canMainDapai){
    mainDapai({idx:payload.dapaiIdx})
  }
}

const fulouActionHandler=(type:FulouType)=>{
  if (type=="minggang"){
    const fuloupai=gameStore.getDapai
    const fulouCandidates= s.value.getCandidatesbyType(["minggang"],fuloupai)
    const fulou = new Fulou("minggang", fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
    wsStore.client.callbackMessage({action:"dapai",fulou:fulou})
  }
  else if (type=="peng" || type=="chi" ){
    selectedFulou.value=new Fulou(type,gameStore.getDapai,[],gameStore.getTurn)
  }
}

const lizhiActionHandler=()=>{
  selectedLizhi.value=Pai.deserialize("b0")
}

const huleActionHander=(hule:Pai)=>{
  wsStore.client.callbackMessage({action:gameStore.getAction!,turn:"main",hule:hule})
}


</script>

<template>
  <div class="shoupai" :class="props.position">
    <div>
      <!-- <   @fulou="" @lizhi="" @hule="" @cancel=""/> -->
      <!-- <BingpaiView :bingpai="(s.bingpai as Pai[])" :zimopai="(s.zimopai as Pai)" :position="props.position"  @dapai="dapai" /> -->
    </div>

    <div class="bingpai">
      <PlayerActionView v-if="_isMainShoupai" :position="props.position" :shoupai="props.shoupai" :lizhi-flag="isLizhi"
        :can-main-zimo-hule="canMainZimoHule" :can-main-rong-hule="canMainRongHule" 
        @fulou-by="fulouActionHandler" @cancel="cancel" @lizhi="lizhiActionHandler" @hule="huleActionHander" />
      <div>
        <PaiView :pai="(pai as Pai)" v-for="(pai, i) in s.bingpai" :key="pai.id"
          @click="clickHandler({ dapaiIdx: i, dapai: pai as Pai })" :class="[
            { 'clickable': canMainDapai && !isInSelectingLizhipai },
            { 'clickable': isMenpaiCandidates(pai as Pai)  },
            { 'clickable': isLizhipaiCandidates(pai as Pai)  },
            { 'dapai': selfDapaiIdx == i },
            { 'not-candidates': isInSelectingMenpai && !isMenpaiCandidates(pai as Pai) && !selectedFulouMenpaiIdx.includes(i) },
            { 'not-candidates': isInSelectingLizhipai && !isLizhipaiCandidates(pai as Pai)},
            { 'selected-menpais': selectedFulouMenpaiIdx.includes(i) }
          ]" />
        <PaiView v-if="s.zimopai" :pai="(s.zimopai as Pai)"
          :class="[
            'zimo', 
            { 'clickable': canMainDapai }, 
            { 'dapai': selfDapaiIdx == 99 },
            { 'not-candidates': isInSelectingLizhipai && !isLizhipaiCandidates(s.zimopai as Pai)},
            { 'clickable': isLizhipaiCandidates(s.zimopai as Pai)  },
            ]"
          @click="clickHandler({ dapaiIdx: 99, dapai: s.zimopai as Pai })" />
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

.dapai{
  padding-left: 40px;
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

.not-candidates {
    filter: grayscale(100%);
    opacity: 0.6;
}

.selected-menpais {
  transform: translateY(-10px);
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