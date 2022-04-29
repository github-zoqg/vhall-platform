<template>
  <div class="prize-pending" :class="fitment.img_order === 3 ? 'blue' : ''">
    <h4 class="prize-pending__title">
      {{ fitment.title || $t('interact_tools.interact_tools_1003') }}
    </h4>
    <div class="prize-pending-imgWrap">
      <img v-if="fitment.url" :src="fitment.url" />
    </div>
    <p class="prize-pending__desc" v-if="!needJoin">
      {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}....` }}
    </p>
    <p
      v-if="mode === 'live'"
      class="prize-pending__end-button"
      @click="endLottery"
      :class="[
        'common-but',
        'lottery-end',
        { 'lottery-start': !(disabledTime > 0 && disabledTime <= 5) },
        { 'lottery-downTime': disabledTime > 0 && disabledTime <= 5 },
        { disabled: disabledTime > 0 && disabledTime <= 5 }
      ]"
    >
      结束抽奖
      <!-- {{ $t('interact_tools.interact_tools_1008') }} -->
      <span v-if="disabledTime > 0 && disabledTime <= 5">({{ disabledTime }}s)</span>
    </p>
    <template v-if="needJoin">
      <p class="lottery-desc">
        <i18n path="interact_tools.interact_tools_1007">
          <span place="n" class="lottery-desc__commond">{{ lotteryInfo.command }}</span>
        </i18n>
      </p>
      <div class="lottery-code-participate-btn" @click="joinLottery">
        {{ $t('interact_tools.interact_tools_1008') }}
      </div>
    </template>
    <i class="prize-pending__close-btn vh-iconfont vh-line-circle-close" @click="close"></i>
  </div>
</template>

<script>
  import { useChatServer } from 'middle-domain';
  // 抽奖中的展示样式(发起与观看,必须有多语言)
  export default {
    name: 'LotteryPending',
    inject: ['lotteryServer'],
    props: {
      lotteryInfo: {
        type: Object,
        default() {
          return {};
        }
      },
      lotteryId: {
        type: [String, Object, Number],
        required: true
      },
      fitment: {
        // 皮肤门厅
        type: Object,
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
          return 0;
        }
      }
    },
    computed: {
      // 显示
      needJoin() {
        return (
          this.mode === 'watch' &&
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
        timer: null,
        loading: false,
        joined: false
      };
    },

    methods: {
      close() {
        this.$emit('close');
      },
      endLottery() {
        this.$emit('end');
      },
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
  .prize-pending {
    width: 400px;
    height: 456px;
    text-align: center;
    background-image: url(../img/bg-normal.png);
    position: fixed;
    background-size: 100% 100%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 6px;
    z-index: 777;
    &.blue {
      background-image: url(../img/bg-blue.png);
    }
    &__title {
      font-size: 26px;
      font-weight: 500;
      color: #ffffff;
      line-height: 37px;
      margin-top: 60px;
    }
    &-imgWrap {
      margin: 22px auto 0;
      width: 170px;
      height: 170px;
      img {
        display: block;
        width: 100%;
        height: 100%;
        margin: 0 auto;
        object-fit: scale-down;
      }
    }
    &__desc {
      width: 100%;
      text-align: center;
      font-size: 14px;
      font-family: @fontRegular;
      font-weight: 400;
      color: #ffffff;
      margin-top: 24px;
      line-height: 20px;
    }
    &__end-button {
      width: 160px;
      height: 40px;
      border-radius: 20px;
      background-color: #ffffff;
      color: #fb3a32;
      text-align: center;
      line-height: 40px;
      font-size: 14px;
      position: absolute;
      bottom: 62px;
      left: 50%;
      transform: translateX(-80px);
      user-select: none;
      cursor: default;
      &.lottery-start {
        cursor: pointer;
      }
      &.lottery-downTime {
        cursor: not-allowed;
      }
      &.disabled {
        cursor: default;
        pointer-events: none;
      }
    }
    &__close-btn {
      position: absolute;
      bottom: -18px;
      left: 50%;
      transform: translateX(-15px);
      font-size: 30px;
      color: #ffffff;
      cursor: pointer;
    }
  }
  .lottery-desc {
    line-height: 20px;
    color: #ffffff;
    font-size: 14px;
    text-align: center;
    margin-top: 22px;
    &__commond {
      color: #ffdf46;
    }
  }
  .lottery-code-participate-btn {
    width: 160px;
    height: 40px;
    border-radius: 20px;
    background-color: #ffffff;
    color: #fb3a32;
    text-align: center;
    line-height: 40px;
    font-size: 14px;
    position: absolute;
    bottom: 70px;
    left: 50%;
    transform: translateX(-80px);
    user-select: none;
    cursor: pointer;
  }
</style>
