<template>
  <div class="vmp-lottery-pending">
    <!-- 自定义图片的抽奖样式 -->
    <LotteryPendingCustom
      v-if="isCustom"
      :needJoin="needJoin"
      :fitment="fitment"
      :command="lotteryInfo.command"
      @joinLottery="joinLottery"
    />
    <!-- 自定义图片的抽奖样式 -->
    <div v-else class="vmp-lottery-pending-container">
      <div v-if="needJoin" class="lottery-send-command-container">
        <span class="lottery-send-command">
          <i18n path="interact_tools.interact_tools_1065" tag="p">
            <span class="lottery-command" place="n">{{ lotteryInfo.command }}</span>
          </i18n>
        </span>
      </div>
      <div id="lottery-svga"></div>
      <p :class="['lottery-remark', `order-${fitment.img_order}`]">
        {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}...` }}
      </p>
      <div
        :class="['start-lottery-btn', `order-${fitment.img_order}`]"
        @click="handleClickStartLottery"
      ></div>
    </div>
  </div>
</template>
<script>
  import LotteryPendingCustom from './lottery-pending-custom.vue';
  import props from './props';
  import { useChatServer } from 'middle-domain';
  import SVGA from 'svgaplayerweb';
  let player, parser;

  const slotmachineResource = {
    svgaUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/lottery-slotmachine.svga',
    imageKey: 'img_21117',
    sendBtnImgUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/send-slotmachine.png'
  };
  const turnplateResource = {
    svgaUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/lottery-turnplate.svga',
    imageKey: 'img_39023',
    sendBtnImgUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/send-turnplate.png'
  };
  const capsuleResource = {
    svgaUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/lottery-capsule.svga',
    imageKey: 'img_39218',
    sendBtnImgUrl:
      'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/send-capsule.png'
  };

  const animationEffectArr = [null, turnplateResource, slotmachineResource, capsuleResource];

  export default {
    name: 'LotteryPending',
    inject: ['lotteryServer'],
    mixins: [props],
    components: {
      LotteryPendingCustom
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
        joined: false
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
        const itemIdx = this.fitment.img_order || 3;
        const resourceItem = animationEffectArr[itemIdx];
        parser.load(resourceItem.svgaUrl, function (videoItem) {
          player.setVideoItem(videoItem);
          player.setImage(resourceItem.sendBtnImgUrl, resourceItem.imageKey);
          player.startAnimationWithRange({
            location: 1,
            length: 15
          });
        });
      },
      startAnimation() {
        player.startAnimationWithRange({
          location: 30,
          length: 60
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-lottery-pending {
    .vmp-lottery-pending-container {
      width: 750px;
      height: 850px;
      position: relative;
      // background: red;
    }
    .lottery-send-command-container {
      width: 100%;
      position: absolute;
      top: -52px;
      text-align: center;
    }
    .lottery-send-command {
      display: inline-block;
      height: 52px;
      line-height: 52px;
      padding: 0 24px;
      background: linear-gradient(89.99deg, #ff1d00 -5.26%, rgba(255, 79, 57, 0.2) 83.45%);
      opacity: 0.65;
      box-shadow: inset 0px 4px 8px rgba(255, 255, 255, 0.25);
      border-radius: 26px;
      color: #fce09e;
    }
    .lottery-command {
      color: #fff;
    }
    #lottery-svga {
      width: 100%;
      height: 100%;
    }
    .lottery-remark {
      display: inline-block;
      position: absolute;
      color: #fff;
      font-size: 24px;
      top: 550px;
      left: 50%;
      transform: translate(-50%);
      text-align: center;
      // background: yellow;
      &.order-1 {
        width: 260px;
        top: 730px;
        color: #fff1ce;
      }
      &.order-2 {
        width: 380px;
        top: 80px;
        color: #fff;
      }
      &.order-3 {
        width: 220px;
        top: 550px;
        color: #fff;
      }
    }
    .start-lottery-btn {
      display: inline-block;
      height: 150px;
      width: 150px;
      position: absolute;
      // background: yellow;
      top: 250px;
      left: 300px;
      &.order-1 {
        top: 250px;
        left: 300px;
        height: 150px;
        width: 150px;
      }
      &.order-2 {
        top: 600px;
        left: 200px;
        height: 150px;
        width: 350px;
      }
      &.order-3 {
        top: 660px;
        left: 400px;
        height: 150px;
        width: 250px;
      }
    }
  }
</style>
