<template>
  <div class="vmp-watch-timer">
    <!-- 时间显示区 -->
    <div v-show="timerVisible" v-drag class="bgimg">
      <el-row class="time_number">
        <el-col
          :class="
            status == 'pause'
              ? 'stop'
              : status == 'end'
              ? 'endColor'
              : time < 0
              ? 'timeout_font_color'
              : ''
          "
        >
          <div v-if="time < 0">{{ $t('interact_tools.interact_tools_1053') }}</div>
          <div v-else>
            {{ timeComputed }}
          </div>
        </el-col>
      </el-row>
      <span class="close ps" @click="onClose">
        <i class="vh-iconfont vh-line-close"></i>
      </span>
      <div>
        <el-row class="num_base pr">
          <div class="black_line ps"></div>

          <div class="timerbg">
            <span :class="time < 0 ? 'timeout_font_color' : ''">{{ ten_mon }}</span>
          </div>
          <div class="timerbg item_left">
            <span :class="time < 0 ? 'timeout_font_color' : ''">{{ mon }}</span>
          </div>

          <span class="pr ft28" :class="time < 0 ? 'timeout_font_color' : ''">:</span>

          <div class="timerbg">
            <span :class="time < 0 ? 'timeout_font_color' : ''">{{ ten_sec }}</span>
          </div>
          <div class="timerbg item_left">
            <span :class="time < 0 ? 'timeout_font_color' : ''">{{ sec }}</span>
          </div>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { useRoomBaseServer, useTimerServer } from 'middle-domain';
  export default {
    name: 'VmpWatchTimer',
    directives: {
      drag(el) {
        el.onmousedown = function (e) {
          var disx = e.pageX - el.offsetLeft;
          var disy = e.pageY - el.offsetTop;
          document.onmousemove = function (e) {
            let l = e.pageX - disx;
            let t = e.pageY - disy;
            if (l < 117) {
              l = 117;
            }
            if (l > window.innerWidth - 120) {
              l = window.innerWidth - 120;
            }
            if (t < 60) {
              t = 60;
            }
            if (t > window.innerHeight - 140) {
              t = window.innerHeight - 140;
            }
            el.style.left = l + 'px';
            el.style.top = t + 'px';
          };
          document.onmouseup = function () {
            document.onmousemove = document.onmouseup = null;
          };
        };
      }
    },
    data() {
      const roomBaseServer = useRoomBaseServer();
      return {
        roomBaseServer,
        timerVisible: false,
        status: 'start',
        is_all_show: false,
        is_timeout: false,
        time: 0,
        totalTimeNum: 60,
        ten_mon: 0,
        mon: 3,
        ten_sec: 4,
        sec: 0
      };
    },
    watch: {
      timerInfo: {
        deep: true,
        immediate: true,
        handler: function () {
          console.log(this.timerInfo, 'this.timerInfo');
          this.init();
        }
      }
    },
    computed: {
      timerInfo() {
        return this.roomBaseServer.state?.timerInfo;
      },
      // 总时间计算显示
      timeComputed() {
        const timeStr =
          this.totalTimeNum < 60
            ? `${this.totalTimeNum}${this.$t('appointment.appointment_1029')}`
            : `${parseInt(this.totalTimeNum / 60)}${this.$t('appointment.appointment_1028')}${
                this.totalTimeNum % 60
              }${this.$t('appointment.appointment_1029')}`;
        // console.log(timeStr);
        let statusStr = '';
        if (this.status == 'end') {
          // '已结束';
          statusStr = this.$t('webinar.webinar_1008');
        } else if (this.status == 'pause') {
          // '已暂停';
          statusStr = this.$t('webinar.webinar_1007');
        } else {
          // '进行中...';
          statusStr = this.$t('webinar.webinar_1009');
        }
        return `${timeStr} ${statusStr}`;
      }
    },
    beforeCreate() {
      this.timerServer = useTimerServer();
    },
    async mounted() {
      // await this.getCommonConfig();
      // this.init();
      // this.timerServer.listenMsg();
      // 计时器开始
      this.timerServer.$on('timer_start', temp => this.timer_start(temp));
      // 计时器结束
      this.timerServer.$on('timer_end', temp => this.timer_end(temp));
      // 计时器暂停
      this.timerServer.$on('timer_pause', temp => this.timer_pause(temp));
      // 计时器重置
      this.timerServer.$on('timer_reset', temp => this.timer_reset(temp));
      // 计时器继续
      this.timerServer.$on('timer_resume', temp => this.timer_resume(temp));
    },
    methods: {
      // 计时器开始
      timer_start(e) {
        console.log('计时器开始');
        this.time = e.data.duration;
        this.totalTimeNum = e.data.duration;
        this.is_timeout = e.data.is_timeout;
        this.is_all_show = e.data.is_all_show;
        this.timeFormat(this.time);
        this.timerFun(e.data.duration);
        // 打开计时器组件
        this.status = 'start';
        if (this.is_all_show == 1) {
          // 通知相应组件打开计时器Icon
          this.handleTimer();
        }
      },
      // 计时器结束
      timer_end() {
        // 通知相应组件关闭计时器Icon
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['openTimer', false])
        );
        this.timerVisible = false;
        this.status = 'end';
        clearInterval(this.timer);
      },
      // 计时器暂停
      timer_pause(e) {
        this.status = 'pause';
        this.timeFormat(Math.abs(e.data.remain_time));
        clearInterval(this.timer);
      },
      // 计时器重置
      timer_reset() {
        clearInterval(this.timer);
        this.timerVisible = false;
        this.status = 'start';
        // 通知相应组件关闭计时器Icon
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['openTimer', false])
        );
      },
      // 计时器继续
      timer_resume(e) {
        this.status = 'start';
        this.timerFun(e.data.remain_time);
      },
      init() {
        // setTimeout(() => {
        clearInterval(this.timer);
        this.timerVisible = false;
        const resData = this.timerInfo;
        console.log(resData, ',,,,,,,,,,,,,,,,,,,');
        if (resData && JSON.stringify(resData) != '{}') {
          this.time = resData.remain_time;
          this.totalTimeNum = resData.duration;
          this.is_timeout = resData.is_timeout;
          this.is_all_show = resData.is_all_show;
          if (resData.duration == -3599) return false;
          this.timeFormat(Math.abs(this.time));
          if (resData.status != 4) {
            this.timerFun(this.time);
          }
          // 打开计时器组件
          this.status = resData.status == 4 ? 'pause' : 'start';
          if (this.is_all_show == 1) {
            this.handleTimer();
          }
        }
        // }, 100);
      },
      // open计时器弹框
      handleTimer() {
        this.timerVisible = true;
        // 通知相应组件打开计时器Icon
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['openTimer', true])
        );
      },
      onClose() {
        this.timerVisible = false;
        // 通知相应组件打开计时器Icon上的红点
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', true])
        );
      },
      // 秒转时间
      timeFormat(data) {
        this.sec = (data % 60) % 10;
        this.ten_sec = parseInt((data % 60) / 10);
        this.mon = parseInt(data / 60) % 10;
        this.ten_mon = parseInt(parseInt(data / 60) / 10);
      },
      // 计时函数
      timerFun(data) {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
          if (this.is_timeout == 0) {
            if (data == 1) {
              this.status = 'end';
            }
            if (data == 0) {
              clearInterval(this.timer);
              this.timerVisible = false;
              // 通知相应组件关闭计时器Icon
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitChangeTimer', ['openTimer', false])
              );
              return false;
            }
          }
          if (data == -3599) {
            clearInterval(this.timer);
            return false;
          }
          if (data < 1) {
            this.status = 'timeout';
          }
          this.timeFormat(Math.abs(--data));
          this.time = data;
        }, 1000);
      }
      // TODO: 不应在此处调getCommonConfig用接口 须退出小组相关逻辑调用
      // 初始化房间互动工具
      // getCommonConfig() {
      //   return this.roomBaseServer.getCommonConfig({
      //     tags: [
      //       'skin',
      //       'screen-poster',
      //       'like',
      //       'keywords',
      //       'public-account',
      //       'webinar-tag',
      //       'menu',
      //       'adv-default',
      //       'invite-card',
      //       'red-packet',
      //       'room-tool',
      //       'goods-default',
      //       'announcement',
      //       'sign',
      //       'timer'
      //     ]
      //   });
      // }
    }
  };
