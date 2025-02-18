<script setup lang="ts">

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