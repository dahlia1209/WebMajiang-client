<script setup lang="ts">
import { usePai, Pai,  } from '@/models/pai'
import { Shoupai, useShoupai, type FulouType, Fulou } from "@/models/shoupai";
import { type PlayerAction, type Position, type PaiSuit,type HandlerType } from "@/models/type";
import PaiView from '../components/Pai.vue'
import BingpaiView from '../components/Bingpai.vue'
import PlayerActionView from './PlayerAction.vue'
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

//ヘルパー関数
const _isMainShoupai=computed(()=>props.position=="main")
const _isSelfTurn=computed(()=>props.position == gameStore.getTurn)
const _getHandlerType = computed((): HandlerType => {
  if (_isMainShoupai.value && _isSelfTurn.value) return 'mainSelfTurn';
  if (_isMainShoupai.value && !_isSelfTurn.value) return 'mainOtherTurn';
  if (!_isMainShoupai.value && _isSelfTurn.value) return 'tajiaSelfTurn';
  return 'tajiaOtherTurn';
});
const selfZimopai=computed(()=>_isSelfTurn ? gameStore.getZimopai :null)


//ハンドラー関数
const _actionHandlers = (() => {
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
      mainActions.lizhi.initSelectedLizhi()

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
        if (selfZimopai.value == null) return
        if (mainActions.lizhi.isLizhi.value && !mainActions.hule.canMainZimoHule.value) {
          wsStore.client.callbackMessage({ action: gameStore.getAction!, turn: gameStore.getTurn!, dapai: gameStore.getZimopai!, dapaiIdx: 99 })
          return
        }
        s.value.setZimopai(selfZimopai.value);
      },
      mainOtherTurn: () => {
        wsStore.client.callbackMessage({ action: gameStore.getAction!, turn: gameStore.getTurn! })
        // lipai()
        s.value.doLipai()
      },
      tajiaSelfTurn: () => {
        if (selfZimopai.value == null) return
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
        if (dapaiPackage.selfDapai.value == null || dapaiPackage.selfDapaiIdx.value == null) return
        s.value.doDapai(dapaiPackage.selfDapai.value, dapaiPackage.selfDapaiIdx.value, true)
        s.value.fulouCandidates = gameStore.getFulouCandidates
        wsStore.client.callbackMessage({ action: gameStore.getAction!, turn: gameStore.getTurn! })
      },
      mainOtherTurn: () => {
        if ((mainActions.fulou.canMainFulou.value && !mainActions.lizhi.isLizhi.value) || mainActions.hule.canMainRongHule.value) return
        wsStore.client.callbackMessage({ action: gameStore.getAction!, turn: gameStore.getTurn! })
      },
      tajiaSelfTurn: () => {
        if (dapaiPackage.selfDapai.value == null || dapaiPackage.selfDapaiIdx.value == null) return
        s.value.doDapai(dapaiPackage.selfDapai.value, dapaiPackage.selfDapaiIdx.value, false)
      },
      tajiaOtherTurn: () => { }
    }
    const commonProcess = () => { dapaiPackage.isSelectedDapai.value = false }

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
    const commonProcess = () => { dapaiPackage.isSelectedDapai.value = false }

    //メイン処理
    commonProcess()
    handlers[_getHandlerType.value]();
  }

  return {
    qipai: _qipaiHandler,
    zimo: _zimoHandler,
    dapai: _dapaiHandler,
    lizhi: _lizhiHandler,
    fulou: _fulouHandler
  }
})()



//ウォッチャー
watch([() => gameStore.getAction], (
  [currentStatus], [previousStatus]
) => {
  if (currentStatus == "qipai") _actionHandlers.qipai()
  else if (currentStatus == "zimo") _actionHandlers.zimo()
  else if (currentStatus == "dapai") _actionHandlers.dapai()
  else if (currentStatus == "lizhi") _actionHandlers.lizhi()
  else if (currentStatus == "fulou") _actionHandlers.fulou()
})


//イベント関数
const cancel=()=>{
  mainActions.fulou.selectedFulou.value=null
  mainActions.fulou.selectedFulouMenpaiIdx.value=[]
  mainActions.lizhi.initSelectedLizhi()
  const action=gameStore.getAction
  if (action==null)return
  wsStore.client.callbackMessage({action:action,turn:gameStore.getTurn!})
}

