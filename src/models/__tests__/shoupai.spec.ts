import { describe, it, expect } from "vitest";

import { usePai,  Pai } from "../pai";
import { useShoupai,  Shoupai,  Fulou,createPais } from "../shoupai";
import { ref} from "vue";
import exp from "constants";

describe("useShoupai", () => {
  it("useShoupai init", () => {
    let shoupai;
    let bingpai: Pai[];
    let fulou: Fulou[];
    let zimopai;
    let waiting_hule_pai;
    let waiting_fulou_pai;

    //生成
    bingpai = [
      new Pai("m", 1),
      new Pai("m", 2),
      new Pai("m", 3),
      new Pai("m", 4),
      new Pai("m", 5),
      new Pai("m", 6),
      new Pai("m", 7),
      new Pai("m", 8),
      new Pai("m", 9),
      new Pai("p", 1),
    ];
    fulou = [
      new Fulou("peng", new Pai("z", 3), createPais(["3z", "3z"]), 'shangjia'),
      
    ];
    zimopai = new Pai("z", 3);
    shoupai = useShoupai(new Shoupai());
    shoupai = useShoupai(new Shoupai(bingpai));
    shoupai = useShoupai(new Shoupai(bingpai, zimopai, fulou));
    expect(shoupai.value.bingpai.length).toBe(10);
    // expect(shoupai.value.bingpai[0].isClickable).toStrictEqual(false);
    expect(shoupai.value.bingpai[0]).toStrictEqual(bingpai[0]);
    expect(shoupai.value.bingpai[9]).toStrictEqual(bingpai[9]);
    expect(shoupai.value.fulou.length).toBe(1);
    expect(shoupai.value.fulou[0].type).toBe("peng");
    expect(shoupai.value.fulou[0].nakipai).toStrictEqual(fulou[0].nakipai);
    expect(shoupai.value.fulou[0].fuloupais).toStrictEqual([
      fulou[0].fuloupais[0],
      fulou[0].fuloupais[1],
    ]);
    expect(shoupai.value.zimopai).toStrictEqual(zimopai);
  });

  it("test createPais", () => {
    let pais;
    // 1
    pais=createPais(['1m'])
    expect(pais.length).toBe(1)
    expect(pais[0].suit).toBe('m')
    expect(pais[0].num).toBe(1)

    //2
    pais=createPais(['5mt'])
    expect(pais[0].suit).toBe('m')
    expect(pais[0].num).toBe(5)
    expect(pais[0].isRed).toBe(true)

    //3
    pais=createPais(['9sft'])
    expect(pais[0].suit).toBe('s')
    expect(pais[0].num).toBe(9)
    expect(pais[0].isRed).toBe(false)
    // expect(pais[0].isClickable).toBe(true)

    //4
    pais=createPais(['1zfft'])
    expect(pais[0].suit).toBe('z')
    expect(pais[0].num).toBe(1)
    expect(pais[0].isRed).toBe(false)
    // expect(pais[0].isClickable).toBe(false)
    // expect(pais[0].isHidden).toBe(true)
    
    //multiple
    pais=createPais(['1m','2m','3m','4m','5m','6m','7m','8m','9m','1p','1p','2p','3p'])
    expect(pais.length).toBe(13)
    expect(pais[12].num).toBe(3)
    expect(pais[12].suit).toBe('p')
  })

  it("test doFulou",()=>{
    let bingpai: Pai[]=createPais(["1m","2m","4m","4m","5m","5m","5m","9m","9m","9m","9m"])
    let fulou: Fulou[]=[];
    let zimopai:Pai|null=null
    let shoupai:Shoupai=new Shoupai(bingpai,zimopai,fulou)
    const s=useShoupai(shoupai)

    //チー
    s.value.doFulou(new Fulou("chi",new Pai("m",3),createPais(["1m","2m"])))
    expect(s.value.fulou.length).toBe(1)
    expect(s.value.fulou[0].type).toBe("chi")
    expect(s.value.bingpai.length).toBe(9)

    //ポン
    s.value.doFulou(new Fulou("peng",new Pai("m",4),createPais(["4m","4m"])))
    expect(s.value.fulou.length).toBe(2)
    expect(s.value.fulou[0].type).toBe("peng")
    expect(s.value.bingpai.length).toBe(7)
    
    //明槓
    s.value.doFulou(new Fulou("minggang",new Pai("m",5),createPais(["5m","5m","5m"])))
    expect(s.value.fulou.length).toBe(3)
    expect(s.value.fulou[0].type).toBe("minggang")
    expect(s.value.bingpai.length).toBe(4)
    
    //暗槓
    s.value.doFulou(new Fulou("angang",null,createPais(["9m","9m","9m","9m"])))
    expect(s.value.fulou.length).toBe(4)
    expect(s.value.fulou[0].type).toBe("angang")
    expect(s.value.bingpai.length).toBe(0)
    //加槓
    s.value.setZimopai(new Pai("m",4))
    s.value.doFulou(new Fulou("jiagang",new Pai("m",4),createPais(["4m","4m","4m"])))
    expect(s.value.fulou.length).toBe(4)
    expect(s.value.fulou[2].type).toBe("jiagang")
    expect(s.value.bingpai.length).toBe(0)
    expect(s.value.zimopai).toBe(null)

    //エラーハンドリング
    bingpai=createPais(["1m","2m","4m","4m","5m","5m","5m","9m","9m","9m","9m"])
    fulou=[]
    zimopai=null
    s.value.bingpai=bingpai
    s.value.fulou=fulou
    s.value.zimopai=null
    let f=new Fulou("chi",new Pai("s",3),createPais(["1s","2s"]))
    expect(()=>{s.value.doFulou(f)}).toThrowError()
    f=new Fulou("peng",new Pai("z",4),createPais(["4z","4z"]))
    expect(()=>{s.value.doFulou(f)}).toThrowError()
    f=new Fulou("minggang",new Pai("s",5),createPais(["5s","5s","5s"]))
    expect(()=>{s.value.doFulou(f)}).toThrowError()
    f=new Fulou("angang",null,createPais(["4m","4m","4m","4m"]))
    expect(()=>{s.value.doFulou(f)}).toThrowError()
    f=new Fulou("jiagang",new Pai("m",4),createPais(["4m","4m","4m"]))
    expect(()=>{s.value.doFulou(f)}).toThrowError()
    s.value.fulou=[new Fulou("peng",new Pai("m",3),createPais(["3m","3m"]))]
    f=new Fulou("jiagang",new Pai("m",3),createPais(["3m","3m","3m"]))
    expect(()=>{s.value.doFulou(f)}).toThrowError()
    
  })
  it("fulou serialize and deserialize",()=>{
    let fulou:Fulou
    //serialize
    fulou=new Fulou("peng")
    expect(fulou.serialize()).toBe("peng,null,null,null")
    fulou=new Fulou("chi",new Pai("m",1),createPais(["2m","3m"]),"duimian")
    expect(fulou.serialize()).toBe("chi,m1f,m2f+m3f,duimian")

    //deserialize
    fulou=Fulou.deserialize("angang,null,z1f+z1f+z1f+z1f,null")
    expect(fulou.type).toBe("angang")
    expect(fulou.nakipai).toBe(null)
    expect(fulou.fuloupais.length).toBe(4)
    expect(fulou.fuloupais[0].name()).toBe("z1")
    expect(fulou.fuloupais[3].name()).toBe("z1")
    expect(fulou.position).toBe(null)
    fulou=Fulou.deserialize("minggang,p5t,p5f+p5f+p5f,duimian")
    expect(fulou.type).toBe("minggang")
    expect(fulou.nakipai?.name()).toBe("p0")
    expect(fulou.fuloupais.length).toBe(3)
    expect(fulou.fuloupais[0].name()).toBe("p5")
    expect(fulou.fuloupais[2].name()).toBe("p5")
    expect(fulou.position).toBe("duimian")

    //exception
    expect(()=>Fulou.deserialize("angang,null,z1f+z1f+z1f+z1f"))
    expect(()=>Fulou.deserialize("angang,null,z1f+z1f+z1f+z1f,null,null"))

  })
});
