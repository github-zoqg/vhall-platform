<template>
  <div class="vmp-lottery-pending">
    <!-- 自定义图片的抽奖样式 -->
    <template v-if="isCustom">
      <div class="vmp-lottery-pending-custom">
        <!-- 发送参与 -->
        <i18n v-if="needJoin && mode === 'watch'" path="interact_tools.interact_tools_1065" tag="p">
          <span class="lottery-remark-custom" place="n">{{ command }}</span>
        </i18n>
        <p v-else class="lottery-remark-custom">
          {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}....` }}
        </p>
        <div class="lottery-pending-animation">
          <img class="lottery-pending-animation-img" :src="fitment.url" alt />
        </div>
        <button v-if="needJoin && mode === 'watch'" class="vmp-lottery-btn" @click="joinLottery">
          {{ $t('interact_tools.interact_tools_1008') }}
        </button>
      </div>
    </template>
    <!-- 自定义图片的抽奖样式 -->
    <div v-else class="vmp-lottery-pending-container">
      <div v-if="needJoin && mode === 'watch'" class="lottery-send-command-container">
        <span class="lottery-send-command">
          <i18n path="interact_tools.interact_tools_1065" tag="p">
            <span class="lottery-command" place="n">{{ lotteryInfo.command }}</span>
          </i18n>
        </span>
      </div>
      <acclaim v-else-if="inProgress && mode !== 'live'" class="acclaim-panel"></acclaim>
      <div id="lottery-svga"></div>
      <p :class="['lottery-remark', `order-${fitment.img_order}`]">
        <span class="remark-text">
          {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}` }}
        </span>
      </p>
      <div
        v-if="mode !== 'live'"
        :class="['start-lottery-btn', `order-${fitment.img_order}`]"
        @click="handleClickStartLottery"
      ></div>
    </div>
    <button
      v-if="mode === 'live'"
      class="vmp-lottery-btn"
      @click="endLottery"
      :disabled="disabledTime > 0 && disabledTime <= 5"
    >
      <span>
        结束抽奖
        <span v-if="disabledTime > 0 && disabledTime <= 5">({{ disabledTime }}s)</span>
      </span>
    </button>
  </div>
