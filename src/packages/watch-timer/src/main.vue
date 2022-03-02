<template>
  <div class="vhsaas-praise-timer">
    <!-- 时间显示区 -->
    <div v-show="timerVisible" v-drag class="bgimg">
      <!-- <el-row :class="status == 'zanting'?'colorFC9600':status == 'kaishi'?'color0FBB5A':'colorFB3A32'"> -->
      <el-row class="colorFFF">
        <el-col class="ft12">
          <div v-if="shijian < 0">{{ $t('interact_tools.interact_tools_1053') }}</div>
          <div v-else>
            {{
              60 > beifenshijian
                ? beifenshijian + $t('appointment.appointment_1029')
                : parseInt(beifenshijian / 60) +
                  $t('appointment.appointment_1028') +
                  (beifenshijian % 60) +
                  $t('appointment.appointment_1029')
            }}
            {{ $t('interact_tools.interact_tools_1054') }}
            {{
              status == 'zanting'
                ? $t('interact_tools.interact_tools_1055')
                : status == 'jieshu'
                ? $t('interact_tools.interact_tools_1056')
                : $t('interact_tools.interact_tools_1057')
            }}
          </div>
        </el-col>
      </el-row>
      <span class="close ps" @click="onClose">
        <i class="vh-iconfont vh-line-close"></i>
      </span>
      <div class="pad20">
        <el-row class="margin10 bg000 pr mt10">
          <div class="border3 ps"></div>

          <div class="margin5 timerbg">
            <strong :class="shijian < 1 ? 'colorFB3A32' : ''">{{ ten_mon }}</strong>
          </div>
          <div class="margin5 timerbg">
            <strong :class="shijian < 1 ? 'colorFB3A32' : ''">{{ mon }}</strong>
          </div>

          <strong class="pr ft28 font_zdy" :class="shijian < 1 ? 'colorFB3A32' : ''">:</strong>

          <div class="margin5 timerbg">
            <strong :class="shijian < 1 ? 'colorFB3A32' : ''">{{ ten_sec }}</strong>
          </div>
          <div class="margin5 timerbg">
            <strong :class="shijian < 1 ? 'colorFB3A32' : ''">{{ sec }}</strong>
          </div>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
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
        status: 'kaishi',
        is_all_show: false,
        is_timeout: false,
        shijian: 0,
        beifenshijian: 60,
        ten_mon: 0,
        mon: 3,
        ten_sec: 4,
        sec: 0,
        timerInfo: {}
      };
    },
    watch: {
      timerInfo: {
        deep: true,
        immediate: true,
        handler: function () {
          this.init();
        }
      }
    },
    beforeCreate() {
      this.timerServer = useTimerServer();
    },
    mounted() {
      this.timerInfo = this.roomBaseServer.state?.timerInfo;
      console.log(this.$domainStore.state, this.roomBaseServer, '123132');
      // this.init();
      this.timerServer.listenMsg();
      console.log(this.timerServer.listenMsg, 'this.roomBaseServer');
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
        this.shijian = e.data.duration;
        this.beifenshijian = e.data.duration;
        this.is_timeout = e.data.is_timeout;
        this.is_all_show = e.data.is_all_show;
        this.timeFormat(this.shijian);
        this.timerFun(e.data.duration);
        // 打开计时器组件
        this.status = 'kaishi';
        if (this.is_all_show == 1) {
          // 通知相应组件打开计时器Icon
          this.handleTimer();
          // this.timerVisible = true;
          // window.$middleEventSdk?.event?.send(
          //   boxEventOpitons(this.cuid, 'emitChangeTimer', ['openTimer', true])
          // );
        }
      },
      // 计时器结束
      timer_end() {
        // 通知相应组件关闭计时器Icon
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['openTimer', false])
        );
        this.timerVisible = false;
        this.status = 'jieshu';
        clearInterval(this.timer);
      },
      // 计时器暂停
      timer_pause(e) {
        this.status = 'zanting';
        this.timeFormat(Math.abs(e.data.remain_time));
        clearInterval(this.timer);
      },
      // 计时器重置
      timer_reset() {
        clearInterval(this.timer);
        this.timerVisible = false;
        this.status = 'kaishi';
        // 通知相应组件关闭计时器Icon
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['openTimer', false])
        );
      },
      // 计时器继续
      timer_resume(e) {
        this.status = 'kaishi';
        this.timerFun(e.data.remain_time);
      },
      init() {
        setTimeout(() => {
          const resData = this.timerInfo;
          console.log(resData, ',,,,,,,,,,,,,,,,,,,');
          if (resData && JSON.stringify(resData) != '{}') {
            this.shijian = resData.remain_time;
            this.beifenshijian = resData.duration;
            this.is_timeout = resData.is_timeout;
            this.is_all_show = resData.is_all_show;
            if (resData.duration == -3599) return false;
            this.timeFormat(Math.abs(this.shijian));
            if (resData.status != 4) {
              this.timerFun(this.shijian);
            }
            this.handleTimer();
            // 打开计时器组件
            this.status = resData.status == 4 ? 'zanting' : 'kaishi';
            this.timerVisible = true;
            if (this.is_all_show == 1) {
              // 通知相应组件打开计时器Icon
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitChangeTimer', ['openTimer', true])
              );
            }
          }
        }, 100);
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
              this.status = 'jieshu';
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
            this.status = 'chaoshi';
          }
          this.timeFormat(Math.abs(--data));
          this.shijian = data;
        }, 1000);
      }
    }
  };
