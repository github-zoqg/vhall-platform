<template>
  <div class="lottery-pending">
    <img :src="fitment.url" alt />
    <template v-if="needJoin">
      <i18n path="interact_tools.interact_tools_1065" tag="p">
        <span style="color: #ff5659" place="n">{{ lotteryInfo.command }}</span>
      </i18n>
      <button @click="joinLottery">
        {{ $t('interact_tools.interact_tools_1008') }}
      </button>
    </template>
    <p v-else class="lottery-start-text">
      {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}....` }}
    </p>
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
<style lang="less" scoped>
  .lottery-pending {
    width: 100%;
    height: 100%;
    font-size: 32px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #444444;
    img {
      width: 440px;
      height: 440px;
      margin: 0px auto;
      display: block;
    }
    p {
      text-align: center;
      margin: 40px 0px;
    }
    .lottery-start-text {
      color: #ff5659;
      line-height: 40px;
    }
    button {
      display: block;
      width: 364px;
      height: 90px;
      background: #fb3a32;
      border-radius: 14px;
      margin: 0px auto;
      // padding-bottom: 20px;
      color: #fff;
      line-height: 90px;
      text-align: center;
    }
  }
</style>
