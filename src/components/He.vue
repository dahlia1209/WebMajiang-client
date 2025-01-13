<script setup lang="ts">
import { usePai, type Pai } from '@/models/pai'
import { He, useHe } from "@/models/he";
import { type PlayerAction, type Position,type HandlerType } from "@/models/type";
import PaiView from '../components/Pai.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref, onMounted, watch,computed } from 'vue';
import { isFunctionLike } from 'typescript';

const props = defineProps<{
    he: He,
    position: Position
}>()
const h = useHe(props.he)
const gameStore = useGameStore()
const lizhiIndex = ref(-1)

//ヘルパー関数
const _isMainShoupai=computed(()=>props.position=="main")
const _isSelfTurn=computed(()=>props.position == gameStore.getTurn)
const _getHandlerType = computed((): HandlerType => {
  if (_isMainShoupai.value && _isSelfTurn.value) return 'mainSelfTurn';
  if (_isMainShoupai.value && !_isSelfTurn.value) return 'mainOtherTurn';
  if (!_isMainShoupai.value && _isSelfTurn.value) return 'tajiaSelfTurn';
  return 'tajiaOtherTurn';
});

//配牌ハンドラー
const _qipaiHandler = () => {
  //ハンドラー関数
  const handlers = {
    mainSelfTurn: () => { },
    mainOtherTurn: () => {},
    tajiaSelfTurn: () => { },
    tajiaOtherTurn: () => { }
  }
  const commonProcess = () => {
    h.value.pai=[]
  }

  //メイン処理
  commonProcess()
  handlers[_getHandlerType.value]();
}

//立直ハンドラー
const _lizhiHandler = () => {
  //ハンドラー関数
  const handlers = {
    mainSelfTurn: () => {
        const dapai=gameStore.getDapai
        if (dapai==null) return
        h.value.pai.push(dapai) 
        lizhiIndex.value = h.value.pai.length - 1 
    },
    mainOtherTurn: () => {},
    tajiaSelfTurn: () => {
        const dapai=gameStore.getDapai
        if (dapai==null) return
        h.value.pai.push(dapai) 
        lizhiIndex.value = h.value.pai.length - 1 
     },
    tajiaOtherTurn: () => { }
  }
  const commonProcess = () => {}

  //メイン処理
  commonProcess()
  handlers[_getHandlerType.value]();
}

//打牌ハンドラー
const _dapaiHandler = () => {
  //ハンドラー関数
  const handlers = {
    mainSelfTurn: () => {
        const dapai=gameStore.getDapai
        if (dapai==null) return
        h.value.pai.push(dapai) 
    },
    mainOtherTurn: () => {},
    tajiaSelfTurn: () => {
        const dapai=gameStore.getDapai
        if (dapai==null) return
        h.value.pai.push(dapai) 
     },
    tajiaOtherTurn: () => { }
  }
  const commonProcess = () => {}

  //メイン処理
  commonProcess()
  handlers[_getHandlerType.value]();
}

//副露ハンドラー
const _fulouHandler = () => {
  //ハンドラー関数
  const handlers = {
    mainSelfTurn: () => {},
    mainOtherTurn: () => {
        const fulou =gameStore.getFulou
        if (fulou!=null && fulou.position==props.position){
        h.value.pai.pop()
        }
    },
    tajiaSelfTurn: () => { },
    tajiaOtherTurn: () => {
        const fulou =gameStore.getFulou
        if (fulou!=null && fulou.position==props.position){
        h.value.pai.pop()
        }
     }
  }
  const commonProcess = () => {}

  //メイン処理
  commonProcess()
  handlers[_getHandlerType.value]();
}


watch([()=>gameStore.getAction,]
, ([currentStatus],[previousStatus]) => {
    if (currentStatus=="qipai") _qipaiHandler()
    else if (currentStatus=="lizhi") _lizhiHandler()
    else if (currentStatus=="dapai") _dapaiHandler()
    else if (currentStatus=="fulou") _fulouHandler()
})


</script>

<template>
    <div class="he">
        <div class="grid">
            <PaiView :pai="(pai as Pai)" v-for="(pai, i) in h.pai" :key="pai.id" :class="{ roated: i == lizhiIndex }" />
        </div>
    </div>
</template>

<style scoped>
.he {
    display: flex;
    width: auto;
    zoom: 0.4;
}

.grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(3, 1fr);

}

.roated {
    transform: rotate(-90deg) translateX(-20%);
    margin: 0 calc(20%);

}


/* .main {}

.xiajia {
    transform: rotate(-90deg);
}

.duimian {
    transform: rotate(-180deg);
}

.shangjia {
    transform: rotate(-270deg);
} */
</style>