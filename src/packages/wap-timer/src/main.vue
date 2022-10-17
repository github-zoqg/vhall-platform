<template>
  <div class="vmp-wap-timer" v-if="!embedObj.embedVideo">
    <!-- 时间显示区 -->
    <div v-show="timerVisible" class="bgimg" id="timer" v-drag>
      <div>
        <div class="ft24">
          <div v-if="time < 0">{{ $t('interact_tools.interact_tools_1053') }}</div>
          <div v-else>{{ timeStatus }}</div>
        </div>
      </div>
      <span class="close ps" @click="onClose">
        <i class="vh-iconfont vh-full-error"></i>
      </span>
      <div align="center">
        <div class="timer_base font_zdy">
          <div class="timerbg">
            <span :class="time < 1 ? 'timeout_font_color' : ''" class="fontWeight">
              {{ ten_mon }}
            </span>
          </div>
          <div class="timerbg">
            <span :class="time < 1 ? 'timeout_font_color' : ''" class="fontWeight">
              {{ mon }}
            </span>
          </div>

          <div class="w_inline"></div>
          <span class="pr ft34" :class="time < 1 ? 'timeout_font_color' : ''">:</span>

          <div class="timerbg">
            <span :class="time < 1 ? 'timeout_font_color' : ''" class="fontWeight">
              {{ ten_sec }}
            </span>
          </div>
          <div class="timerbg">
            <span :class="time < 1 ? 'timeout_font_color' : ''" class="fontWeight">
              {{ sec }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { useRoomBaseServer, useTimerServer } from 'middle-domain';
  export default {
    name: 'VmpWapTimer',
    directives: {
      drag(van) {
        van.ontouchstart = function (e) {
          let touch;
          if (e.changedTouches) {
            touch = e.changedTouches[0];
          } else {
            touch = e;
          }
          var disx = touch.clientX - van.offsetLeft;
          var disy = touch.clientY - van.offsetTop;

          document.ontouchmove = function (e) {
            let touch;
            if (e.changedTouches) {
              touch = e.changedTouches[0];
            } else {
              touch = e;
            }
            let l = touch.clientX - disx;
            let t = touch.clientY - disy;
            if (l < 104) {
              l = 104;
            }
            if (l > window.innerWidth - 100) {
              l = window.innerWidth - 100;
            }
            if (t < 100) {
              t = 100;
            }
            if (t > window.innerHeight - 100) {
              t = window.innerHeight - 100;
            }
            van.style.left = l + 'px';
            van.style.top = t + 'px';

            document.ontouchend = function () {
              document.ontouchmove = document.ontouchstart = null;
            };
          };
        };
      }
    },
    watch: {
      timerInfo: {
        immediate: true,
        deep: true,
        handler: function () {
          this.init();
        }
      }
    },
    data() {
      const roomBaseServer = useRoomBaseServer();
      return {
        roomBaseServer,
        timerVisible: false,
        time: 0,
        totalTimeNum: 60,
        is_timeout: false,
        is_all_show: false,
        status: 'pause',
        ten_mon: 0,
        mon: 0,
        ten_sec: 0,
        sec: 0
      };
    },
    computed: {
      timeStatus() {
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
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      // 是否为直播
      isLive() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      timerInfo() {
        return this.roomBaseServer.state?.timerInfo;
      }
    },
    beforeCreate() {
      this.timerServer = useTimerServer();
    },
    async mounted() {
      console.log(this.$domainStore.state.roomBaseServer, 'this.timerServer');
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
        this.time = e.data.duration;
        this.totalTimeNum = e.data.duration || 70;
        this.is_timeout = e.data.is_timeout;
        this.is_all_show = e.data.is_all_show;
        this.timeFormat(this.time);
        if (e.data.status != 4) {
          this.timerFun(this.time);
        }
        // 打开计时器组件
        if (this.is_all_show == 1 && this.isLive) {
          this.status = 'start';
          this.handleTimer();
        }
      },
      // 计时器结束
      timer_end() {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', false])
        );
        this.changeIconShowNum(false);
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
        this.status = 'start';
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', false])
        );
        this.changeIconShowNum(false);
        this.timerVisible = false;
        clearInterval(this.timer);
      },
      // 计时器继续
      timer_resume(e) {
        this.status = 'start';
        this.timerFun(e.data.remain_time);
      },
      init() {
        if (JSON.stringify(this.timerInfo) != '{}') {
          const resData = this.timerInfo;
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
          if (this.is_all_show == 1 && this.isLive) {
            this.handleTimer();
            console.log(this.cuid, 'emitChangeTimer');
          }
        } else {
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', false])
          );
          // this.changeIconShowNum(false);
          this.timerVisible = false;
          this.status = 'end';
          clearInterval(this.timer);
        }
      },
      // 打开计时器及icon红点
      handleTimer() {
        this.timerVisible = true;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', true])
        );
        // 展示icon数量+1
        this.changeIconShowNum(true);
      },
      // 关闭计时器及icon红点
      onClose() {
        this.timerVisible = false;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['timerVisible', false])
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
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', false])
              );
              this.changeIconShowNum(false);
              this.timerVisible = false;
              return false;
            }
          }
          if (data == -3599) {
            clearInterval(this.timer);
            this.timerVisible = false;
            return false;
          }
          if (data < 1) {
            this.status = 'chaoshi';
          }
          this.timeFormat(Math.abs(--data));
          this.time = data;
        }, 1000);
      },
      // change icon显示数量
      changeIconShowNum(status) {
        this.roomBaseServer.setShowIconNum(status);
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
  .vmp-wap-timer {
    .pr {
      position: relative;
    }
    .ps {
      position: absolute;
    }
    .ft24 {
      font-size: 24px;
      line-height: 34px;
    }
    .fontWeight {
      font-weight: bold;
    }
    .bgimg {
      width: 374px;
      // width: 4.47rem;
      position: fixed;
      z-index: 305; //文档全屏301
      padding: 24px;
      top: 48%;
      left: 70%;
      transform: translate(-50%, -50%);
      color: #fff;
      background: #595959;
      border-radius: 20px;
      .timerbg {
        display: inline-block;
        height: 91px;
        width: 70px;
        box-sizing: border-box;
        font-size: 72px;
        font-weight: 700;
        margin-left: 4px;
        .custom-font-barlow;
        &:first-child {
          margin-left: 0;
        }
      }
      .timer_base {
        margin-top: 12px;
        background: #3d3d3d;
        height: 108px;
        border-radius: 8px;
        padding: 8px;
        .pr;
        span {
          line-height: 87px;
        }
        .w_inline {
          position: absolute;
          border: 1px solid #3d3d3d;
          top: 50%;
          width: 95%;
        }
        .ft34 {
          .custom-font-barlow;
          font-size: 34px;
          margin-left: 4px;
          line-height: initial;
          top: -16px;
        }
      }
      .timeout_font_color {
        color: #fb3a32;
      }
      .close {
        cursor: pointer;
        border: 3px solid #fff;
        border-radius: 50%;
        // opacity: 0.8;
        position: absolute;
        right: -25px;
        top: -40px;
        color: #262626;
      }
    }
  }
</style>
