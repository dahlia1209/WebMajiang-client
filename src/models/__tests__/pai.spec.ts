import { describe, it, expect } from 'vitest'

import {usePai,type Pai} from '../pai'

describe('usePai', () => {
  it('usePai init', () => {
    let pai
    //裏
    pai = usePai('b',1)
    expect(pai.suit).toBe('b')
    expect(pai.num).toBe(0) //0になる
    expect(pai.isRed).toBe(false)
    //萬子
    pai = usePai('m',1)
    expect(pai.suit).toBe('m')
    expect(pai.num).toBe(1)
    expect(pai.isRed).toBe(false)
    //筒子
    pai = usePai('p',5,true)
    expect(pai.suit).toBe('p')
    expect(pai.num).toBe(5)
    expect(pai.isRed).toBe(true)
    //索子
    pai = usePai('s',9)
    expect(pai.suit).toBe('s')
    expect(pai.num).toBe(9)
    expect(pai.isRed).toBe(false)
    //字牌
    pai = usePai('z',7)
    expect(pai.suit).toBe('z')
    expect(pai.num).toBe(7)
    expect(pai.isRed).toBe(false)
    //例外
    expect(()=>{usePai('b',0,true)}).toThrowError()
    expect(()=>{usePai('m',0)}).toThrowError()
    expect(()=>{usePai('m',10)}).toThrowError()
    expect(()=>{usePai('z',0)}).toThrowError()
    expect(()=>{usePai('z',8)}).toThrowError()
    expect(()=>{usePai('m',1,true)}).toThrowError()
    expect(()=>{usePai('z',5,true)}).toThrowError()
  })
})
