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
const canMainPeng=computed(()=>_canMainFulouofType(["peng"]))
const canMainMinggang=computed(()=>_canMainFulouofType(["minggang"]))
const canMainChi=computed(()=>gameStore.getTurn=="shangjia" && _canMainFulouofType(["chi"]))
const canMainAngang=computed(()=>_canMainFulouofType(["angang"]))
const canMainJiagang=computed(()=>_canMainFulouofType(["jiagang"]))
const selfDapaiIdx=computed(()=>_isSelfTurn ? gameStore.getDapaiIdx:null)
const selfDapai=computed(()=>_isSelfTurn ? gameStore.getDapai :null)
const selfZimopai=computed(()=>_isSelfTurn ? gameStore.getZimopai :null)
const canMainDapai=computed(()=>_isMainShoupai.value && _isSelfTurn.value && (["zimo","fulou"] as PlayerAction[]).includes(gameStore.getAction as PlayerAction) && !isClicked.value )

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
      s.value.setZimopai(selfZimopai.value);
    },
    mainOtherTurn: () => {
      wsStore.client.callbackMessage({ action: "zimo" })
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
      wsStore.client.callbackMessage({ action: "dapai" })
    },
    mainOtherTurn: () => {
      if (!canMainFulou.value) wsStore.client.callbackMessage({ action: "dapai" })
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
  else if (currentStatus=="fulou") _fulouHandler()
})


//イベント関数
const mainDapai = (payload:{idx: number}) => {
  // hiddenKey.value = payload.idx
  isClicked.value = true
  const dapai = payload.idx == 99 ? s.value.zimopai as Pai : s.value.bingpai[payload.idx] as Pai
  wsStore.client.callbackMessage({action:gameStore.getAction as PlayerAction,dapai:dapai,dapaiIdx:payload.idx})
}

const doFulou = (type: FulouType, fuloupai: Pai|null) => {
  const fulouCandidates= s.value.getCandidatesbyType([type],fuloupai)
  const fulou = new Fulou(type, fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
  wsStore.client.callbackMessage({action:"dapai",fulou:fulou})
};


const chi = (fuloupai: Pai) => {
  const fulouCandidates= s.value.getCandidatesbyType(["chi"],fuloupai)
  const fulou = new Fulou("chi", fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
  wsStore.client.callbackMessage({action:"dapai",fulou:fulou})
};

const peng = (fuloupai: Pai) => {
  const fulouCandidates= s.value.getCandidatesbyType(["peng"],fuloupai)
  const fulou = new Fulou("peng", fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
  wsStore.client.callbackMessage({action:"dapai",fulou:fulou})
};

const minggang = (fuloupai: Pai) => {
  const fulouCandidates= s.value.getCandidatesbyType(["minggang"],fuloupai)
  const fulou = new Fulou("minggang", fuloupai, fulouCandidates[0].menpais, gameStore.getTurn)
  wsStore.client.callbackMessage({action:"dapai",fulou:fulou})
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
  const action=gameStore.getAction
  if (action==null)return
  wsStore.client.callbackMessage({action:action})
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
        <button v-if="canMainPeng" @click="peng(gameStore.getDapai as Pai)" class="peng">ポン</button>
        <button v-if="canMainMinggang" @click="minggang(gameStore.getDapai as Pai)" class="gang">カン</button>
        <button v-if="canMainAngang" @click="angang()" class="gang">カン</button>
        <button v-if="canMainJiagang" @click="jiagang()" class="gang">カン</button>
        <button v-if="canMainChi" @click="chi(gameStore.getDapai as Pai)" class="chi">チー</button>
      </div>
      <div>
        <PaiView :pai="(pai as Pai)" v-for="(pai, i) in s.bingpai" :key="pai.id"
          @click="canMainDapai ? mainDapai({idx:i}) : null;"
          :class="[{ 'clickable': canMainDapai }, { 'dapai': selfDapaiIdx == i }]" />
        <PaiView v-if="s.zimopai" :pai="(s.zimopai as Pai)"
          :class="['zimo', { 'clickable': canMainDapai }, { 'dapai': selfDapaiIdx == 99 }]"
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