const clickHandler=(payload:{dapai:Pai,dapaiIdx:number})=>{
  mainActions.lizhi.selectLichipai(payload)
  mainActions.fulou.selectFuloupai(payload)
  dapaiPackage.selectDapai(payload)
}

const dapaiPackage=(()=>{
  const isSelectedDapai = ref(false)
  const selfDapaiIdx = computed(() => _isSelfTurn ? gameStore.getDapaiIdx : null)
  const selfDapai = computed(() => _isSelfTurn ? gameStore.getDapai : null)
  const canMainDapai = computed(() => _isMainShoupai.value && _isSelfTurn.value && (["zimo", "fulou"] as PlayerAction[]).includes(gameStore.getAction as PlayerAction) && !isSelectedDapai.value)
  const _mainDapai = (payload: { idx: number }) => {
    isSelectedDapai.value = true
    const dapai = payload.idx == 99 ? s.value.zimopai as Pai : s.value.bingpai[payload.idx] as Pai
    wsStore.client.callbackMessage({ action: gameStore.getAction as PlayerAction, dapai: dapai, dapaiIdx: payload.idx, turn: gameStore.getTurn! })
  }
  const selectDapai = (payload: { dapai: Pai, dapaiIdx: number }) => {
    if (dapaiPackage.canMainDapai.value) {
      _mainDapai({ idx: payload.dapaiIdx })
    }
  }

  return {
    isSelectedDapai,
    selfDapai,
    selfDapaiIdx,
    canMainDapai,
    selectDapai
  }
})()

