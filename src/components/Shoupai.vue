<script setup lang="ts">
import { usePai, Pai,  } from '@/models/pai'
import { Shoupai, useShoupai, type FulouType, Fulou } from "@/models/shoupai";
import { type PlayerAction, type Position, type PaiSuit,type HandlerType } from "@/models/type";
import PaiView from '../components/Pai.vue'
import PlayerActionView from './PlayerAction.vue'
import FulouView from '../components/Fulou.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref, watch, computed } from 'vue';
import { useWebSocketStore } from '@/stores/websocket'

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
        s.value.fulouCandidates = gameStore.getFulouCandidates
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
        s.value.fulouCandidates = gameStore.getFulouCandidates
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
        if (mainActions.dapai.selfDapai.value == null || mainActions.dapai.selfDapaiIdx.value == null) return
        s.value.doDapai(mainActions.dapai.selfDapai.value, mainActions.dapai.selfDapaiIdx.value, true)
        s.value.fulouCandidates = gameStore.getFulouCandidates
        wsStore.client.callbackMessage({ action: gameStore.getAction!, turn: gameStore.getTurn! })
      },
      mainOtherTurn: () => {
        if ((mainActions.fulou.canMainFulou.value && !mainActions.lizhi.isLizhi.value) || mainActions.hule.canMainRongHule.value) return
        wsStore.client.callbackMessage({ action: gameStore.getAction!, turn: gameStore.getTurn! })
      },
      tajiaSelfTurn: () => {
        if (mainActions.dapai.selfDapai.value == null || mainActions.dapai.selfDapaiIdx.value == null) return
        s.value.doDapai(mainActions.dapai.selfDapai.value, mainActions.dapai.selfDapaiIdx.value, false)
      },
      tajiaOtherTurn: () => { }
    }
    const commonProcess = () => { mainActions.dapai.isSelectedDapai.value = false }

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
        // console.log("_fulouHandler,mainSelfTurn,fulou",fulou?.serialize())
        if (fulou == null) return
        s.value.doFulou(fulou)
        if (["angang","minggang","jiagang"].includes(fulou.type)){
          wsStore.client.callbackMessage({ action: gameStore.getAction!, turn:gameStore.getTurn!,zimopai:Pai.deserialize("b0") })
        }else{
          s.value.fulouCandidates = gameStore.getFulouCandidates
        }
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
    const commonProcess = () => { mainActions.dapai.isSelectedDapai.value = false }

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