</script>

<style lang="less">
  @import url(./font_family/numberFont.less);
  .vmp-watch-timer {
    .pr {
      position: relative;
    }
    .ps {
      position: absolute;
    }
    .time_number {
      color: #0fbb5a;
      font-size: 14px;
      line-height: 20px;
    }
    .vhsaas-timer-box {
      margin-left: 16px;
      position: relative;
      cursor: pointer;
      .circle {
        position: absolute;
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #fb3a32;
        border: 1px solid #2a2a2a;
        border-radius: 50%;
        top: -3px;
        right: -3px;
        position: absolute;
      }
    }
    @media screen and (max-width: 1366px) {
      .bgimg {
        left: 50%;
      }
    }
    @media screen and (min-width: 1367px) and (max-width: 1705px) {
      .bgimg {
        left: 58%;
      }
    }
    @media screen and (min-width: 1706px) {
      .bgimg {
        left: 65%;
      }
    }
    .bgimg {
      width: 272px;
      position: fixed;
      z-index: 21;
      padding: 20px 20px 16px;
      top: 200px;
      transform: translate(-50%, -50%);
      cursor: pointer;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      box-sizing: border-box;
      .stop {
        color: #fc9600;
      }
      .endColor {
        color: #666;
      }
      .item_left {
        margin-left: 4px;
      }
      .timerbg {
        display: inline-block;
        background: url('./img/timerbg.png') no-repeat;
        background-size: 100% 100%;
        height: 62px;
        width: 50px;
        box-sizing: border-box;
        position: relative;
        text-align: center;
        color: #262626;
        & > :first-child {
          font-weight: bold;
          font-size: 44px;
          line-height: 60px;
          .custom-font-barlow;
        }
      }
      .ft14 {
        font-size: 13px;
      }
      .black_line {
        border: 1px solid #d9d9d9;
        top: 50%;
        z-index: 999;
        width: 95%;
      }
      .num_base {
        margin-top: 16px;
        background: #d9d9d9;
        border-radius: 8px;
        height: 78px;
        padding: 8px;
        .ft28 {
          font-size: 28px;
          top: -8px;
        }
      }
      .timeout_font_color {
        color: #fb3a32;
      }
      .close {
        margin-right: 11px;
        margin-top: 11px;
        cursor: pointer;
        width: 20px;
        height: 20px;
        position: absolute;
        right: 15px;
        top: 6px;
        color: #666;
        & > i {
          font-size: 14px;
          float: right;
          line-height: 20px;
        }
      }
    }
  }
</style>
