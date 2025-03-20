<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { Settings, useSettings } from "@/models/settings";

const props = defineProps<{
    title: Settings,
}>()

const s = useSettings(props.title)
const gameStore = useGameStore()

const kaiju = () => {
    s.value.mode = 1
    gameStore.settings = s.value
}
</script>

<template>
    <div class="title-wrapper">
        <div class="bamboo-frame"></div>
        <div class="title-container">
            <h1 class="title">Web麻雀</h1>
            <button @click="kaiju()" class="start-button">ゲームスタート</button>
        </div>
    </div>
</template>

<style scoped>
.title-wrapper {
    margin: 0;
    padding: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1a472a, #0d2818);
    font-family: 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif;
    overflow: hidden;
    position: relative;
}

.mahjong-tile {
    position: absolute;
    font-size: 24px;
    color: rgba(255, 255, 255, 0.2);
    user-select: none;
    animation: float 10s infinite linear;
    z-index: 1; /* タイトルより後ろに表示 */
}

@keyframes float {
    0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 0.7;
    }
    90% {
        opacity: 0.7;
    }
    100% {
        transform: translateY(-100px) rotate(360deg);
        opacity: 0;
    }
}

.title-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 100%;
    max-width: 80%;
    z-index: 10;
}

.title {
    font-size: 5rem; /* 6rem から 5rem に縮小 */
    white-space: nowrap; /* 改行を防止 */
    font-weight: bold;
    color: #e6e6e6;
    text-shadow: 
        0 0 10px rgba(255, 255, 255, 0.4),
        0 0 20px rgba(210, 180, 0, 0.4),
        0 0 30px rgba(210, 180, 0, 0.3);
    margin-bottom: 2rem;
    position: relative;
    animation: pulse 3s infinite;
    user-select : none;
}

@keyframes pulse {
    0% {
        text-shadow: 
            0 0 8px rgba(255, 255, 255, 0.3),
            0 0 15px rgba(210, 180, 0, 0.3);
    }
    50% {
        text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.4),
            0 0 20px rgba(210, 180, 0, 0.4),
            0 0 25px rgba(210, 180, 0, 0.3);
    }
    100% {
        text-shadow: 
            0 0 8px rgba(255, 255, 255, 0.3),
            0 0 15px rgba(210, 180, 0, 0.3);
    }
}

.start-button {
    background-color: #d4a017;
    color: #fff;
    border: none;
    border-radius: 30px;
    padding: 15px 40px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    margin-top: 2rem;
    user-select: none;
}

.start-button:hover {
    background-color: #f4c430;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.start-button:active {
    transform: translateY(1px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.bamboo-frame {
    position: absolute;
    width: 90%;
    height: 80%;
    border: 20px solid transparent;
    box-sizing: border-box;
    border-image: linear-gradient(45deg, #90a955 25%, #4f772d 25%, #4f772d 50%, #90a955 50%, #90a955 75%, #4f772d 75%) 5;
    z-index: 5;
}
</style>