//メインアクション関数
const mainActions = (() => {
  //打牌アクション
  const dapaiPackage = (() => {
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
      _mainDapai({ idx: payload.dapaiIdx })
    }

    return {
      isSelectedDapai,
      selfDapai,
      selfDapaiIdx,
      isInSelectingMainDapai: canMainDapai,
      selectDapai
    }
  })()

  //アガリアクション
  const hulePackage = (() => {
    const tingpaibuqingMessage=ref("")
    const huleActionHander = (hule: Pai) => {
      //サブ関数
      const _tingpaibuqingProcess=()=>{
        tingpaibuqingMessage.value="フリテンです"
      }

      //メイン
      if (_isTingpaiBuqingHule.value) _tingpaibuqingProcess()
      else wsStore.client.callbackMessage({ action: gameStore.getAction!, turn: "main", hule: [hule] })
    }
    const canMainZimoHule = computed(() => _isSelfTurn.value && _isMainShoupai.value && gameStore.getHule.length > 0 && gameStore.getZimopai != null && gameStore.getHule.map(x => x.serialize(2)).includes(gameStore.getZimopai!.serialize(2)))
    const canMainRongHule = computed(() => !_isSelfTurn.value && _isMainShoupai.value && gameStore.getHule.length > 0 && gameStore.getDapai != null && gameStore.getHule.map(x => x.serialize(2)).includes(gameStore.getDapai!.serialize(2)))
    const _isTingpaiBuqingHule = computed(() => !_isSelfTurn.value && _isMainShoupai.value && gameStore.getHule.length > 0 && gameStore.getDapai != null && gameStore.getHule.map(x => x.serialize(2)).includes("b0"))
    const cancelRongHule = () => {
      const action = gameStore.getAction
      tingpaibuqingMessage.value=""
      if (action == null) return
      wsStore.client.callbackMessage({ action: action, turn: gameStore.getTurn! })
    }

    return {
      huleActionHander,
      canMainZimoHule,
      canMainRongHule,
      cancelRongHule,
      tingpaibuqingMessage

    }
  })()

  //副露アクション
  const fulouPackage = (() => {
    const selectedFulou = ref<Fulou | null>(null)
    const selectedFulouMenpaiIdx = ref<number[]>([])
    const isMenpaiCandidates = (pai: Pai) => menpaiCandidates.value.includes(pai.serialize(2))
    const hasFulouCandidates = (type: FulouType) => {
      if (type=="chi") return gameStore.getTurn=="shangjia" && gameStore.getDapai!=null && s.value.getFulouCandidates("chi", gameStore.getDapai).length > 0
      else if (type=="peng") return gameStore.getTurn!="main" &&gameStore.getDapai!=null &&  s.value.getFulouCandidates("peng", gameStore.getDapai).length > 0
      else if (type=="minggang") return gameStore.getTurn!="main" && gameStore.getDapai!=null && s.value.getFulouCandidates("minggang", gameStore.getDapai).length > 0
      else if (type=="angang") return gameStore.getTurn=="main" && s.value.getFulouCandidates("angang").length > 0
      else if (type=="jiagang") return gameStore.getTurn=="main" && s.value.getFulouCandidates("jiagang").length > 0
      else throw Error(`指定された副露はありません,fuloutype:${type}`)
    }
    
    const fulouActionHandler = (type: FulouType) => {
      const commonProcess=()=>{
        selectedFulou.value = new Fulou(type, gameStore.getDapai, [], gameStore.getTurn)
      }
      const jiagangProcess=()=>{
        selectedFulou.value = new Fulou(type, null, [], null)
      }
      if (type=="chi")commonProcess()
      else if (type=="peng")commonProcess()
      else if (type=="minggang")commonProcess()
      else if (type=="angang")commonProcess()
      else if (type=="jiagang")jiagangProcess()
    }
    
    const _getMenpaiNum=(type:FulouType)=>{
      if (type=="jiagang" ) return 1
      else if (type=="chi"|| type=="peng") return 2
      else if (type=="minggang" ) return 3
      else if (type=="angang" ) return 4
      else throw Error(`副露の種類が正しくありません。type:${type}`)
    }

    const isInSelectingMenpai = computed(() => selectedFulou.value != null && [ 
      selectedFulou.value.menpais.length < _getMenpaiNum(selectedFulou.value.type) ,
      ["chi", "peng","angang","jiagang","minggang"].includes(selectedFulou.value.type)
    ].every(x=>x==true))

    const menpaiCandidates = computed(() => {
      if (isInSelectingMenpai.value) {
        return [
          ...s.value.fulouCandidates
            .filter(x => x.type == selectedFulou.value?.type)
            .filter(x => selectedFulou.value!.fuloupai ? x.fuloupai!.serialize(2) == selectedFulou.value!.fuloupai.serialize(2):true) //副露牌があれば副露牌が一致するものでフィルター
            .filter(x => selectedFulou.value!.menpais.length > 0 ? x.menpais[selectedFulou.value!.menpais.length-1].serialize(2) == selectedFulou.value!.menpais[selectedFulou.value!.menpais.length-1].serialize(2) : true) //2枚目以降の自牌選択であればフィルターする
            .map(x => x.menpais[selectedFulou.value!.menpais.length].serialize(2))
        ]
      }
      return []
    })

    const selectFuloupai = (payload: { dapai: Pai, dapaiIdx: number }) => {
      //サブ関数
      const _jiagangUpdate=()=>{
        const fuloupaistr=selectedFulou.value!.menpais[0].serialize()
        selectedFulou.value!.menpais=[0,1].map(_=>Pai.deserialize(fuloupaistr))
        selectedFulou.value!.fuloupai=Pai.deserialize(fuloupaistr)
      }
      const _updateSelectedFulou = () => {
        if (isMenpaiCandidates(payload.dapai) && !selectedFulouMenpaiIdx.value.includes(payload.dapaiIdx)) {
          selectedFulou.value!.menpais.push(payload.dapai)
          selectedFulouMenpaiIdx.value.push(payload.dapaiIdx)
          if(selectedFulou.value!.type=="jiagang") _jiagangUpdate()
        }
      }
      const _callback=()=>{
        wsStore.client.callbackMessage({ action: gameStore.getAction!, fulou: selectedFulou.value as Fulou,turn:gameStore.getTurn! })
        selectedFulou.value = null
        selectedFulouMenpaiIdx.value = []
      }

      //メイン処理
      _updateSelectedFulou()
      if (!isInSelectingMenpai.value) _callback()
    }

    const canMainFulou = computed(() => ["chi", "peng", "minggang"].some(a=>hasFulouCandidates(a as FulouType)))
    const cancelFulou = () => {
      mainActions.fulou.selectedFulou.value = null
      mainActions.fulou.selectedFulouMenpaiIdx.value = []
      const action = gameStore.getAction
      if (action == null) return
      wsStore.client.callbackMessage({ action: action, turn: gameStore.getTurn! })
    }

    return {
      selectedFulou,
      selectedFulouMenpaiIdx,
      hasFulouCandidates,
      fulouActionHandler,
      selectFuloupai,
      isMenpaiCandidates,
      canMainFulou,
      isInSelectingMenpai,
      menpaiCandidates,
      cancelFulou,
    }
  })()

  //立直アクション
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
      const _lizhiProcess=()=>{
        selectedLizhi.value = payload.dapai
        wsStore.client.callbackMessage({ action: gameStore.getAction!,dapai:payload.dapai,  dapaiIdx: payload.dapaiIdx,lizhipai: [selectedLizhi.value as Pai], turn: gameStore.getTurn! })
      }

      //メイン関数
      if (isLizhipaiCandidates(payload.dapai)) _lizhiProcess()
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
      cancelLizhi,
    }
  })();

  //各アクションを返す
  return {
    hule: hulePackage,
    fulou: fulouPackage,
    lizhi: lizhiPackage,
    dapai:dapaiPackage
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

</script>

<template>
  <div class="shoupai" :class="props.position">
    <div class="bingpai">
      <div :class="['main-player-action',]" v-if="_isMainShoupai">
        <div class="tingpaibuqing-message">{{ mainActions.hule.tingpaibuqingMessage }}</div>
        <PlayerActionView :condition="mainActions.hule.canMainRongHule.value" :display-name="'ロン'" :action-name="'hule'"
          @action-by="mainActions.hule.huleActionHander(gameStore.getDapai!)" />
        <PlayerActionView :condition="mainActions.hule.canMainRongHule.value" :display-name="'×'"
          :action-name="'cancel'" @action-by="mainActions.hule.cancelRongHule" />
        <PlayerActionView :condition="mainActions.hule.canMainZimoHule.value" :display-name="'ツモ'" :action-name="'hule'"
          @action-by="mainActions.hule.huleActionHander(gameStore.getZimopai!)" />
        <PlayerActionView :condition="mainActions.fulou.hasFulouCandidates('chi')" :display-name="'チー'" :action-name="'chi'"
          @action-by="mainActions.fulou.fulouActionHandler('chi')" />
        <PlayerActionView :condition="mainActions.fulou.hasFulouCandidates('peng')" :display-name="'ポン'" :action-name="'peng'"
          @action-by="mainActions.fulou.fulouActionHandler('peng')" />
        <PlayerActionView :condition="mainActions.fulou.hasFulouCandidates('minggang')" :display-name="'カン'"
          :action-name="'gang'" @action-by="mainActions.fulou.fulouActionHandler('minggang')" />
        <PlayerActionView :condition="mainActions.fulou.canMainFulou.value" :display-name="'×'" :action-name="'cancel'"
          @action-by="mainActions.fulou.cancelFulou" />
        <PlayerActionView :condition="mainActions.fulou.hasFulouCandidates('angang') " :display-name="'暗カン'"
          :action-name="'gang'" @action-by="mainActions.fulou.fulouActionHandler('angang')" />
        <PlayerActionView :condition="mainActions.fulou.hasFulouCandidates('jiagang') " :display-name="'加カン'"
          :action-name="'gang'" @action-by="mainActions.fulou.fulouActionHandler('jiagang')" />
        <PlayerActionView :condition="mainActions.lizhi.canLizhi.value" :display-name="'リーチ'" :action-name="'lizhi'"
          @action-by="mainActions.lizhi.lizhiActionHandler" />
        
        
      </div>
      <div>
        <PaiView :pai="pai" v-for="([pai,idx]) in s.getBingpai()" :key="pai.id" @click="() => {
          if (mainActions.lizhi.isInSelectingLizhipai.value) mainActions.lizhi.selectLichipai({ dapaiIdx: idx, dapai: pai })
          else if (mainActions.fulou.isInSelectingMenpai.value) mainActions.fulou.selectFuloupai({ dapaiIdx: idx, dapai: pai })
          else if (mainActions.dapai.isInSelectingMainDapai.value) mainActions.dapai.selectDapai({ dapaiIdx: idx, dapai: pai })
        }" :class="[
            { 'clickable': [
              mainActions.dapai.isInSelectingMainDapai.value && !mainActions.lizhi.isInSelectingLizhipai.value && !mainActions.fulou.isInSelectingMenpai.value,
              mainActions.lizhi.isInSelectingLizhipai.value && mainActions.lizhi.isLizhipaiCandidates(pai),
              mainActions.fulou.isInSelectingMenpai.value && mainActions.fulou.isMenpaiCandidates(pai),
            ].includes(true) },
            { 'not-candidates': [
              mainActions.fulou.isInSelectingMenpai.value && !mainActions.fulou.isMenpaiCandidates(pai) && !mainActions.fulou.selectedFulouMenpaiIdx.value.includes(idx),
              mainActions.lizhi.isInSelectingLizhipai.value && !mainActions.lizhi.isLizhipaiCandidates(pai) 
            ].includes(true)},
            { 'dapai': mainActions.dapai.selfDapaiIdx.value == idx },
            { 'zimo': idx==99 },
            { 'selected-menpais': mainActions.fulou.selectedFulouMenpaiIdx.value.includes(idx) }
          ]" />
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

.hidden {
  opacity: 0;
  pointer-events: none;
}

.zimo {
  padding-left: 10px;
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

.unclickable {
  transition: none;
  cursor: default;
}


.not-candidates {
    filter: grayscale(100%);
    opacity: 0.6;
}

.tingpaibuqing-message{
  color: red;
}


</style>