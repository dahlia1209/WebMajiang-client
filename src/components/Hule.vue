<script setup lang="ts">
import type { Position } from '@/models/type';
import { useGameStore } from '@/stores/game'
import { useWebSocketStore } from '@/stores/websocket'
import { computed } from 'vue';

const gameStore = useGameStore()
const wsStore = useWebSocketStore();
const scaleSize=computed(()=>Math.min(gameStore.windowWidth/800,1))

const clickHandle=()=>{
  wsStore.client.callbackMessage({action:gameStore.getAction!,turn:gameStore.getTurn!})
}
</script>

<template>
  <div class="hule-dialog" aria-label="ホーラ情報" @click="clickHandle">
    <div class="hule-dialog-container">
      
        <div class="hule">
          <!-- <div class="shan baopai"><span class="baopai" aria-label="ドラ"><img class="pai" data-pai="z5" src="img/z5.gif" alt="ハク"><img class="pai" data-pai="_" src="img/pai.gif" alt=""><img class="pai" data-pai="_" src="img/pai.gif" alt=""><img class="pai" data-pai="_" src="img/pai.gif" alt=""><img class="pai" data-pai="_" src="img/pai.gif" alt=""></span></div>
                <div class="shan fubaopai"><span class="fubaopai" aria-label="裏ドラ"><img class="pai" data-pai="p0" src="img/p0.gif" alt="赤ウーピン"><img class="pai" data-pai="_" src="img/pai.gif" alt=""><img class="pai" data-pai="_" src="img/pai.gif" alt=""><img class="pai" data-pai="_" src="img/pai.gif" alt=""><img class="pai" data-pai="_" src="img/pai.gif" alt=""></span></div>
                <div class="shoupai">
                  <div class="bingpai" aria-label="手牌"><img class="pai" data-pai="m2" src="img/m2.gif" alt="リャンワン"><img class="pai" data-pai="m3" src="img/m3.gif" alt="サンワン"><img class="pai" data-pai="m4" src="img/m4.gif" alt="スーワン"><img class="pai" data-pai="p4" src="img/p4.gif" alt="スーピン"><img class="pai" data-pai="p5" src="img/p5.gif" alt="ウーピン"><img class="pai" data-pai="p6" src="img/p6.gif" alt="ローピン"><img class="pai" data-pai="s2" src="img/s2.gif" alt="リャンソー"><img class="pai" data-pai="s4" src="img/s4.gif" alt="スーソー"><img class="pai" data-pai="s7" src="img/s7.gif" alt="チーソー"><img class="pai" data-pai="s7" src="img/s7.gif" alt="チーソー"><img class="pai" data-pai="z6" src="img/z6.gif" alt="ハツ"><img class="pai" data-pai="z6" src="img/z6.gif" alt="ハツ"><img class="pai" data-pai="z6" src="img/z6.gif" alt="ハツ"><span class="zimo"><img class="pai" data-pai="s3" src="img/s3.gif" alt="サンソー"></span></div>
                  <div class="fulou"></div>
                </div>
                <table class="hupai"><tr class="r_hupai">
                    <td class="name">立直</td>
                    <td class="fanshu">1翻</td>
                  </tr><tr class="r_hupai">
                    <td class="name">翻牌 發</td>
                    <td class="fanshu">1翻</td>
                  </tr><tr class="r_hupai">
                    <td class="name">ドラ</td>
                    <td class="fanshu">3翻</td>
                  </tr><tr class="r_hupai">
                    <td class="name">裏ドラ</td>
                    <td class="fanshu">1翻</td>
                  </tr><tr class="r_defen">
                    <td class="defen" colspan="2">40符 6翻 跳満 12000点</td>
                  </tr></table> -->
          <div class="jicun">
            <!-- <img class="chouma" src="img/100.gif" alt="本場"> : <span class="changbang">0</span> <img class="chouma" src="img/1000.gif" alt="供託"> : <span class="lizhibang">1</span> -->
          </div>
        </div>
        <div class="pingju hide fadeout">

        </div>
        <div class="fenpei">
          <div v-for="(p,i) in ['main','xiajia','duimian','shangjia']" :class="p">{{ gameStore.score.getPlayerFeng(p as Position) }}</div>
          <!-- <div class="main"><span class="feng">南</span>: <span class="player">私</span><span
              class="defen">25,000</span><span class="diff"></span></div>
          <div class="xiajia"><span class="feng">西</span>: <span class="player">下家</span><span
              class="defen">25,000</span><span class="diff"></span></div>
          <div class="duimian"><span class="feng">北</span>: <span class="player">対面</span><span
              class="defen">24,000</span><span class="diff plus">+13,000</span></div>
          <div class="shangjia"><span class="feng">東</span>: <span class="player">上家</span><span
              class="defen">25,000</span><span class="diff minus">-12,000</span></div> -->
        </div>
    </div>
  </div>

</template>

<style scoped>
.hule-dialog{
    position: absolute;
    display: flex;
    color: #fff;
}

.hule-dialog-container{
  min-width: 460px;
  min-height: 460px;
    padding: 20px;
    display: table;
    background: rgba(0, 0, 0, 0.8);
    margin: auto;
}

.main {
    position: absolute;
    transform: translate(146px, 48px);
}

.xiajia {
    position: absolute;
    transform: translate(292px, 24px);
}

.duimian {
    position: absolute;
    transform: translate(146px, 0px);
}

.shangjia {
    position: absolute;
    transform: translate(0px, 24px);
}



</style>