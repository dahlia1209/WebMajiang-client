import { Server, WebSocket,type Client  } from "mock-socket";
import { server } from "typescript";


class GameMessage {
  type: string;
  game: { action: string | null,
    turn: string | null,
    dapai: string | null,
    zimopai: string | null,
    fulou: string | null,
    qipai: string|null,
    fulouCandidates: string|null,
    lizhipai: string|null,
    hule: string|null
  };

  constructor(game:{
    action?: string | null,
    turn?: string | null,
    dapai?: string | null,
    zimopai?: string | null,
    fulou?: string | null,
    qipai?: string|null,
    fulouCandidates?: string|null,
    lizhipai?: string|null,
    hule?: string|null,
  }){
    this.type="game",
    this.game={
      action: game.action??null,
      turn:game.turn??null,
      dapai: game.dapai??null,
      zimopai: game.zimopai??null,
      fulou: game.fulou??null,
      qipai:game.qipai??null,
      fulouCandidates: game.fulouCandidates??null,
      lizhipai:game.lizhipai??null,
      hule:game.hule??null,
    }
  }
}


describe("Board", () => {
  let scoreMessage={
    "type": "score",
    "score": {
        "zhuangfeng": "東","menfeng": "東","jushu": 1,"jicun": 0,"changbang": 0,
        "defen": [25000,25000,25000,25000],
        "baopai": ["m1f","b0f","b0f","b0f","b0f"],
        "paishu": 70
    }
  }
  let gameMessage:GameMessage=new GameMessage({})
  let server=new Server('ws://localhost:4173/', { mock: false });
  const getNextPosition=(pos:string)=>{
    const positions=["main","xiajia","duimian","shangjia","main"]
    const nexIdx= positions.indexOf(pos)+1
    if (nexIdx==0) throw new Error(`正しいポジションを指定してください.position:${pos}`)
    return positions[nexIdx]
  }

  
  
  beforeEach(() => {
    cy.visit("/",{onBeforeLoad(win){
      win.WebSocket=WebSocket
      server=new Server("ws://127.0.0.1:8000/ws")
    }})
    
  })
  it("lizhi", () => {
    //
    let zimoCounter=0
    const zimoCountLimit=6
    //ハンドラー
    const _kaijuHandler=(socket:Client,message:GameMessage)=>{
      gameMessage=new GameMessage({
        "action": "qipai",
        "qipai": "m1f+m1f+m1f+m3f+m4f+m5f+m8f+m8f+m8f+p1f+p1f+p3f+p4f",
      })
      socket.send(JSON.stringify(gameMessage))
    }

    const _qipaiHandler=(socket:Client,message:GameMessage)=>{
      gameMessage=new GameMessage({
        "action": "zimo",
        "turn":"main",
        "zimopai": "z1f",
        "lizhipai":"z1f"
      })
      socket.send(JSON.stringify(gameMessage))
    }

    const _zimoHandler=(socket:Client,message:GameMessage)=>{
      zimoCounter++
      if (zimoCounter>zimoCountLimit){
        return
      }
      if (message.game.lizhipai !=null){
        const fulouCandidates=message.game.turn=="main"?"chi,m2,m3+m4,null" :null
        gameMessage=new GameMessage({
          "action": "lizhi",
          "turn":message.game.turn,
          "dapai": message.game.lizhipai,
          "fulouCandidates":fulouCandidates
        })
      }
      else if(message.game.hule !=null){
        gameMessage=new GameMessage({
          "action": "hule",
          "turn":message.game.turn,
          "hule": message.game.hule,
        })
      }
      else{
        const dapai=message.game.dapai==null?`p${zimoCounter%9}f,99`:message.game.dapai
        
        gameMessage=new GameMessage({
          "action": "dapai",
          "turn":message.game.turn,
          "dapai": dapai,
          "hule": "p2f+p5f",
        })
      }
      socket.send(JSON.stringify(gameMessage))
    }

    const _dapaiHandler=(socket:Client,message:GameMessage)=>{
      const nextPos=getNextPosition(message.game.turn!)
      const zimopai=nextPos=="main"?"p2f":"b0f" 
      const hule=nextPos=="main"?"p2f+p5f":null 
      gameMessage=new GameMessage({
        "action": "zimo",
        "turn":nextPos,
        "zimopai": zimopai,
        "hule": hule,
      })
      socket.send(JSON.stringify(gameMessage))
    }

    const _lizhiHandler=(socket:Client,message:GameMessage)=>{
      _dapaiHandler(socket,message)
    }



    const _connectionHandler=(socket:Client)=>{
      console.log("mockserver listening･･･")
      socket.send(JSON.stringify(scoreMessage))
      socket.on("message",(message)=>{
        gameMessage=JSON.parse(message as string) as GameMessage
        if (gameMessage.game.action=="kaiju") _kaijuHandler(socket,gameMessage)
        else if (gameMessage.game.action=="qipai") _qipaiHandler(socket,gameMessage)
        else if (gameMessage.game.action=="zimo") _zimoHandler(socket,gameMessage)
        else if (gameMessage.game.action=="lizhi") _lizhiHandler(socket,gameMessage)
        else if (gameMessage.game.action=="dapai") _dapaiHandler(socket,gameMessage)
      })
    }

    //メイン処理
    server.on("connection",_connectionHandler)
    cy.get(".testplay").should("exist").click()
    cy.get('.lizhi').should("exist").click()
    cy.get('.zimo').should("exist").click()
    cy.get('.xiajia-he').find("img").should('have.length', 1)
    cy.get('.main-player-action').find("button").should('have.length', 2)
    cy.get('.cancel').should("exist").click()
    cy.get('.duimian-he').find("img").should('have.length', 1)
    cy.get('.shangjia-he').find("img").should('have.length', 1)
    cy.get('.main-player-action').find("button").should('have.length', 1)
    cy.get('.hule').should("exist").click()
    
    // cy.get('.hule').click().get('.zimo').click()
  });
});
