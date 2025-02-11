<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { Settings, useSettings } from "@/models/settings";
import { MessageType, useWebSocketService, type WebSocketMessage, type callbackProperty } from "@/services/webSocketService";

const props = defineProps<{
    title: Settings,
}>()

const s = useSettings(props.title)
const gameStore = useGameStore()

const kaiju=()=>{
    s.value.mode=1
    gameStore.settings=s.value
}



</script>

<template>
    <img src="../assets/titleImg.svg" />
    <button @click="kaiju()" class="testplay">テストプレイ</button>

</template>