//メインアクション関数
const mainActions = (() => {
  const hulePackage = (() => {
    const huleActionHander = (hule: Pai) => {
      // console.log("huleActionHander,hule",hule.serialize())
      wsStore.client.callbackMessage({ action: gameStore.getAction!, turn: "main", hule: hule })
    }
    const canMainZimoHule = computed(() => _isSelfTurn.value && _isMainShoupai.value && gameStore.getHule.length > 0 && gameStore.getZimopai != null && gameStore.getHule.map(x => x.serialize(2)).includes(gameStore.getZimopai!.serialize(2)))
    const canMainRongHule = computed(() => !_isSelfTurn.value && _isMainShoupai.value && gameStore.getHule.length > 0 && gameStore.getDapai != null && gameStore.getHule.map(x => x.serialize(2)).includes(gameStore.getDapai!.serialize(2)))
    const cancelRongHule=()=>{
      const action=gameStore.getAction
      if (action==null)return
      wsStore.client.callbackMessage({action:action,turn:gameStore.getTurn!})
    }

    return {
      huleActionHander,
      canMainZimoHule,
      canMainRongHule,
      cancelRongHule
    }
  })()

  const fulouPackage = (() => {
    const selectedFulou = ref<Fulou | null>(null)
    const selectedFulouMenpaiIdx = ref<number[]>([])
    const isMenpaiCandidates = (pai: Pai) => menpaiCandidates.value.includes(pai.serialize(2))
    const _canMainFulouofType = (types: FulouType[]) => {
      return (
        props.position == 'main' &&
        ((
          types.filter(x => ["chi", "minggang", "peng"].includes(x)).length > 0 &&
          gameStore.tajiaDapaiStatus() &&
          s.value.getCandidatesbyType(types, dapaiPackage.selfDapai.value).length > 0
        ) || (
            types.filter(x => ["angang", "jiagang"].includes(x)).length > 0 &&
            gameStore.mainZimoStatus &&
            s.value.getCandidatesbyType(types).length > 0
          ))
      )
    }
    const fulouActionHandler = (type: FulouType) => {
      if (type == "minggang") {
        const fuloupai = gameStore.getDapai
        const fulouCandidates = s.value.getCandidatesbyType(["minggang"], fuloupai)
        const fulou = new Fulou("minggang", fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
        wsStore.client.callbackMessage({ action: "dapai", fulou: fulou })
      }
      else if (type == "peng" || type == "chi") {
        selectedFulou.value = new Fulou(type, gameStore.getDapai, [], gameStore.getTurn)
      }
    }

    const isInSelectingMenpai = computed(() => selectedFulou.value != null && selectedFulou.value.menpais.length < 2 && ["chi", "peng"].includes(selectedFulou.value.type))
    const menpaiCandidates = computed(() => {
      if (isInSelectingMenpai.value) {
        return s.value.fulouCandidates
          .filter(x => x.type == selectedFulou.value?.type && x.fuloupai?.serialize(2) == selectedFulou.value?.fuloupai?.serialize(2))
          .filter(x => selectedFulou.value!.menpais.length == 1 ? x.menpais[0].serialize(2) == selectedFulou.value!.menpais[0].serialize(2) : true)
          .map(x => x.menpais[selectedFulou.value!.menpais.length].serialize(2))
      }
      return []
    })

    const selectFuloupai = (payload: { dapai: Pai, dapaiIdx: number }) => {
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
    }

    const canMainFulou = computed(() => gameStore.getTurn == "shangjia" ? _canMainFulouofType(["chi", "peng", "minggang"]) : _canMainFulouofType(["peng", "minggang"]))
    const canMainChi=computed(()=>gameStore.getTurn == "shangjia" && _canMainFulouofType(["chi"]) )
    const canMainPeng=computed(()=>_canMainFulouofType(["peng"]) )
    const canMainMinggang=computed(()=>_canMainFulouofType(["minggang"]) )
    const cancelFulou=()=>{
      mainActions.fulou.selectedFulou.value=null
      mainActions.fulou.selectedFulouMenpaiIdx.value=[]
      const action=gameStore.getAction
      if (action==null)return
      wsStore.client.callbackMessage({action:action,turn:gameStore.getTurn!})
    }

    return {
      selectedFulou,
      selectedFulouMenpaiIdx,
      _canMainFulouofType,
      fulouActionHandler,
      selectFuloupai,
      isMenpaiCandidates,
      canMainFulou,
      isInSelectingMenpai,
      menpaiCandidates,
      canMainChi,
      canMainPeng,
      cancelFulou,
      canMainMinggang,
    }
  })()

  const lizhiPackage = (() => {
    const selectedLizhi = ref<Pai | null>(null)
    const isInSelectingLizhipai = computed(() => selectedLizhi.value != null && selectedLizhi.value.serialize() == "b0f")
    const isLizhi = computed(() => selectedLizhi.value != null && selectedLizhi.value.serialize() != "b0f")
    const lizhipaiCandidates = computed(() => {
      if (isInSelectingLizhipai.value) {
        return gameStore.getLizhipai.map(x => x.serialize().slice(0, 2))
      }
      return []
    })
    const selectLichipai = (payload: { dapai: Pai, dapaiIdx: number }) => {
      if (isInSelectingLizhipai.value) {
        if (isLizhipaiCandidates(payload.dapai)) {
          selectedLizhi.value = payload.dapai
          wsStore.client.callbackMessage({ action: gameStore.getAction!, lizhipai: selectedLizhi.value as Pai, dapaiIdx: payload.dapaiIdx, turn: gameStore.getTurn! })
          return
        }
        return
      }
    }
    const lizhiActionHandler = () => selectedLizhi.value = Pai.deserialize("b0")
    const initSelectedLizhi = () => selectedLizhi.value = null
    const isLizhipaiCandidates = (pai: Pai) => lizhipaiCandidates.value.includes(pai.serialize(2))
    const canLizhi=computed(()=>gameStore.getLizhipai.length>0)
    const cancelLizhi=()=>{
      mainActions.lizhi.initSelectedLizhi()
      const action=gameStore.getAction
      if (action==null)return
      wsStore.client.callbackMessage({action:action,turn:gameStore.getTurn!})
    }

    return {
      selectedLizhi,
      isInSelectingLizhipai,
      isLizhi,
      lizhipaiCandidates,
      selectLichipai,
      lizhiActionHandler,
      initSelectedLizhi,
      isLizhipaiCandidates,
      canLizhi,
      cancelLizhi
    }
  })();

  return {
    hule: hulePackage,
    fulou: fulouPackage,
    lizhi: lizhiPackage
  }
})()




</script>

<template>
  <div class="shoupai" :class="props.position">
    <div>
      <!-- <   @fulou="" @lizhi="" @hule="" @cancel=""/> -->
      <!-- <BingpaiView :bingpai="(s.bingpai as Pai[])" :zimopai="(s.zimopai as Pai)" :position="props.position"  @dapai="dapai" /> -->
    </div>

    <div class="bingpai">
      <div :class="['main-player-action',]" v-if="_isMainShoupai">
        <PlayerActionView :condition="mainActions.hule.canMainRongHule.value"
          :display-name="'ロン'" :action-name="'hule'" @action-by="mainActions.hule.huleActionHander(gameStore.getDapai!)" />
        <PlayerActionView :condition="mainActions.hule.canMainRongHule.value"
          :display-name="'×'" :action-name="'cancel'" @action-by="mainActions.hule.cancelRongHule"/>
        <PlayerActionView  :condition="mainActions.hule.canMainZimoHule.value"
          :display-name="'ツモ'" :action-name="'hule'"  @action-by="mainActions.hule.huleActionHander(gameStore.getZimopai!)"/>
        <PlayerActionView  :condition="mainActions.fulou.canMainChi.value"
          :display-name="'チー'" :action-name="'chi'"  @action-by="mainActions.fulou.fulouActionHandler('chi')" />
        <PlayerActionView  :condition="mainActions.fulou.canMainPeng.value"
          :display-name="'ポン'":action-name="'peng'" @action-by="mainActions.fulou.fulouActionHandler('peng')"/>
        <PlayerActionView  :condition="mainActions.fulou.canMainMinggang.value"
          :display-name="'カン'":action-name="'gang'"  @action-by="mainActions.fulou.fulouActionHandler('minggang')"/>
        <PlayerActionView  :condition="mainActions.fulou.canMainFulou.value"
          :display-name="'×'" :action-name="'cancel'"  @action-by="mainActions.fulou.cancelFulou" />
        <PlayerActionView :condition="mainActions.lizhi.canLizhi.value"
          :display-name="'リーチ'":action-name="'lizhi'"  @action-by="mainActions.lizhi.lizhiActionHandler"/>
      </div>
      <div>
        <PaiView :pai="(pai as Pai)" v-for="(pai, i) in s.bingpai" :key="pai.id"
          @click="clickHandler({ dapaiIdx: i, dapai: pai as Pai })" :class="[
            { 'clickable': dapaiPackage.canMainDapai.value && !mainActions.lizhi.isInSelectingLizhipai.value },
            { 'clickable': mainActions.fulou.isMenpaiCandidates(pai as Pai) },
            { 'clickable': mainActions.lizhi.isLizhipaiCandidates(pai as Pai) },
            { 'dapai': dapaiPackage.selfDapaiIdx.value == i },
            { 'not-candidates': mainActions.fulou.isInSelectingMenpai.value && !mainActions.fulou.isMenpaiCandidates(pai as Pai) && !mainActions.fulou.selectedFulouMenpaiIdx.value.includes(i) },
            { 'not-candidates': mainActions.lizhi.isInSelectingLizhipai.value && !mainActions.lizhi.isLizhipaiCandidates(pai as Pai) },
            { 'selected-menpais': mainActions.fulou.selectedFulouMenpaiIdx.value.includes(i) }
          ]" />
        <PaiView v-if="s.zimopai" :pai="(s.zimopai as Pai)" :class="[
          'zimo',
          { 'clickable': dapaiPackage.canMainDapai.value },
          { 'dapai': dapaiPackage.selfDapaiIdx.value == 99 },
          { 'not-candidates': mainActions.lizhi.isInSelectingLizhipai.value && !mainActions.lizhi.isLizhipaiCandidates(s.zimopai as Pai) },
          { 'clickable': mainActions.lizhi.isLizhipaiCandidates(s.zimopai as Pai) },
        ]" @click="clickHandler({ dapaiIdx: 99, dapai: s.zimopai as Pai })" />
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
  font-size: 30px; 
}

.main-player-action button  {
  font-size: inherit;  
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