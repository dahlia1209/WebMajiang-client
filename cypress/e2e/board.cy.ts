interface gameMessage {
  type: string;
  game: { action: string | null; fulou: string | null; dapai: string | null };
}

describe("Board", () => {
  /*Param*/
  const isAutoDapai: boolean = true;
  const initQipai: string[] | null = ["m1", "m1", "m2", "m2", "m3", "m3", "m4", "m4", "m5", "m5", "m6", "m6", "m7"];
  // prettier-ignore
  const initCanFulouList: string[] | null = [
    // "chi,m3,m1+m2,null","chi,m2,m1+m3,null","chi,m1,m2+m3,null","chi,m4,m2+m3,null","chi,m3,m2+m5,null","chi,m2,m3+m4,null",
    // "chi,m5,m3+m4,null","chi,m4,m3+m5,null","chi,m3,m4+m5,null","chi,m6,m4+m5,null","chi,m5,m4+m6,null","chi,m4,m5+m6,null","chi,m7,m5+m6,null",
    // "chi,m6,m5+m7,null","chi,m5,m6+m7,null","chi,m8,m6+m7,null","chi,m7,m6+m8,null","chi,m6,m7+m8,null","chi,m9,m7+m8,null","chi,m8,m7+m9,null",
    // "chi,m9,m7+m8,null","peng,m1,m1+m1,null","peng,m9,m9+m9,null","minggang,m1,m1+m1+m1,null","minggang,m9,m9+m9+m9,null",
    // "peng,m1,m1+m1,null","peng,m2,m2+m2,null","peng,m3,m3+m3,null","peng,m4,m4+m4,null","peng,m5,m5+m5,null","peng,m6,m6+m6,null",
  ];
  const isMockServer = false;
  /*Param*/
  let mockSocket: WebSocket | null = null;
  let pais: string[] = [];
  // prettier-ignore

  let fengArr = ["東", "南", "西", "北"];
  let positionArr = ["main", "xiajia", "duimian", "shangjia"];
  const jushu = Math.floor(Math.random() * 8) + 1;
  let zhuangfeng = fengArr[Math.floor((jushu - 1) / 4)];
  let menfeng = fengArr[Math.floor(Math.random() * 4)];
  function popPai(array: string[] = pais) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array.splice(randomIndex, 1)[0];
  }
  let order: string[];

  const getOrder = (menfeng: string) => {
    switch (menfeng) {
      case "東":
        return ["main", "xiajia", "duimian", "shangjia"];
      case "北":
        return ["xiajia", "duimian", "shangjia", "main"];
      case "西":
        return ["duimian", "shangjia", "main", "xiajia"];
      default:
        return ["shangjia", "main", "xiajia", "duimian"];
    }
  };

  function extractPai(target: string, arr: string[] = pais): string | undefined {
    const index = arr.indexOf(target);
    if (index === -1) {
      return undefined;
    }
    return arr.splice(index, 1)[0];
  }
  beforeEach(() => {
    // prettier-ignore
    pais=[
      "m1",  "m1",  "m1",  "m1",  "m2",  "m2",  "m2",  "m2",  "m3",  "m3",  "m3",  "m3",  "m4",  "m4",  "m4",  "m4",  "m5",  "m5",  "m5",  "m5t",  "m6","m6",  "m6",  "m6",  "m7",  "m7",  "m7",  "m7",  "m8",  "m8",  "m8",  "m8",  "m9",  "m9",  "m9",  "m9",  //萬子
      "s1","s1",  "s1",  "s1",  "s2",  "s2",  "s2",  "s2",  "s3",  "s3",  "s3",  "s3",  "s4",  "s4",  "s4",  "s4",  "s5",  "s5",  "s5",  "s5t",  "s6", "s6",  "s6",  "s6",  "s7",  "s7",  "s7",  "s7",  "s8",  "s8",  "s8",  "s8",  "s9",  "s9",  "s9",  "s9",   //索子
      "p1","p1",  "p1",  "p1",  "p2",  "p2",  "p2",  "p2",  "p3",  "p3",  "p3",  "p3",  "p4",  "p4",  "p4",  "p4",  "p5",  "p5",  "p5",  "p5t",  "p6",  "p6",  "p6",  "p6",  "p7",  "p7",  "p7",  "p7",  "p8",  "p8",  "p8",  "p8",  "p9",  "p9",  "p9",  "p9",   //筒子
      "z1","z1",  "z1",  "z1",  "z2",  "z2",  "z2",  "z2",  "z3",  "z3",  "z3",  "z3",  "z4",  "z4",  "z4",  "z4",  "z5",  "z5",  "z5",  "z5",  "z6",  "z6",  "z6",  "z6",  "z7",  "z7",  "z7",  "z7",//字牌
    ];
    const qipai = initQipai
      ? initQipai
          .map((p) => extractPai(p))
          .sort()
          .join("+")
      : Array.from({ length: 13 }, () => popPai())
          .sort()
          .join("+");
    const wangpai = Array.from({ length: 14 }, () => popPai());
    const taqipai = Array.from({ length: 13 * 3 }, () => popPai()).join("+"); //他家配牌分
    console.log("qipaigo pais", pais);

    //配牌
    cy.visit("/");
    cy.get(".testplay").click().wait(500);
  });

  it("fulou", () => {
    cy.wrap({}).then(() => {
      console.log(pais);
      cy.pause();
    });
    cy.wrap({}).then(() => {
      console.log(extractPai("z1"));
      cy.pause();
    });
    cy.wrap({}).then(() => {
      console.log(pais);
      cy.pause();
    });
  });
});
