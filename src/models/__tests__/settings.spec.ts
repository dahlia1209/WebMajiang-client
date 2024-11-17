import { describe, it, expect } from 'vitest'

import {useSettings,Settings} from '../settings'

describe('useHe', () => {
    it('useHe init', () => {
        const settings=new Settings()
        let s=useSettings(settings)
        expect(s.value.mode).toBe(0)

    })
})