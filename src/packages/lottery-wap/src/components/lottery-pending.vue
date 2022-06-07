<template>
  <div class="vmp-lottery-pending">
    <!-- 标题 -->
    <p v-if="fitment.title" class="lottery-title">{{ fitment.title }}</p>
    <!-- 发送参与 -->
    <i18n v-if="needJoin" path="interact_tools.interact_tools_1065" tag="p">
      <span class="lottery-remark" place="n">{{ lotteryInfo.command }}</span>
    </i18n>
    <p v-else class="lottery-remark">
      {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}....` }}
    </p>
    <div class="lottery-pending-wrap">
      <img
        :class="[fitment.img_order === 2 ? 'slot-machine' : '', 'lottery-pending-animation']"
        :src="fitment.url"
        alt
      />
    </div>
    <button
      v-if="needJoin"
      :class="['vmp-lottery-btn', `order-${fitment.img_order}`]"
      @click="joinLottery"
    >
      {{ $t('interact_tools.interact_tools_1008') }}
    </button>
    <div class="close-btn-wrap">
      <i class="vh-iconfont vh-line-circle-close vmp-close-btn" @click="close"></i>
    </div>
  </div>
</template>
<script>
  import props from './props';
  import { useChatServer } from 'middle-domain';
  export default {
    name: 'LotteryPending',
    inject: ['lotteryServer'],
    mixins: [props],
    computed: {
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
    methods: {
      //
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
            }
          })
          .finally(() => {
            this.loading = false;
          });
      },
      close() {
        this.$emit('close');
      }
    }
  };
</script>
<style lang="less">
  .vmp-lottery-pending {
    text-align: center;
    color: #ffebc9;
    text-shadow: 0px 3px 6px rgba(218, 111, 17, 0.6);
    .lottery-title {
      font-weight: 500;
      font-size: 32px;
      margin-bottom: 6px;
      line-height: 44px;
    }
    .lottery-remark {
      font-size: 24px;
      line-height: 32px;
    }
    .lottery-pending-wrap {
      width: 656px;
      height: 550px;
      background-image: url('../img/lottery-pendding-bg.png');
      background-size: 100%;
      background-repeat: no-repeat;
      background-position: center;
      position: relative;
    }
    .lottery-pending-animation {
      position: absolute;
      width: 500px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      &.slot-machine {
        // 老虎机的设计图问题,需要css手动偏移
        transform: translate(-48%, -50%);
      }
    }
    .vmp-lottery-btn {
      // 默认为转盘
      background: linear-gradient(273.71deg, #ff2313 0%, #fd620c 96.61%);
      &.order-2 {
        // 老虎机
        background: linear-gradient(273.71deg, #fb721d 0%, #f9a61d 96.61%);
      }
      &.order-3 {
        // 扭蛋
        background: linear-gradient(273.19deg, #046ffd 7.83%, #00b9f5 97.59%);
      }
    }
    .close-btn-wrap {
      margin-top: 45px;
      text-align: center;
    }
    .vmp-close-btn {
      color: #fff;
      font-size: 54px;
    }
  }
</style>
