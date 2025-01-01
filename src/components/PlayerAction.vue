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

const gameStore = useGameStore()
const wsStore = useWebSocketStore();
const hiddenKey = ref(-1)
const selectingChi = ref(false)
const selectingAngang = ref(false)
const emit = defineEmits(['dapai','cancel'])

</script>

<template>
    <!-- <button
          :class="[{ hidden: !gameStore.canPeng && !gameStore.canAnGang && !gameStore.canMingGang && !gameStore.canChi }, 'cancel','testcan']"
          @click="$emit(cancel)">×</button>
        <button v-if="gameStore.canPeng" @click="peng(gameStore.game.dapai as Pai)" class="peng">ポン</button>
        <button v-if="gameStore.canAnGang || gameStore.canMingGang"
          @click="gameStore.canMingGang ? minggang(gameStore.game.dapai as Pai) : angang()" class="gang">カン</button>
        <button v-if="gameStore.canChi" @click="chi(gameStore.game.dapai as Pai)" class="chi">チー</button> -->
</template>