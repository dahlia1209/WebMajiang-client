import { describe, it, expect } from "vitest";

import { usePai, Pai } from "../pai";
import { useShoupai, Shoupai, Fulou, createPais } from "../shoupai";
import { useBoard, Board, GameStatus } from "../board";
import { ref } from "vue";
import { Score } from "../score";
import { He } from "../he";

describe("userBoard", () => {
  it("userBoard init", () => {
    let shoupai;
    let board;
    let bingpai: Pai[];
    let fulou: Fulou[];
    let zimopai;
    let waiting_hule_pai;
    let waiting_fulou_pai;

    board = useBoard(new Board());
    expect(board.value.shoupai.length).toBe(4);
    expect(board.value.shoupai[0].bingpai.length).toBe(13);
    expect(board.value.shoupai[0].bingpai[0].name()).toBe("b0");
    expect(board.value.shoupai[0].bingpai[12].name()).toBe("b0");
    expect(board.value.shoupai[3].bingpai.length).toBe(13);
    expect(board.value.shoupai[3].bingpai[0].name()).toBe("b0");
    expect(board.value.shoupai[3].bingpai[12].name()).toBe("b0");
    expect(board.value.he.length).toBe(4);
    expect(board.value.he[0]).toStrictEqual(new He());
    expect(board.value.he[3]).toStrictEqual(new He());

    board = useBoard(new Board(new GameStatus(), new Score(), [], []));
    expect(board.value.shoupai.length).toBe(4);
    expect(board.value.shoupai[0].bingpai.length).toBe(13);
    expect(board.value.shoupai[0].bingpai[0].name()).toBe("b0");
    expect(board.value.shoupai[0].bingpai[12].name()).toBe("b0");
    expect(board.value.shoupai[3].bingpai.length).toBe(13);
    expect(board.value.shoupai[3].bingpai[0].name()).toBe("b0");
    expect(board.value.shoupai[3].bingpai[12].name()).toBe("b0");
    expect(board.value.he.length).toBe(4);
    expect(board.value.he[0]).toStrictEqual(new He());
    expect(board.value.he[3]).toStrictEqual(new He());

    board = useBoard(
      new Board(
        new GameStatus(),
        new Score(),
        [
          new Shoupai(
            createPais([
              "1m",
              "1m",
              "1m",
              "2m",
              "3m",
              "4m",
              "5m",
              "6m",
              "7m",
              "8m",
              "9m",
              "9m",
              "9m",
            ])
          ),
        ],
        [new He(createPais(["1m"]))]
      )
    );
    expect(board.value.shoupai.length).toBe(4);
    expect(board.value.shoupai[0].bingpai.length).toBe(13);
    expect(board.value.shoupai[0].bingpai[0].name()).toBe("m1");
    expect(board.value.shoupai[0].bingpai[12].name()).toBe("m9");
    expect(board.value.shoupai[3].bingpai.length).toBe(13);
    expect(board.value.shoupai[3].bingpai[0].name()).toBe("b0");
    expect(board.value.shoupai[3].bingpai[12].name()).toBe("b0");
    expect(board.value.he.length).toBe(4);
    expect(board.value.he[0].pai.length).toBe(1);
    expect(board.value.he[0].pai[0].name()).toBe("m1");
    expect(board.value.he[3]).toStrictEqual(new He());

    board = useBoard(
      new Board(
        new GameStatus(
          "angang",
          "duimian",
          "ready",
          new Pai("m", 1),
          new Pai("m", 2),
          [new Fulou("chi")],
          new Fulou("peng")
        ),
        new Score(),
        [
          new Shoupai(createPais(["1m"])),
          new Shoupai(createPais(["2m"])),
          new Shoupai(createPais(["3m"])),
          new Shoupai(createPais(["4m"])),
        ],
        [
          new He(createPais(["1s"])),
          new He(createPais(["2s"])),
          new He(createPais(["3s"])),
          new He(createPais(["4s"])),
        ]
      )
    );
    expect(board.value.shoupai.length).toBe(4);
    expect(board.value.shoupai[0].bingpai.length).toBe(1);
    expect(board.value.shoupai[0].bingpai[0].name()).toBe("m1");
    expect(board.value.shoupai[3].bingpai.length).toBe(1);
    expect(board.value.shoupai[3].bingpai[0].name()).toBe("m4");
    expect(board.value.he.length).toBe(4);
    expect(board.value.he[0].pai.length).toBe(1);
    expect(board.value.he[0].pai[0].name()).toBe("s1");
    expect(board.value.he[3].pai.length).toBe(1);
    expect(board.value.he[3].pai[0].name()).toBe("s4");

    //例外
    expect(() => {
      useBoard(
        new Board(
          new GameStatus(),
          new Score(),
          [
            new Shoupai(createPais(["1m"])),
            new Shoupai(createPais(["2m"])),
            new Shoupai(createPais(["3m"])),
            new Shoupai(createPais(["4m"])),
            new Shoupai(createPais(["5m"])),
          ],
          []
        )
      );
    }).toThrowError();

    expect(() => {
      useBoard(
        new Board(
          new GameStatus(),
          new Score(),
          [],
          [
            new He(createPais(["1m"])),
            new He(createPais(["2m"])),
            new He(createPais(["3m"])),
            new He(createPais(["4m"])),
            new He(createPais(["5m"])),
          ]
        )
      );
    }).toThrowError();
  });
});
