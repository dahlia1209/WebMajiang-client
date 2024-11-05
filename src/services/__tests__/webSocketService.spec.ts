import { describe, it, expect, beforeEach, vi } from "vitest";

import { ref, onMounted, onUnmounted, computed } from "vue";
import { type Position, type PlayerStatus, type PlayerAction, type Feng } from "@/models/type";
import { Pai } from "@/models/pai";
import { Fulou } from "@/models/shoupai";
import { GameStatus } from "@/models/board";
import {
  useWebSocketService,
  type SimpleMessage,
  MessageType,
  type WebSocketMessage,
  type ActionMessage,
  type ScoreMessage,
  type GameMessage,
} from "@/services/webSocketService";

describe("useWebSocketService", () => {
  it("useWebSocketService handleWebSocketMessage", () => {
    const client = useWebSocketService("ws://localhost:8000/ws");

    // const spya = vi.spyOn(client, "open");
    // const spyb = vi.spyOn(client, "handleWebSocketMessage");
    const ma = new MessageEvent("message", {
      data: JSON.stringify({
        type: MessageType.Message,
        msg: "I'm mocked message",
      } as SimpleMessage),
    });
    client.handleWebSocketMessage(ma);
    expect(client.messages.value.length).toBe(1);
    expect(client.messages.value[0].type).toBe(MessageType.Message);
    expect((client.messages.value[0] as SimpleMessage).type).toBe(MessageType.Message);
    expect((client.messages.value[0] as SimpleMessage).msg).toBe("I'm mocked message");

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
        type: MessageType.Game,
        game: new GameStatus("dapai", "main", "ready", new Pai("m", 1)),
      }),
    });
    client.handleWebSocketMessage(mb);
    expect(client.messages.value.length).toBe(2);
    const mbr = client.messages.value[1] as GameMessage;
    expect(mbr.type).toBe(MessageType.Game);
    expect(mbr.game.action).toBe("dapai");
    expect(mbr.game.turn).toBe("main");
    expect(mbr.game.status).toBe("ready");
    expect(mbr.game.dapai?.num).toStrictEqual(1);
    expect(mbr.game.dapai?.suit).toStrictEqual("m");

    const mc = new MessageEvent("message", {
      data: JSON.stringify({
        type: MessageType.Score,
        zhuangfeng: "東",
        menfeng: "東",
        jushu: 1,
        jicun: 2,
        changbang: 3,
        defen: [25000, 25000, 25000, 25000],
      } as ScoreMessage),
    });
    client.handleWebSocketMessage(mc);
    expect(client.messages.value.length).toBe(3);
    expect((client.messages.value[2] as ScoreMessage).type).toBe(MessageType.Score);
    expect((client.messages.value[2] as ScoreMessage).zhuangfeng).toBe("東");
    expect((client.messages.value[2] as ScoreMessage).menfeng).toBe("東");
    expect((client.messages.value[2] as ScoreMessage).jushu).toBe(1);
    expect((client.messages.value[2] as ScoreMessage).jicun).toBe(2);
    expect((client.messages.value[2] as ScoreMessage).changbang).toBe(3);
    expect((client.messages.value[2] as ScoreMessage).defen).toStrictEqual([25000, 25000, 25000, 25000]);
  });
});
