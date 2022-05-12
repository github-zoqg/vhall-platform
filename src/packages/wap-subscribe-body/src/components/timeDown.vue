<template>
  <div class="subscribe_into_down">
    <span>{{ tip }}</span>
    <span class="des">{{ day }}</span>
    <span>{{ $t('appointment.appointment_1026') }}</span>
    <span class="des">{{ hour }}</span>
    <span>{{ $t('appointment.appointment_1027') }}</span>
    <span class="des">{{ minute }}</span>
    <span>{{ $t('appointment.appointment_1028') }}</span>
    <span class="des">{{ second }}</span>
    <span>{{ $t('appointment.appointment_1029') }}</span>
  </div>
</template>
<script>
  import { useRoomBaseServer, useSubscribeServer } from 'middle-domain';
  export default {
    data() {
      return {
        tip: this.$t('appointment.appointment_1015'),
        hour: '',
        minute: '',
        second: '',
        day: ''
      };
    },
    computed: {
      webinarId() {
        return this.roomBaseServer.state.watchInitData.webinar.id;
      },
      webinarType() {
        return this.roomBaseServer.state.watchInitData.webinar.type;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.subscribeServer = useSubscribeServer();
    },
    beforeDestroy() {
      this.timer && clearInterval(this.timer);
      this.countTimer && clearInterval(this.countTimer);
    },
    created() {
      this.handleTips();
      this.timer = setInterval(() => {
        this.remainTimes();
      }, 1 * 1000);
    },
    methods: {
      // 时间提示
      handleTips() {
        if (this.webinarType == 1) {
          this.tip = this.$t('appointment.appointment_1016');
        } else if (this.webinarType == 2) {
          this.tip = this.$t('appointment.appointment_1015');
        }
      },
      remainTimes() {
        const { webinar } = this.roomBaseServer.state.watchInitData;
        if (
          (this.webinarType == 1 && !webinar.actual_start_time) ||
          (this.webinarType == 2 && !webinar.start_time)
        )
          return;
        const sTime =
          this.webinarType == 2
            ? webinar.start_time.replace(/-/g, '/')
            : webinar.actual_start_time.replace(/-/g, '/');
        const limitTime = new Date(sTime).getTime();
        const now = new Date().getTime();
        const remin =
          this.webinarType == 2
            ? parseInt((limitTime - now) / 1000)
            : parseInt((now - limitTime) / 1000);
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
        this.tip = this.$t('appointment.appointment_1016');
      }
    }
  };
</script>
<style lang="less">
  .subscribe_into_down {
    width: 100%;
    margin-bottom: 32px;
    text-align: center;
    span {
      font-size: 20px;
      color: #595959;
      line-height: 28px;
    }
    .des {
      font-size: 56px;
      color: #262626;
      line-height: 65px;
      display: inline-block;
      min-width: 70px;
      text-align: right;
    }
  }
</style>