</script>

<style lang="less" scoped>
  @import url(./style.less);
  .vhsaas-praise-timer {
    .mt10 {
      margin-top: 10px;
    }
    .pr {
      position: relative;
    }
    .ps {
      position: absolute;
    }
    .colorFFF {
      color: #fff;
      font-size: 14px;
      line-height: 32px;
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
        width: 266px;
        height: 160px;
        position: fixed;
        z-index: 21;
        padding: 10px 24px 24px;
        top: 200px;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        color: #fff;
        // background-image: linear-gradient(#FFFAEE, #FFF6D5);
        background-image: url('./img/basebg.png');
        background-size: contain;
        border-radius: 20px;
      }
    }
    @media screen and (min-width: 1367px) and (max-width: 1705px) {
      .bgimg {
        width: 266px;
        height: 160px;
        position: fixed;
        z-index: 21;
        padding: 10px 24px 24px;
        top: 200px;
        left: 58%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        color: #fff;
        // background-image: linear-gradient(#FFFAEE, #FFF6D5);
        background-image: url('./img/basebg.png');
        background-size: contain;
        border-radius: 20px;
      }
    }
    @media screen and (min-width: 1706px) {
      .bgimg {
        width: 266px;
        height: 160px;
        position: fixed;
        z-index: 21;
        padding: 10px 24px 24px;
        top: 200px;
        left: 65%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        color: #fff;
        // background-image: linear-gradient(#FFFAEE, #FFF6D5);
        background-image: url('./img/basebg.png');
        background-size: contain;
        border-radius: 20px;
      }
    }
    .bgimg {
      box-sizing: border-box;
      .timerbg {
        display: inline-block;
        background: url('./img/timerbg.png') no-repeat;
        background-size: contain;
        height: 68px;
        width: 43px;
        position: relative;
        strong {
          font-size: 38px;
          position: absolute;
          top: 8px;
          left: 11px;
          .font_zdy;
        }
      }
      .ft14 {
        font-size: 13px;
      }
      .border3 {
        border-top: 3px solid #000;
        top: 35px;
        z-index: 999;
        width: 100%;
      }
      .bg000 {
        background: #000;
      }
      .margin5 {
        box-sizing: border-box;
        margin: 6px 4px;
      }
      .margin10 {
        border-radius: 4px;
        height: 74px;
        .ft28 {
          font-size: 28px;
          top: -37px;
        }
      }
      .color0FBB5A {
        color: #0fbb5a;
      }
      .colorFC9600 {
        color: #fc9600;
      }
      .colorFB3A32 {
        color: #fb3a32;
      }
      .pad20 {
        padding: 0 3px;
      }
      .close {
        margin-right: 11px;
        margin-top: 11px;
        cursor: pointer;
        width: 20px;
        height: 20px;
        opacity: 0.8;
        position: absolute;
        right: 15px;
        top: 6px;
        color: #ffffff;
        & > i {
          font-size: 10px;
          float: right;
          line-height: 20px;
        }
      }
    }
  }
</style>
