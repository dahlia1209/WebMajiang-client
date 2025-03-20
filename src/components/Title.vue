<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { Settings, useSettings } from "@/models/settings";
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
    <div >
        <img src="../assets/titleImg.svg" class="title-image" />
        <button @click="kaiju()" class="testplay">テストプレイ</button>
    </div>
</template>

<style scoped>
.title-container {
    position: relative;
    width: 800px;
    height: 680px;
}

.sp-title-container {
    position: relative;
    width: 100%;
}

.title-image {
    width: 100%;
    height: 100%;
}

.testplay {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    font-size: 1.2em;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s;
}

.testplay:hover {
    background-color: #357ae8;
}
</style>