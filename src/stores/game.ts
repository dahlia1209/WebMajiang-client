import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  type Position,
  type PlayerStatus,
  type PlayerAction,
} from "@/models/type";
import { type Pai } from "@/models/pai";
import { type Fulou } from "@/models/shoupai";

type Status = {
  [key in Position]: PlayerStatus | null;
};

export const useGameStore = defineStore("game", () => {
  // ref
  const action = ref<PlayerAction | null>(null);
  const turn = ref<Position | null>(null);
  const status = ref<PlayerStatus | null>(null);
  const dapai = ref<Pai | null>(null);
  const canFulouList = ref<Fulou[]>([]);

  //getters
  const canDapai = computed(
    () =>
      action.value == "打牌" &&
      turn.value == "main" &&
      status.value == "thinking"
  );

  const canLipai = computed(
    () => action.value == "ツモ" && turn.value == "shangjia"
  );

  const canPeng = computed(() => {
    if (
      action.value !== "打牌" ||
      turn.value === "main" ||
      status.value !== "ready" ||
      !dapai.value
    ) {
      return false;
    }

    return canFulouList.value.some(
      (f) =>
        f.type === "peng" &&
        f.nakipai &&
        dapai.value &&
        f.nakipai.num === dapai.value.num &&
        f.nakipai.suit === dapai.value.suit
    );
  });

  const canChi = computed(() => {
    if (
      action.value !== "打牌" ||
      turn.value !== "shangjia" ||
      status.value !== "ready" ||
      !dapai.value
    ) {
      return 0;
    }

    const matchingFulou = canFulouList.value.filter(
      (f) =>
        f.type === "chi" &&
        f.nakipai &&
        dapai.value &&
        f.nakipai.num === dapai.value.num &&
        f.nakipai.suit === dapai.value.suit
    );
    return matchingFulou.length
  });

  const canMingGang = computed(() => {
    if (
      action.value !== "打牌" ||
      turn.value === "main" ||
      status.value !== "ready" ||
      !dapai.value
    ) {
      return false;
    }

    return canFulouList.value.some(
      (f) =>
        f.type === "minggang" &&
        f.nakipai &&
        dapai.value &&
        f.nakipai.num === dapai.value.num &&
        f.nakipai.suit === dapai.value.suit
    );
  });

  const canAnGang = computed(() => {
    if (
      turn.value !== "main" &&
      action.value !== "打牌" &&
      status.value !== "thinking"
    ) {
      return 0;
    }
    const matchingFulou =  canFulouList.value.filter(
      (f) => f.type === "angang" || f.type === "jiagang"
    );
    return matchingFulou.length
  });

  return {
    action,
    turn,
    status,
    dapai,
    waitingFulouPai: canFulouList,
    canDapai,
    canLipai,
    canPeng,
    canChi,
    canMingGang,
    canAnGang,
  };
});
