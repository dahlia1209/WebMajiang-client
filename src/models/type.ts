export type PaiSuit = "b" | "m" | "p" | "s" | "z";

export type Position = "main" | "xiajia" | "duimian" | "shangjia";

export type PlayerStatus = "thinking" | "ready";

export type PlayerAction =
  | "kaiju"
  | "dapai"
  | "hule"
  | "lizhi"
  | "zimo"
  | "fulou"
  | "qipai"
  |"pingju"
  |"jieju"

export type Feng = "東" | "南" | "西" | "北";

export type HandlerType = 'mainSelfTurn' | 'mainOtherTurn' | 'tajiaSelfTurn' | 'tajiaOtherTurn';

export type MessageType='game'|'score'|'message'