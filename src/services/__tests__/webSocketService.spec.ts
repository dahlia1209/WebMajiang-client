import { describe, it, expect, beforeEach, vi } from "vitest";

import { ref, onMounted, onUnmounted, computed } from "vue";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import { Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";
import { GameStatus } from "@/models/board";
import { WebSocketMsg } from "@/models/websocket";
import {
  useWebSocketService,
} from "@/services/webSocketService";

describe("useWebSocketService", () => {
  it("useWebSocketService handleWebSocketMessage", () => {
    const client = useWebSocketService("ws://localhost:8000/ws");

    // const spya = vi.spyOn(client, "open");
    // const spyb = vi.spyOn(client, "handleWebSocketMessage");
    const ma = new MessageEvent("message", {
      data: JSON.stringify({
        type: "game",
        game: {
          action:"qipai"
        },
      } as WebSocketMsg),
    });
    client.handleWebSocketMessage(ma);
    expect(client.msgs.value.length).toBe(1);
    expect(client.msgs.value[0].type).toBe("game");
    expect(client.msgs.value[0].game?.action).toBe("qipai");

    //
    // const mb = new MessageEvent("message", {
    //   data: JSON.stringify({
    //     type: MessageType.Action,
    //     action: "dapai",
    //     dapai: "5m",
    //     status: "ready",
    //     turn: "duimian",
    //   } as ActionMessage),
    // });
    // client.handleWebSocketMessage(mb);
    // expect(client.messages.value.length).toBe(2);
    // expect((client.messages.value[1] as ActionMessage).type).toBe(
    //   MessageType.Action
    // );
    // expect((client.messages.value[1] as ActionMessage).action).toBe("dapai");
    // expect((client.messages.value[1] as ActionMessage).dapai).toBe("5m");
    // expect((client.messages.value[1] as ActionMessage).status).toBe("ready");
    // expect((client.messages.value[1] as ActionMessage).turn).toBe("duimian");
    const mb = new MessageEvent("message", {
      data: JSON.stringify({
        type: "game",
        game: { action: "dapai", turn: "main", status: "ready", dapai: "m1,99" },
      }),
    });
    client.handleWebSocketMessage(mb);
    expect(client.msgs.value.length).toBe(2);
    const mbr = client.msgs.value[1] as WebSocketMsg;
    expect(mbr.type).toBe("game");
    expect(mbr.game!.action).toBe("dapai");
    expect(mbr.game!.turn).toBe("main");
    expect(mbr.game!.dapai).toStrictEqual("m1,99");

    const mc = new MessageEvent("message", {
      data: JSON.stringify({
        type: "score",
        score: {
          zhuangfeng: "東",
          menfeng: "東",
          jushu: 1,
          jicun: 2,
          changbang: 3,
          defen: [25000, 25000, 25000, 25000],
        },
      } as WebSocketMsg),
    });
    client.handleWebSocketMessage(mc);
    expect(client.msgs.value.length).toBe(3);
    expect((client.msgs.value[2] ).type).toBe("score");
    expect((client.msgs.value[2] ).score!=null).toBe(true);
    expect((client.msgs.value[2] ).score!.zhuangfeng).toBe("東");
    expect((client.msgs.value[2] ).score!.menfeng).toBe("東");
    expect((client.msgs.value[2] ).score!.jushu).toBe(1);
    expect((client.msgs.value[2] ).score!.jicun).toBe(2);
    expect((client.msgs.value[2] ).score!.changbang).toBe(3);
    expect((client.msgs.value[2] ).score!.defen).toStrictEqual([25000, 25000, 25000, 25000]);
  });
});
