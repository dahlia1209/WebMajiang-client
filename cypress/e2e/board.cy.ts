import { Server, WebSocket,type Client  } from "mock-socket";
import { server } from "typescript";
import {gameModule,ServerActions,GameMessage, GameContent} from "../models/game"

describe("Board", () => {
  const serverActions=new ServerActions()
  beforeEach(() => {
    cy.visit("/",{onBeforeLoad(win){
      win.WebSocket=WebSocket
      serverActions.mockServer()
    }})
  })
  afterEach(()=>serverActions.close())
  it("lizhi", () => {
    //自摸カウント
    let zimoCounter=0
    const zimoCountLimit=6
    //ハンドラー
    const _kaijuHandler=(socket:Client,message:GameMessage)=>{
      const gameMessage=GameMessage.create({
        "action": "qipai",
        "qipai": "m1f+m1f+m1f+m3f+m4f+m5f+m8f+m8f+m8f+p1f+p1f+p3f+p4f",
      })
      socket.send(JSON.stringify(gameMessage))
    }

    const _qipaiHandler=(socket:Client,message:GameMessage)=>{
      const gameMessage=GameMessage.create({
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
      console.log("_zimoHandler,message",message)
      if (message.game.lizhipai !=null){
        const fulouCandidates=message.game.turn=="main"?"chi,m2,m3+m4,null" :undefined
        const gameMessage=GameMessage.create({
          "action": "lizhi",
          "turn":message.game.turn,
          "dapai": `${message.game.lizhipai},99`,
          "fulouCandidates":fulouCandidates
        })
        socket.send(JSON.stringify(gameMessage))
      }
      else if(message.game.hule !=null){
        const gameMessage=GameMessage.create({
          "action": "hule",
          "turn":message.game.turn,
          "hule": message.game.hule,
        })
        socket.send(JSON.stringify(gameMessage))
      }
      else{
        const dapai=message.game.dapai==null?`p${zimoCounter%9}f,99`:message.game.dapai
        
        const gameMessage=GameMessage.create({
          "action": "dapai",
          "turn":message.game.turn,
          "dapai": dapai,
          "hule": "p2f+p5f",
        })
        socket.send(JSON.stringify(gameMessage))
      }
    }

    const _dapaiHandler=(socket:Client,message:GameMessage)=>{
      const nextPos=gameModule.getNextPosition(message.game.turn!)
      const zimopai=nextPos=="main"?"p2f":"b0f" 
      const hule=nextPos=="main"?"p2f+p5f":undefined 
      const gameMessage=GameMessage.create({
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
      socket.send(JSON.stringify(gameModule.getScoreMessage()))
      socket.on("message",(message)=>{
        console.log("_connectionHandler,message",message)
        const gameMessage=GameMessage.create((JSON.parse(message as string) as GameMessage).game)
        console.log("_connectionHandler,gameMessage",gameMessage)
        if (gameMessage.game.action=="kaiju") _kaijuHandler(socket,gameMessage)
        else if (gameMessage.game.action=="qipai") _qipaiHandler(socket,gameMessage)
        else if (gameMessage.game.action=="zimo") _zimoHandler(socket,gameMessage)
        else if (gameMessage.game.action=="lizhi") _lizhiHandler(socket,gameMessage)
        else if (gameMessage.game.action=="dapai") _dapaiHandler(socket,gameMessage)
      })
    }

    //メイン処理
    serverActions.server.on("connection",_connectionHandler)
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
    
  });

  it("gang", () => {
    //自摸カウント
    let zimoCounter=0
    const zimoCountLimit=6
    //ハンドラー
    const _kaijuHandler=(socket:Client,message:GameMessage)=>{
      const gameMessage=GameMessage.create({
        "action": "qipai",
        "qipai": "m2f+m2f+m2f+m2f+m4f+m5f+m8f+p3f+p3f+p3f+p4f+p4f+p4f",
      })
      socket.send(JSON.stringify(gameMessage))
    }

    const _qipaiHandler=(socket:Client,message:GameMessage)=>{
      const gameMessage=GameMessage.create({
        "action": "zimo",
        "turn":"main",
        "zimopai": "z1f",
        "fulouCandidates":"angang,null,m2f+m2f+m2f+m2f,null"
      })
      socket.send(JSON.stringify(gameMessage))
    }

    const _zimoHandler=(socket:Client,message:GameMessage)=>{
      zimoCounter++
      if (zimoCounter>zimoCountLimit){
        return
      }
      if (message.game.lizhipai !=null){
        const dapai=message.game.lizhipai==null?`${message.game.lizhipai},99`:message.game.lizhipai
        const fulouCandidates=message.game.turn=="main"?"chi,m2,m3+m4,null" :undefined
        const gameMessage=GameMessage.create({
          "action": "lizhi",
          "turn":message.game.turn,
          "dapai": dapai,
          "fulouCandidates":fulouCandidates
        })
        socket.send(JSON.stringify(gameMessage))
      }
      else if(message.game.hule !=null){
        const gameMessage=GameMessage.create({
          "action": "hule",
          "turn":message.game.turn,
          "hule": message.game.hule,
        })
        socket.send(JSON.stringify(gameMessage))
      }
      else if(message.game.fulou !=null){
        const gameMessage=GameMessage.create({
          "action": "fulou",
          "turn":message.game.turn,
          "fulou": message.game.fulou,
          "fulouCandidates":undefined
        })
        socket.send(JSON.stringify(gameMessage))
      }
      else{
        const dapai=message.game.dapai==null?`p${zimoCounter%9}f,99`:message.game.dapai
        
        const gameMessage=GameMessage.create({
          "action": "dapai",
          "turn":message.game.turn,
          "dapai": dapai,
        })
        if (message.game.dapai!=null){
          gameMessage.game.fulouCandidates='peng,p3,p3+p3,null|minggang,p3,p3+p3+p3,null'
        }
        socket.send(JSON.stringify(gameMessage))
      }
    }

    const _fulouHandler=(socket:Client,message:GameMessage)=>{
      if (message.game.zimopai =="b0f"){
        const fulouCandidates=[]
        const gameMessage=GameMessage.create({
          "action": "zimo",
          "turn":message.game.turn,
          "zimopai": "z5",
          "baopai":"p1"
        })
        if (zimoCounter==4){
          gameMessage.game.fulouCandidates="jiagang,p3,p3+p3,null"
        }
        socket.send(JSON.stringify(gameMessage))
      }
      else if(message.game.dapai !=null){
        const dapai=message.game.dapai==null?`p${zimoCounter%9}f,99`:message.game.dapai

        const gameMessage=GameMessage.create({
          "action": "dapai",
          "turn":message.game.turn,
          "dapai": dapai,
        })
        if (dapai=="z1f,7"){
          gameMessage.game.fulouCandidates="peng,p4,p4+p4,null|minggang,p4,p4+p4+p4,null"
        }
        socket.send(JSON.stringify(gameMessage))
      }
      
    }

    const _dapaiHandler=(socket:Client,message:GameMessage)=>{
      const nextPos=gameModule.getNextPosition(message.game.turn!)
      const zimopai=nextPos=="main"?"p2f":"b0f" 
      if (message.game.fulou !=null){
        const fuloutype=message.game.fulou.split(",")[0] 
        if (fuloutype == "peng") {
          const gameMessage = GameMessage.create({
            action: "fulou",
            turn: "main",
            fulou: message.game.fulou,
          });
          socket.send(JSON.stringify(gameMessage));
        }
        else if (fuloutype=="minggang"){
          const gameMessage = GameMessage.create({
            action: "fulou",
            turn: "main",
            fulou: message.game.fulou,
          });
          socket.send(JSON.stringify(gameMessage));
        }
      }
      else {
      const gameMessage=GameMessage.create({
        "action": "zimo",
        "turn":nextPos,
        "zimopai": zimopai,
      })
      socket.send(JSON.stringify(gameMessage))}
    }

    const _lizhiHandler=(socket:Client,message:GameMessage)=>{
      _dapaiHandler(socket,message)
    }



    const _connectionHandler=(socket:Client)=>{
      console.log("mockserver listening･･･")
      socket.send(JSON.stringify(gameModule.getScoreMessage()))
      socket.on("message",(message)=>{
        const gameMessage=GameMessage.create((JSON.parse(message as string) as GameMessage).game)
        if (gameMessage.game.action=="kaiju") _kaijuHandler(socket,gameMessage)
        else if (gameMessage.game.action=="qipai") _qipaiHandler(socket,gameMessage)
        else if (gameMessage.game.action=="zimo") _zimoHandler(socket,gameMessage)
        else if (gameMessage.game.action=="lizhi") _lizhiHandler(socket,gameMessage)
        else if (gameMessage.game.action=="dapai") _dapaiHandler(socket,gameMessage)
        else if (gameMessage.game.action=="fulou") _fulouHandler(socket,gameMessage)
      })
    }

    //メイン処理
    serverActions.server.on("connection",_connectionHandler)
    cy.get(".testplay").should("exist").click()
    //暗槓
    cy.get('.gang').should("exist").click()
    Array.from({length: 4}, (_, i) => cy.get('.clickable').eq(i).click());
    cy.get(".fulou").find(".mianzi").eq(0).should("exist")
    cy.get(".zimo").should("exist").click()
    cy.get(".main-he").find("img").should('have.length', 1)
    //ポン
    cy.get('.peng').should("exist").click()
    Array.from({length: 2}, (_, i) => cy.get('.clickable').eq(i).click());
    cy.get(".fulou").find(".mianzi").eq(1).should("exist")
    cy.get('.bingpai').find("img").eq(7).should("exist").click()
    //明槓
    cy.get('.gang').should("exist").click()
    Array.from({length: 3}, (_, i) => cy.get('.clickable').eq(i).click());
    //加槓
    cy.get('.gang').should("exist").click()
    cy.get('.clickable').eq(0).click()

    // cy.get('.xiajia-he').find("img").should('have.length', 1)
    // cy.get('.main-player-action').find("button").should('have.length', 2)
    // cy.get('.cancel').should("exist").click()
    // cy.get('.duimian-he').find("img").should('have.length', 1)
    // cy.get('.shangjia-he').find("img").should('have.length', 1)
    // cy.get('.main-player-action').find("button").should('have.length', 1)
    // cy.get('.hule').should("exist").click()
  })
});
