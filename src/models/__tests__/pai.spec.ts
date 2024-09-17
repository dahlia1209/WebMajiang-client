import { describe, it, expect } from 'vitest'

import {usePai, Pai} from '../pai'

describe('usePai', () => {
  it('usePai init', () => {
    let pai
    //裏
    pai = usePai(new Pai('b',1))
    expect(pai.value.suit).toBe('b')
    expect(pai.value.num).toBe(0) //0になる
    expect(pai.value.isRed).toBe(false)
    //萬子
    pai = usePai(new Pai('m',1))
    expect(pai.value.suit).toBe('m')
    expect(pai.value.num).toBe(1)
    expect(pai.value.isRed).toBe(false)
    //筒子
    pai = usePai(new Pai('p',5,true))
    expect(pai.value.suit).toBe('p')
    expect(pai.value.num).toBe(5)
    expect(pai.value.isRed).toBe(true)
    //索子
    pai = usePai(new Pai('s',9))
    expect(pai.value.suit).toBe('s')
    expect(pai.value.num).toBe(9)
    expect(pai.value.isRed).toBe(false)
    //字牌
    pai = usePai(new Pai('z',7))
    expect(pai.value.suit).toBe('z')
    expect(pai.value.num).toBe(7)
    expect(pai.value.isRed).toBe(false)
    //例外
    expect(()=>{usePai(new Pai('b',0,true))}).toThrowError()
    expect(()=>{usePai(new Pai('m',0))}).toThrowError()
    expect(()=>{usePai(new Pai('m',10))}).toThrowError()
    expect(()=>{usePai(new Pai('z',0))}).toThrowError()
    expect(()=>{usePai(new Pai('z',8))}).toThrowError()
    expect(()=>{usePai(new Pai('m',1,true))}).toThrowError()
    expect(()=>{usePai(new Pai('z',5,true))}).toThrowError()
  })
  it('usePai init', () => {
    let pai
    //萬子
    pai = usePai(new Pai('m',1))
    expect(pai.value.name()).toBe("m1")
  })
})