</template>
<script>
  import acclaim, { acclaimAE } from '../art/acclaim/index.vue';
  import props from './props';
  import { useChatServer } from 'middle-domain';
  import SVGA from 'svgaplayerweb';
  let player, parser;

  const slotmachineResource = {
    svgaUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/lottery-slotmachine.svga',
    imageKey: 'img_21117',
    sendBtnImgUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/send-slotmachine.png',
    coverBtnImgUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/cover-slotmachine.png'
  };
  const turnplateResource = {
    svgaUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/lottery-turnplate.svga',
    imageKey: 'img_39023',
    sendBtnImgUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/send-turnplate.png',
    coverBtnImgUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/cover-turnplate.png'
  };
  const capsuleResource = {
    svgaUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/lottery-capsule.svga',
    imageKey: 'img_39218',
    sendBtnImgUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/send-capsule.png',
    coverBtnImgUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/cover-capsule.png'
  };

  const animationEffectArr = [null, turnplateResource, slotmachineResource, capsuleResource];

  export default {
    name: 'LotteryPending',
    inject: ['lotteryServer'],
    mixins: [props],
    components: {
      acclaim
    },
    props: {
      lotteryId: {
        type: [String, Object, Number],
        required: true
      },
      mode: {
        // 是否显示结束抽奖(发起端)
        type: String,
        default() {
          return 'watch';
        }
      },
      disabledTime: {
        type: Number,
        default() {
          // return 0;
          return 5;
        }
      }
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
        if (this.configList && this.configList['ui.show_chat_without_login'] == '0') {
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
        endLotteryDisable: false, // 结束抽奖防抖3秒
        inProgress: false // 动画演示中(已点击,立刻抽奖)
      };
    },
    mounted() {
      if (this.fitment.img_order !== 0) {
        this.initSvgaResource();
      }
    },
    methods: {
      // 点击参与抽奖
      handleClickStartLottery() {
        if (this.needJoin && !this.joined) {
          this.joinLottery();
        } else {
          this.startAnimation();
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
              this.$message({
                message: this.$t('chat.chat_1010'),
                showClose: true,
                type: 'success',
                customClass: 'zdy-info-box'
              });
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
        let itemIdx = this.fitment.img_order;
        if (![1, 2, 3].includes(this.fitment.img_order)) {
          itemIdx = 1;
        }
        const resourceItem = animationEffectArr[itemIdx];
        parser.load(resourceItem.svgaUrl, videoItem => {
          if (this.mode === 'live') {
            player.setImage(resourceItem.coverBtnImgUrl, resourceItem.imageKey);
          }
          player.setVideoItem(videoItem);
          if (this.mode === 'live') {
            this.startAnimation();
          } else {
            const cacheKey = `lottery_${this.lotteryId}_cache`;
            const cache = sessionStorage.getItem(cacheKey);
            if (cache) {
              this.startAnimation();
            } else {
              if (this.needJoin) {
                player.setImage(resourceItem.sendBtnImgUrl, resourceItem.imageKey);
              }
              player.startAnimationWithRange({
                location: 1,
                length: 15
              });
            }
          }
        });
      },
      startAnimation() {
        const cacheKey = `lottery_${this.lotteryId}_cache`;
        sessionStorage.setItem(cacheKey, 1);
        if (this.mode !== 'live') acclaimAE();
        if (this.inProgress) return false;
        this.inProgress = true;
        player.startAnimationWithRange({
          location: 30,
          length: 60
        });
      },
      endLottery() {
        if (this.endLotteryDisable) return false; // 逻辑防抖, 不影响样式
        this.$emit('end');
        this.endLotteryDisable = true;
        const st = setTimeout(() => {
          clearTimeout(st);
          this.endLotteryDisable = false;
        }, 3000);
      },
      judgeInProgress() {
        const cacheKey = `lottery_${this.lotteryId}_cache`;
        const cache = sessionStorage.getItem(cacheKey);
        return;
      }
    }
  };
</script>
<style lang="less">
  .vmp-lottery-pending {
    .acclaim-panel {
      width: 380px;
      height: 200px;
      position: absolute;
      top: -60px;
      left: 0;
    }
    .vmp-lottery-pending-container {
      width: 380px;
      height: 400px;
      position: relative;
    }
    .lottery-send-command-container {
      width: 100%;
      position: absolute;
      top: -26px;
      text-align: center;
      &::before {
        // 大的⭐️
        content: '';
        display: inline-block;
        position: absolute;
        right: 5px;
        bottom: -10px;
        width: 20px;
        height: 25px;
        background-image: url('../img/star-1.png');
        background-size: contain;
      }
      &::after {
        // 小的⭐️
        content: '';
        display: inline-block;
        position: absolute;
        right: 0;
        top: 40%;
        width: 8px;
        height: 15px;
        background-image: url('../img/star-2.png');
        background-size: contain;
        background-repeat: no-repeat;
      }
    }
    .lottery-send-command {
      display: inline-block;
      height: 26px;
      line-height: 26px;
      padding: 0 12px;
      background: linear-gradient(89.99deg, #ff1d00 -5.26%, rgba(255, 79, 57, 0.2) 83.45%);
      opacity: 0.65;
      box-shadow: inset 0px 2px 4px rgba(255, 255, 255, 0.25);
      border-radius: 13px;
      color: #fce09e;
    }
    .lottery-command {
      color: #fff;
    }
    .lottery-pending-animation {
      display: inline-block;
      width: 380px;
      height: 400px;
      .lottery-pending-animation-img {
        display: inline-block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .lottery-remark-custom {
      margin-bottom: 32px;
    }
    .vmp-lottery-pending-custom {
      text-align: center;
    }

    #lottery-svga {
      width: 100%;
      height: 100%;
    }
    .lottery-remark {
      display: inline-block;
      position: absolute;
      color: #fff;
      font-size: 12px;
      top: 275px;
      left: 50%;
      height: 20px;
      transform: translate(-50%);
      text-align: center;
      overflow: hidden;
      &.order-1 {
        width: 118px;
        top: 323px;
        color: #fff1ce;
      }
      &.order-2 {
        width: 165px;
        top: 33px;
        color: #fff1ce;
      }
      &.order-3 {
        width: 100px;
        top: 243px;
        color: #fff1ce;
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
      cursor: pointer;
      &.order-1 {
        top: 112px;
        left: 160px;
        height: 75px;
        width: 75px;
      }
      &.order-2 {
        top: 272px;
        left: 128px;
        height: 55px;
        width: 145px;
      }
      &.order-3 {
        top: 300px;
        left: 220px;
        height: 60px;
        width: 100px;
      }
    }
    .vmp-lottery-btn {
      margin-top: 10px;
      &[disabled] {
        border: 0;
        background: #ffd1c9;
        color: #fff;
        pointer-events: none;
      }
    }
  }
</style>
