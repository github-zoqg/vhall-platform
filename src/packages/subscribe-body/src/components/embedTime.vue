<template>
  <div class="subscribe-embed-info__tab">
    <div v-if="type != 1 && type != 2" class="end-pic">
      <img src="../img/live_start.png" alt="" />
    </div>
    <div v-if="type != 1 && type != 2 && type != 4" class="end-tip">
      {{ $t('player.player_1017') }}
    </div>
    <div v-if="(type == 1 || type == 2) && (day || hour || minute || second)" class="live-tip">
      {{ tip }}
    </div>
    <div v-if="show == 1 && type != 1 && type != 2 && type != 4" class="hot">
      <span class="hot-icon"></span>
      <span class="pv">{{ num }}</span>
    </div>
    <div
      v-if="(type == 1 || type == 2) && (day || hour || minute || second)"
      class="subscribe-embed-info__tab-time"
    >
      <span class="des">{{ day }}</span>
      <span>{{ $t('appointment.appointment_1026') }}</span>
      <span class="des">{{ hour }}</span>
      <span>{{ $t('appointment.appointment_1027') }}</span>
      <span class="des">{{ minute }}</span>
      <span>{{ $t('appointment.appointment_1028') }}</span>
      <span class="des">{{ second }}</span>
      <span>{{ $t('appointment.appointment_1029') }}</span>
    </div>
    <button v-if="showAgreement" class="sub-auth add-auth" @click="agreement">
      {{ $t('appointment.appointment_1025') }}
    </button>
    <template v-else>
      <button
        v-if="btnText"
        class="sub-auth"
        :class="{ disabledBtn: disabled }"
        :disabled="disabled"
        @click="authCheck"
      >
        {{ btnText }}
      </button>
    </template>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';

  export default {
    name: 'EmbedTime',
    props: {
      subOption: {
        type: Object,
        required: true,
        default: () => {}
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    computed: {
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      showAgreement() {
        const isAgreement = this.subOption.needAgreement;
        const isEmbedVideo = this.roomBaseServer.state.embedObj.embedVideo;
        const isLive = this.webinarType != 2 && this.webinarType != 3;
        if (isAgreement && isLive && !isEmbedVideo) {
          // 观看协议验证通过，并且当前活动状态不是 预约和结束，且不是单视频嵌入的时候，展示观看验证按钮。
          return true;
        } else {
          return false;
        }
        // if (isAgreement && ((!btnText && type == 1) || btnText))
      },
      isEmbed() {
        // 是不是嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      isEmbedVideo() {
        // 是不是单视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embedVideo;
      }
    },
    data() {
      return {
        showPlayBtn: false,
        tip: this.$t('appointment.appointment_1015'), // 时间信息提示
        time: 0, // 时间
        btnText: '',
        timer: null,
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
        type: 2,
        verify: 0,
        fee: 0,
        verified: 0,
        is_subscribe: 0,
        disabled: false,
        show: 1,
        num: 0,
        pv: 10,
        save_reg_form: null,
        open_reg_form: null
      };
    },
    watch: {
      subOption: {
        handler(val) {
          if (val && val.type) {
            this.startTime = val.startTime;
            this.type = val.type;
            this.verify = val.verify;
            this.verified = val.verified;
            this.is_subscribe = val.is_subscribe;
            this.actual_start_time = val.actual_start_time;
            this.show = val.show;
            this.save_reg_form = val.save_reg_form;
            this.open_reg_form = val.open_reg_form;
            // this.num = val.num
            console.log('>>>>>>1', val);
            // if (val.is_subscribe == 1) this.disabled = true
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
      agreement() {
        this.$emit('agreement');
      },
      // 获取预约页状态进度等
      handleSubscribeProcess() {
        // 清除历史计时器
        this.clearTimer();
        // 时间提示文案： 已开播/距离开播
        this.handleTips();
        // 处理当前界面展示文案 及 按钮状态
        this.handleBtnText();
        // 根据开播时间等，启动具体的计时器（1秒间隔）
        this.timer = setInterval(() => {
          this.remainTimes();
        }, 1 * 1000);
      },
      // 时间提示
      handleTips() {
        if (this.type == 1) {
          this.tip = this.$t('appointment.appointment_1016');
        } else if (this.type == 2) {
          this.tip = this.$t('appointment.appointment_1015');
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
        this.btnText = this.$t('player.player_1013');
      },
      handleBtnText() {
        if (this.type == 3) {
          // 活动已结束，观看限制为密码时，展示按钮“密码活动”，按钮不可点击
          this.btnText = this.verify == 1 ? this.$t('webinar.webinar_1036') : '';
          this.disabled = this.verify == 1;
          return;
        }
        // 是否嵌入 & 非单视频嵌入 & 开启了报名表单 & 观看限制（无 或 密码 或者 专题观看限制设置为报名表单）
        const isOpenBtn =
          this.isEmbed &&
          !this.isEmbedVideo &&
          this.open_reg_form == 1 &&
          [0, 1, 5].includes(this.verify);
        if (this.is_subscribe == 1) {
          this.btnText = this.$t('appointment.appointment_1006');
        } else {
          if ([1, 4, 5].includes(this.type)) {
            // 直播中、点播、回放 的时候，观看限制=密码或者isOpen场景，按钮文案“立即观看”；否则不展示按钮。
            this.btnText = this.verify == 1 || isOpenBtn ? this.$t('player.player_1013') : '';
          } else if (this.type == 2) {
            // 预告状态 isOpenBtn按钮文案“立即预约”；其它若观看限制=密码，按钮展示为 “密码活动”；其它情况不展示按钮。
            if (isOpenBtn) {
              this.btnText = this.$t('appointment.appointment_1017');
            } else if (this.verify == 1) {
              this.btnText = this.$t('webinar.webinar_1036');
            } else {
              this.btnText = '';
            }
          }
        }
        // 若当前已是预约成功状态， 或者 当前是预告状态&&不是isOpenBtn场景&&观看限制为 密码，此时按钮禁用
        this.disabled =
          this.is_subscribe == 1 || (this.type == 2 && !isOpenBtn && this.verify == 1);
      },
      authCheck() {
        this.$emit('authFetch');
        if (this.type === 2) {
          // 数据埋点
          window.vhallReportForWatch?.report(170028, {
            verify: this.verify
          });
        }
      }
    }
  };
</script>
<style lang="less">
  .subscribe-embed-info__tab {
    position: absolute;
    top: 50%;
    left: 50%;
    overflow: hidden;
    min-width: 600px;
    min-height: 300px;
    min-height: 70px;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 11;
    .end-pic {
      width: 160px;
      height: 162px;
      margin: 0px auto;
      margin-bottom: 2px;
      padding-left: 20px;
      img {
        display: inline-block;
        width: 160px;
        height: 162px;
      }
    }
    .end-tip {
      width: 100%;
      height: 34px;
      text-align: center;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #999999;
      line-height: 34px;
    }
    .sub-play-btn {
      color: #fff;
      width: 72px;
      height: 72px;
      border-radius: 36px;
      margin: 0px auto 16px auto;
      background: rgba(0, 0, 0, 0.9);
      line-height: 72px;
      text-align: center;
      &:hover {
        cursor: pointer;
      }
      span {
        font-size: 32px;
        margin-left: 4px;
      }
    }
    .live-tip {
      font-size: 24px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 34px;
    }
    &-time {
      display: inline-block;
      width: 100%;
      height: 100%;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #f7f7f7;
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
        color: #f7f7f7;
        margin: 0px 4px 0px 12px;
        vertical-align: top;
      }
    }
    .hot {
      width: 100%;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        display: inline-block;
      }
      .hot-icon {
        width: 16px;
        height: 16px;
        background: url('../img/hot.png') no-repeat;
        background-size: 100%;
        background-position: center;
      }
      .pv {
        display: inline-block;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #e6e6e6;
        min-width: 30px;
        height: 22px;
        line-height: 22px;
      }
    }
    .sub-auth {
      width: 160px;
      height: 40px;
      background: #fb3a32;
      border-radius: 20px;
      margin: 32px auto 0px auto;
      display: block;
      line-height: 40px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #ffffff;
      text-align: center;
      outline: none;
      border: none;
    }
    .disabledBtn {
      background: rgba(251, 58, 50, 0.4);
      min-width: 160px;
      padding: 0 18px;
      width: auto;
      &:hover {
        cursor: auto;
      }
    }
  }
</style>
