import { describe, it, expect } from 'vitest'

import {useHe, He} from '../he'
import { useShoupai,  Shoupai,  Fulou,createPais } from "../shoupai";

describe('useHe', () => {
    it('useHe init', () => {
        const he=new He()
        let h=useHe(he)
        expect(h.value.pai.length).toBe(0)

        const pai=createPais([
            '1m','2m','3m','4m','5m','5mt','6m','7m','8m','9m',
            '1s','2s','3s','4s','5s','5st','6s','7s','8s','9s',
            '1p','2p','3p','4p','5p','5pt','6p','7p','8p','9p',
            '1z','2z','3z','4z','5z','6z','7z'
        ])
        h.value.pai=pai
        expect(h.value.pai.length).toBe(37)
        
        h.value.pai=[]
        pai.forEach((p)=>h.value.pai.push(p))
        expect(h.value.pai.length).toBe(37)
        expect(h.value.pai[0].name()).toBe('m1')
        expect(h.value.pai[36].name()).toBe('z7')
        
    })
})