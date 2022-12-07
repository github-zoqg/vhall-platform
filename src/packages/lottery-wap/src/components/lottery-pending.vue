<template>
  <div class="vmp-lottery-pending">
    <div v-if="needJoin" class="lottery-send-command-container">
      <span class="lottery-send-command">
        <i18n path="interact_tools.interact_tools_1065" tag="p">
          <span class="lottery-command" place="n">{{ lotteryInfo.command }}</span>
        </i18n>
      </span>
    </div>
    <!-- 自定义图片的抽奖样式 -->
    <template v-if="isCustom">
      <div class="vmp-lottery-pending-custom">
        <div class="lottery-pending-animation">
          <img class="lottery-pending-animation-img" :src="fitment.url" alt />
        </div>
        <span class="remark-text-fitment">
          {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}` }}
        </span>
        <button v-if="needJoin" class="vmp-lottery-btn" @click="joinLottery">
          {{ $t('interact_tools.interact_tools_1008') }}
        </button>
      </div>
    </template>
    <!-- 自定义图片的抽奖样式 -->
    <div v-else class="vmp-lottery-pending-container">
      <acclaim v-if="!needJoin && inProgress" class="acclaim-panel"></acclaim>
      <div id="lottery-svga"></div>
      <p :class="['lottery-remark', `order-${fitment.img_order}`]">
        <span class="remark-text">
          {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}` }}
        </span>
      </p>
      <div
        :class="['start-lottery-btn', `order-${fitment.img_order}`]"
        @touchstart="handleClickStartLottery"
      >
        <img
          :class="['start-lottery-btn-ae', btnActived ? 'active' : '']"
          :src="btnImgUrl"
          alt=""
        />
      </div>
    </div>
  </div>
