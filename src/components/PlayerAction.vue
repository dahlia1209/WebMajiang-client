<script setup lang="ts">
import { usePai, Pai,  } from '@/models/pai'
import { Shoupai, useShoupai, type FulouType, Fulou } from "@/models/shoupai";
import { type PlayerAction, type Position, type PaiSuit ,type HandlerType} from "@/models/type";
import PaiView from '../components/Pai.vue'
import BingpaiView from '../components/Bingpai.vue'
import FulouView from '../components/Fulou.vue'
import { useGameStore } from '@/stores/game'
import { watchEffect, ref, watch, computed } from 'vue';
import { useWebSocketStore } from '@/stores/websocket'
import { MessageType, useWebSocketService, type WebSocketMessage, type callbackProperty } from "@/services/webSocketService";

const props = defineProps<{
  condition:boolean,
  displayName:string,
  actionName:string,
}>()

</script>

<template>
    <button v-if="condition" @click="$emit('actionBy')" :class="[ props.actionName]" >{{ props.displayName }}</button>
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