import { describe, it, expect } from "vitest";

import { usePai, Pai } from "../pai";
import { useShoupai, Shoupai, Fulou, createPais } from "../shoupai";
import { useBoard, Board, GameStatus } from "../board";
import { ref } from "vue";
import { Score } from "../score";
import { He } from "../he";
import { WebSocketMsg,GameContentFormat } from "@/models/websocket";

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

    board = useBoard(new Board(GameContentFormat.create(), new Score(), [], []));
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
         GameContentFormat.create(),
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
        GameContentFormat.create({
          action:"fulou",
          turn:"duimian",
          dapai:new Pai("m", 1),
          zimopai:new Pai("m", 2),
          fulou:new Fulou("peng")
        }),
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
          GameContentFormat.create(),
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
          GameContentFormat.create(),
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

  // it("update",()=>{
  //   const board = useBoard(new Board())
  //   board.value.gameStatus.update({})
  //   expect(board.value.gameStatus.action).toBe(null)
  //   expect(board.value.gameStatus.turn).toBe(null)
  //   expect(board.value.gameStatus.dapai).toBe(null)
  //   expect(board.value.gameStatus.zimopai).toBe(null)
  //   expect(board.value.gameStatus.fulou).toBe(null)
  //   expect(board.value.gameStatus.qipai).toStrictEqual([])

  //   board.value.gameStatus= new GameStatus({
  //     action:"dapai",
  //     turn:"duimian",
  //     dapai:new Pai("m",1),
  //     zimopai:new Pai("m",2),
  //     fulou:new Fulou("peng"),
  //     qipai:[new Pai("m",3)]
  //   })
  //   board.value.gameStatus.update({})
  //   expect(board.value.gameStatus.action).toBe("dapai")
  //   expect(board.value.gameStatus.turn).toBe("duimian")
  //   // expect(board.value.gameStatus.status).toBe("ready")
  //   expect(board.value.gameStatus.dapai?.name()).toBe("m1")
  //   expect(board.value.gameStatus.zimopai?.name()).toBe("m2")
  //   expect(board.value.gameStatus.fulou?.type).toBe("peng")
  //   expect(board.value.gameStatus.qipai[0]?.name()).toBe("m3")

  //   board.value.gameStatus.update({
  //     action:null,
  //     turn:null,
  //     // status:null,
  //     dapai:null,
  //     zimopai:null,
  //     fulou:null,
  //     qipai:[]
  //   })
  //   expect(board.value.gameStatus.action).toBe(null)
  //   expect(board.value.gameStatus.turn).toBe(null)
  //   // expect(board.value.gameStatus.status).toBe(null)
  //   expect(board.value.gameStatus.dapai).toBe(null)
  //   expect(board.value.gameStatus.zimopai).toBe(null)
  //   expect(board.value.gameStatus.fulou).toBe(null)
  //   expect(board.value.gameStatus.qipai).toStrictEqual([])
  // })
});
