<script setup lang="ts">
const props = defineProps<{
  condition: boolean,
  displayName: string,
  actionName: string,
}>()
</script>

<template>
  <button v-if="condition" @click="$emit('actionBy')" :class="['action-button', props.actionName]">
    {{ props.displayName }}
  </button>
</template>

<style scoped>
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  margin: 0 5px;
  min-width: 80px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.action-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.action-button:hover::after {
  opacity: 1;
}

.action-button:active {
  transform: translateY(2px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* アクションタイプ別のスタイル */
.hule {
  background-color: #e74c3c; /* 赤 - アガリ */
}

.chi {
  background-color: #3498db; /* 青 - チー */
}

.peng {
  background-color: #2ecc71; /* 緑 - ポン */
}

.gang {
  background-color: #9b59b6; /* 紫 - カン */
}

.lizhi {
  background-color: #f39c12; /* オレンジ - リーチ */
}

.cancel {
  background-color: #7f8c8d; /* グレー - キャンセル */
}

/* 麻雀テーマのダークモード対応 */
@media (prefers-color-scheme: dark) {
  .action-button {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }
}

/* アニメーションエフェクト */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.hule:hover {
  animation: pulse 0.6s ease-in-out infinite;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .action-button {
    padding: 6px 12px;
    font-size: 14px;
    min-width: 60px;
  }
}

/* メインプレイヤーアクションコンテナ */
.main-player-action {
  display: flex;
  margin-left: auto;
  padding-bottom: 10px;
  font-size: 16px;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.hidden {
  opacity: 0;
  pointer-events: none;
}
</style>