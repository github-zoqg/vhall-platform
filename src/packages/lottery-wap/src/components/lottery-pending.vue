<template>
  <div class="vmp-lottery-pending">
    <p class="lottery-title">{{ fitment.title }}</p>
    <p class="lottery-remark">
      {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}....` }}
    </p>
    <div class="lottery-pending-bg">
      <img
        :class="[fitment.img_order === 2 ? 'slot-machine' : '', 'lottery-pending-animation']"
        :src="fitment.url"
        alt
      />
    </div>
    <template v-if="needJoin">
      <i18n path="interact_tools.interact_tools_1065" tag="p">
        <span style="color: #ff5659" place="n">{{ lotteryInfo.command }}</span>
      </i18n>
      <button @click="joinLottery">
        {{ $t('interact_tools.interact_tools_1008') }}
      </button>
    </template>
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
      margin-bottom: 5px;
    }
    .lottery-remark {
      font-size: 24px;
      line-height: 34px;
      margin: 0;
    }
    .lottery-pending-bg {
      width: 680px;
      height: 750px;
      background-image: url('../img/lottery-pendding-bg.png');
      background-size: 100%;
      background-repeat: no-repeat;
      position: relative;
    }
    .lottery-pending-animation {
      position: absolute;
      width: 500px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      &.slot-machine {
        transform: translate(-48%, -50%);
      }
    }
  }
</style>
