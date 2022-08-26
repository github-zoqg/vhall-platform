<template>
  <div class="subscribe-info__tab">
    <div
      v-if="(type == 1 || type == 2) && (day || hour || minute || second)"
      class="subscribe-info__tab-time"
    >
      <span>{{ $t(tip) }}</span>
      <span class="des">{{ day }}</span>
      <span>{{ $t('appointment.appointment_1026') }}</span>
      <span class="des">{{ hour }}</span>
      <span>{{ $t('appointment.appointment_1027') }}</span>
      <span class="des">{{ minute }}</span>
      <span>{{ $t('appointment.appointment_1028') }}</span>
      <span class="des">{{ second }}</span>
      <span>{{ $t('appointment.appointment_1029') }}</span>
    </div>
    <div class="subscribe-info__tab-control" :class="{ beforeEnd: type == 1 || type == 2 }">
      <div v-if="show == 1 && type == 2" class="sub-detail">
        <i18n path="appointment.appointment_1018">
          <span class="num" place="n">{{ num }}</span>
        </i18n>
      </div>
      <!-- 观看协议 -->
      <button v-if="showAgreement" class="sub-auth add-auth" @click="agreement">
        {{ $t('appointment.appointment_1025') }}
      </button>
      <template v-else>
        <button
          v-if="type != 3 && (verify != 0 || (verify == 0 && subOption.hide_subscribe != 0))"
          class="sub-auth"
          :class="{ disableClick: disabled }"
          :disabled="disabled"
          @click="authCheck"
        >
          {{ btnText }}
        </button>
        <button v-if="addText && type != 3" class="sub-auth add-auth" @click="payMore">
          {{ addText }}
        </button>
        <div v-if="type == 3" class="end-tip">
          {{ $t('player.player_1017') }}
        </div>
      </template>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'BottomTab',
    props: {
      subOption: {
        type: Object,
        required: true,
        default: () => {}
      }
    },
    data() {
      return {
        tip: 'appointment.appointment_1015', // 时间信息提示
        time: 0, // 时间
        show: 1, // 显示已预约
        num: 0, // 当前已预约数量
        btnText: '',
        timer: null,
        limitText: '',
        btnDisabled: false,
        countTimer: null,
        hour: '',
        minute: '',
        second: '',
        day: '',
        addText: '',
        hasClick: false,
        startTime: '',
        actual_start_time: '',
        type: 0,
        verify: 0,
        fee: 0,
        verified: 0,
        is_subscribe: 0,
        disabled: false
      };
    },
    computed: {
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      showAgreement() {
        const isEmbedVideo = this.roomBaseServer.state.embedObj.embedVideo;
        const agreement = this.subOption.needAgreement;
        const isLive = this.webinarType != 2 && this.webinarType != 3;
        if (agreement && isLive && !isEmbedVideo) {
          return true;
        } else {
          return false;
        }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    watch: {
      subOption: {
        handler(val) {
          if (val && val.type) {
            this.startTime = val.startTime;
            this.type = val.type;
            this.verify = val.verify;
            this.fee = val.fee;
            this.verified = val.verified;
            this.is_subscribe = val.is_subscribe;
            this.actual_start_time = val.actual_start_time;
            this.show = val.show;
            this.num = val.num;
            if (val.is_subscribe == 1) this.disabled = true;
            this.handleSubscribeProcess();
          }
        },
        immediate: true,
        deep: true
      }
    },
    beforeDestroy() {
      this.timer && clearInterval(this.timer);
      this.countTimer && clearInterval(this.countTimer);
    },
    mounted() {
      this.handleSubscribeProcess();
    },
    methods: {
      handleSubscribeProcess() {
        this.clearTimer();
        this.handleTips();
        this.handleBtnText();
        this.timer = setInterval(() => {
          this.remainTimes();
        }, 1 * 1000);
      },
      // 时间提示
      handleTips() {
        if (this.type == 1) {
          this.tip = 'appointment.appointment_1016';
        } else if (this.type == 2) {
          this.tip = 'appointment.appointment_1015';
        }
      },
      // startTime  YYYY-MM-DD HH:MM
      remainTimes() {
        if ((this.type == 1 && !this.actual_start_time) || (this.type == 2 && !this.startTime))
          return;
        const sTime =
          this.type == 2
            ? this.startTime.replace(/-/g, '/')
            : this.actual_start_time.replace(/-/g, '/');
        const limitTime = new Date(sTime).getTime();
        const now = new Date().getTime();
        const remin =
          this.type == 2 ? parseInt((limitTime - now) / 1000) : parseInt((now - limitTime) / 1000);
        const dayCoefficient = 1 * 24 * 60 * 60; // 定义一天包含多少秒---系数
        const hoursCoefficient = 60 * 60; // 定义一小时包含多少秒---系数
        const mintesCoefficient = 60; // 定义一分钟包含多少秒---系数
        const hourReminder = remin % dayCoefficient; // 剩余时间取余
        const minutesReminder = hourReminder % hoursCoefficient; // 剩余时间取余
        const secondsReminder = minutesReminder % mintesCoefficient; // 剩余时间取余
        this.day =
          this.zeroPadding(parseInt(remin / dayCoefficient)) < 1
            ? '00'
            : this.zeroPadding(parseInt(remin / dayCoefficient));
        this.hour =
          this.zeroPadding(parseInt(hourReminder / hoursCoefficient)) < 1
            ? '00'
            : this.zeroPadding(parseInt(hourReminder / hoursCoefficient));
        this.minute =
          this.zeroPadding(parseInt(minutesReminder / mintesCoefficient)) < 1
            ? '00'
            : this.zeroPadding(parseInt(minutesReminder / mintesCoefficient));
        this.second =
          this.zeroPadding(secondsReminder) < 1 ? '00' : this.zeroPadding(secondsReminder);
      },
      zeroPadding(num) {
        num = Number(num);
        if (isNaN(num)) return num;
        if (num >= 0 && num < 10) {
          return `0${num}`;
        }
        return num;
      },
      clearTimer() {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        if (this.countTimer) {
          clearInterval(this.countTimer);
          this.countTimer = null;
        }
        this.day = '';
        this.hour = '';
        this.minute = '';
        this.second = '';
      },
      countTimes() {
        let sec = 0;
        let minute = 0;
        let hour = 0;
        let day = 0;
        this.countTimer = setInterval(() => {
          sec++;
          if (sec >= 60) {
            minute++;
            sec = 0;
          }
          if (minute >= 60) {
            hour++;
            minute = 0;
          }
          if (hour >= 24) {
            day++;
            hour = 0;
          }
          this.day = this.zeroPadding(day);
          this.hour = this.zeroPadding(hour);
          this.minute = this.zeroPadding(minute);
          this.second = this.zeroPadding(sec);
        }, 1000);
      },
      // 开播未完成限制，时间清零开始计时
      changeTime() {
        this.clearTimer();
        this.countTimes();
        this.tip = 'appointment.appointment_1016';
        this.btnText = this.$t('player.player_1013');
      },
      handleBtnText() {
        let ret = '';
        if (this.type == 3) {
          this.btnText = this.$t('player.player_1017');
          this.limitText = '';
          this.btnDisabled = true;
          return;
        }
        if (this.is_subscribe == 1) {
          ret = this.$t('appointment.appointment_1006');
          this.limitText = '';
          this.btnDisabled = true;
        } else {
          if (this.verified == 0) {
            if (this.verify == 0) {
              ret = this.handleTypeText();
            } else if (this.verify == 1) {
              ret = this.handleTypeText();
            } else if (this.verify == 2) {
              ret = this.handleTypeText();
            } else if (this.verify == 3) {
              ret =
                this.type == 2
                  ? this.$t('webinar.webinar_1040', { n: `￥${this.fee}` })
                  : this.$t('webinar.webinar_1041', { n: `￥${this.fee}` });
            } else if (this.verify == 4) {
              ret = this.handleTypeText();
            } else if (this.verify == 6) {
              ret = this.$t('appointment.appointment_1011');
              this.addText =
                this.type == 2
                  ? this.$t('webinar.webinar_1040', { n: `￥${this.fee}` })
                  : this.$t('webinar.webinar_1041', { n: `￥${this.fee}` });
            }
          } else {
            // 通过观看限制但没有报名
            ret = this.handleTypeText();
          }
        }
        this.btnText = ret;
      },
      handleTypeText() {
        if (this.type == 1 || this.type == 4 || this.type == 5) {
          return this.$t('player.player_1013');
        } else {
          return this.$t('appointment.appointment_1017');
        }
      },
      authCheck() {
        console.log(55555);
        this.$emit('authFetch');
      },
      payMore() {
        this.$emit('payMore', { type: 3 });
      },
      agreement() {
        this.$emit('agreement');
      }
    }
  };
</script>
<style lang="less" scoped>
  .subscribe-info__tab {
    position: absolute;
    bottom: 0px;
    left: 0px;
    background: var(--theme-subscribe-tab-bg);
    overflow: hidden;
    width: 100%;
    height: 70px;
    box-sizing: border-box;
    padding: 0px 24px;
    z-index: 12;
    &-time {
      display: inline-block;
      width: 50%;
      height: 100%;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: var(--theme-subscribe-tab-font);
      span {
        vertical-align: top;
        display: inline-block;
        height: 100%;
        line-height: 70px;
      }
      .des {
        font-size: 36px !important;
        font-family: DINAlternate-Bold, DINAlternate;
        font-weight: bold;
        margin: 0px 4px 0px 12px;
        vertical-align: top;
      }
    }
    &-control {
      vertical-align: top;
      display: inline-block;
      width: 100%;
      height: 70px;
      line-height: 70px;
      text-align: center;
      .sub-detail {
        vertical-align: top;
      }
      .sub-detail,
      .sub-detail span {
        display: inline-block;
        height: 70px;
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: var(--theme-subscribe-tab-font);
        line-height: 70px;
      }
      .sub-detail .num {
        color: var(--theme-color);
      }
      .sub-auth {
        vertical-align: top;
        display: inline-block;
        line-height: 36px;
        min-width: 100px;
        height: 36px;
        background: var(--theme-color);
        border-radius: 18px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #ffffff;
        text-align: center;
        outline: none;
        border: none;
        margin-left: 16px;
        margin-top: 17px;
        padding: 0px 18px;
      }
      .disableClick {
        background: var(--theme-color);
        opacity: 0.6;
        filter: alpha(opacity=60); //filter 过滤器   兼容IE678
        &:hover {
          cursor: auto;
        }
      }
      .add-auth {
        margin-left: 8px;
      }
      .end-tip {
        width: 100%;
        height: 70px;
        line-height: 70px;
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: var(--theme-subscribe-tab-font);
      }
      .end-btn {
        width: 160px;
        margin-left: 0px;
      }
    }
    .beforeEnd {
      width: 50%;
      float: right;
      text-align: right;
      &:after {
        clear: both;
      }
    }
  }
</style>