</template>
<script>
  import props from './props';
  import acclaim, { acclaimAE } from '../art/acclaim/index.vue';
  import {
    slotmachineResource,
    turnplateResource,
    capsuleResource
  } from '@/app-shared/utils/lotterySvga';
  import { useChatServer } from 'middle-domain';
  import SVGA from 'svgaplayerweb';
  let player, parser;

  const animationEffectArr = [null, turnplateResource, slotmachineResource, capsuleResource];

  export default {
    name: 'LotteryPending',
    inject: ['lotteryServer'],
    mixins: [props],
    components: {
      acclaim
    },
    computed: {
      isCustom() {
        return this.fitment.img_order === 0;
      },
      // 显示
      needJoin() {
        return (
          this.lotteryInfo.lottery_type == 8 &&
          this.lotteryInfo.submit_command !== 1 &&
          !this.joined
        );
      },
      // 口令抽奖是否需要登录状态
      needLoginStatus() {
        if (this.configList && !this.configList['ui.show_chat_without_login']) {
          //
          if (this.joinUserId !== 0 || this.isEmbed) {
            // 当前为嵌入页或已登录
            return false;
          } else {
            return true;
          }
        } else {
          // 配置了聊天免登录
          return false;
        }
      },
      // 是否是嵌入页
      isEmbed() {
        return this.$domainStore.state?.roomBaseServer?.embedObj?.embed;
      },
      // 房间配置
      configList() {
        return this.$domainStore.state?.roomBaseServer?.configList;
      },
      // 参会id(识别登录状态)
      joinUserId() {
        return this.$domainStore.state?.roomBaseServer?.watchInitData?.join_info?.user_id;
      }
    },
    data() {
      return {
        loading: false,
        joined: false,
        inProgress: false,
        btnImgUrl: null,
        timer: null,
        btnActived: false //按钮是否持续按的激活状态
      };
    },
    mounted() {
      if (this.fitment.img_order !== 0) {
        this.initSvgaResource();
      }
    },
    beforeDestroy() {
      // 删除资源实例
      player && player.destroy && player.destroy();
      parser && parser.destroy && parser.destroy();
      this.clearTimer();
    },
    methods: {
      // 点击参与抽奖
      handleClickStartLottery() {
        if (this.needJoin && !this.joined) {
          this.joinLottery();
        } else {
          this.startAnimation();
          this.activeBtn();
        }
      },
      // 发送口令
      joinLottery() {
        if (this.needLoginStatus) {
          return this.$emit('needLogin');
        }
        if (this.loading || this.joined) return;
        this.loading = true;
        this.lotteryServer
          .joinLottery(this.lotteryId || this.lotteryInfo.id || this.lotteryInfo.lottery_id)
          .then(res => {
            if (res.code === 200) {
              const msg = useChatServer().createCurMsg();
              msg.setText(this.lotteryInfo.command);
              useChatServer().sendMsg(msg);
              this.joined = true;
              this.$toast(this.$t('chat.chat_1010'));
              if (!this.isCustom) {
                this.startAnimation();
              }
            }
          })
          .finally(() => {
            this.loading = false;
          });
      },
      initSvgaResource() {
        player = new SVGA.Player('#lottery-svga');
        parser = new SVGA.Parser('#lottery-svga');
        console.log('this.fitment', this.fitment);
        let itemIdx = this.fitment.img_order;
        if (![1, 2, 3].includes(this.fitment.img_order)) {
          itemIdx = 1;
        }
        const resourceItem = animationEffectArr[itemIdx];
        parser.load(resourceItem.svgaUrl, videoItem => {
          player.setVideoItem(videoItem);
          this.btnImgUrl = resourceItem.coverBtnImgUrl;
          const cacheKey = `lottery_${this.lotteryId}_cache`;
          const cache = sessionStorage.getItem(cacheKey);
          if (cache) {
            this.startAnimation();
          } else {
            if (this.needJoin) {
              this.btnImgUrl = resourceItem.sendBtnImgUrl;
            }
            player.stepToFrame(0, false);
          }
        });
      },
      startAnimation() {
        const cacheKey = `lottery_${this.lotteryId}_cache`;
        sessionStorage.setItem(cacheKey, 1);
        acclaimAE();
        if (this.inProgress) return false;
        this.inProgress = true;
        player.startAnimationWithRange({
          location: 30,
          length: 60
        });
      },
      // 按钮点击的激活状态
      activeBtn() {
        this.btnActived = true;
        this.clearTimer();
        this.timer = setTimeout(() => {
          this.btnActived = false;
          this.clearTimer();
        }, 200);
      },
      clearTimer() {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-lottery-pending {
    text-align: center;
    .acclaim-panel {
      width: 680px;
      height: 400px;
      position: absolute;
      top: -120px;
      left: 0;
    }
    .vmp-lottery-pending-container {
      width: 640px;
      height: 760px;
      position: relative;
    }
    .lottery-send-command-container {
      display: inline-block;
      position: relative;
      text-align: center;
      padding: 8px 0;
      margin-bottom: 44px;
      background: linear-gradient(89.99deg, #ff1d00 -7.32%, rgba(255, 79, 57, 0.2) 63.55%);
      background-color: rgba(initial, 0.65;);
      box-shadow: inset 0px 4px 8px rgba(255, 255, 255, 0.25);
      border-radius: 26px;
      &::before {
        // 大的⭐️
        content: '';
        display: inline-block;
        position: absolute;
        right: -24px;
        bottom: -20px;
        width: 40px;
        height: 50px;
        background-image: url('../img/star-1.png');
        background-size: contain;
      }
      &::after {
        // 小的⭐️
        content: '';
        display: inline-block;
        position: absolute;
        right: -32px;
        bottom: 0;
        width: 16px;
        height: 30px;
        background-image: url('../img/star-2.png');
        background-size: contain;
        background-repeat: no-repeat;
      }
    }
    .remark-text-fitment {
      color: #fff;
    }
    .lottery-send-command {
      display: inline-block;
      padding: 0 12px;
      color: #fce09e;
    }
    .lottery-command {
      color: #fff;
    }
    #lottery-svga {
      width: 100%;
      height: 100%;
    }
    .lottery-pending-animation {
      display: block;
      margin: 0 auto;
      width: 640px;
      height: 640px;
      .lottery-pending-animation-img {
        display: inline-block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .lottery-remark {
      display: inline-block;
      position: absolute;
      color: #fff;
      font-size: 28px;
      top: 550px;
      left: 50%;
      height: 40px;
      transform: translate(-50%);
      text-align: center;
      overflow: hidden;
      &.order-1 {
        font-size: 24px;
        width: 220px;
        top: 640px;
        color: #fff1ce;
      }
      &.order-2 {
        width: 300px;
        top: 118px;
        color: #fff;
      }
      &.order-3 {
        width: 180px;
        top: 486px;
        color: #fff;
      }
      .remark-text {
        white-space: nowrap;
        position: absolute;
        transform: translateX(100%);
        left: 0;
        animation: move2left 5s linear infinite;
      }
      // 文字往左移
      @keyframes move2left {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(-100%);
        }
      }
    }
    .start-lottery-btn {
      display: inline-block;
      height: 150px;
      width: 150px;
      position: absolute;
      top: 250px;
      left: 300px;
      &.order-1 {
        top: 210px;
        left: 232px;
        height: 180px;
        width: 180px;
        &::before {
          content: '';
          width: 60px;
          height: 60px;
          position: absolute;
          top: -32px;
          left: 50%;
          transform: translate(-50%);
          background-image: url('../img/lottery-arrow.png');
          background-size: contain;
        }
      }
      &.order-2 {
        top: 560px;
        left: 160px;
        height: 140px;
        width: 330px;
      }
      &.order-3 {
        top: 600px;
        left: 360px;
        height: 100px;
        width: 180px;
      }
    }
    .vmp-lottery-btn {
      display: block;
      margin: 32px auto 0;
    }
    // 按钮图片与效果
    .start-lottery-btn-ae {
      display: inline-block;
      position: relative; // 用文档流提高层级
      width: 100%;
      height: 100%;
      object-fit: contain;
      z-index: 10;
      animation-name: zoom;
      animation-duration: 600ms;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      animation-direction: alternate-reverse;
      &.active {
        // animation-iteration-count: 1;
        animation-duration: 100ms;
      }
    }
    @keyframes zoom {
      to {
        transform: scale(1.1);
      }
    }
  }
</style>
