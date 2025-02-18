import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import {  useWebSocketService } from "@/services/webSocketService";

export const useWebSocketStore = defineStore("websocket", {
  state: () => ({
    client: useWebSocketService(import.meta.env.VITE_WEBSOCKET_ENDPOINT),
  }),
  actions: {},
});