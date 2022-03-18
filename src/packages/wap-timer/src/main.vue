<template>
  <div class="timer" v-if="!embedObj.embedVideo">
    <!-- 时间显示区 -->
    <div v-show="timerVisible" class="bgimg" id="timer" v-drag>
      <div>
        <div class="ft12">
          <!-- <div class="ml16"
            v-if="shijian<0">超时,开始正向计时</div>
          <div class="ml16"
            v-else>{{60 > beifenshijian ? beifenshijian+'秒' : (parseInt(beifenshijian/60)) +'分'+ ( beifenshijian % 60) +'秒'}} 倒计时{{status == 'zanting'?'已暂停':status == 'jieshu'?'已结束':'进行中...'}}</div> -->

          <div class="ml16" v-if="shijian < 0">{{ $t('interact_tools.interact_tools_1053') }}</div>
          <div class="ml16" v-else>{{ timeStatus }}</div>
        </div>
      </div>
      <span class="close ps" @click="onClose">
        <i class="vh-iconfont vh-line-close"></i>
      </span>
      <div align="center">
        <div class="margin10 pr mt10 font_zdy">
          <div class="margin5 timerbg bg000">
            <strong :class="shijian < 1 ? 'colorFB3A32' : ''" class="fontWeight">
              {{ ten_mon }}
            </strong>
          </div>
          <div class="margin5 timerbg bg000">
            <strong :class="shijian < 1 ? 'colorFB3A32' : ''" class="fontWeight">{{ mon }}</strong>
          </div>

          <strong class="pr ft28 fontWeight color1D1C1F">:</strong>

          <div class="margin5 timerbg bg000">
            <strong :class="shijian < 1 ? 'colorFB3A32' : ''" class="fontWeight">
              {{ ten_sec }}
            </strong>
          </div>
          <div class="margin5 timerbg bg000">
            <strong :class="shijian < 1 ? 'colorFB3A32' : ''" class="fontWeight">{{ sec }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
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
        timerVisible: true,
        shijian: 0,
        beifenshijian: 60,
        is_timeout: false,
        is_all_show: false,
        status: 'zanting',
        ten_mon: 0,
        mon: 0,
        ten_sec: 0,
        sec: 0,
        timerInfo: {}
      };
    },
    computed: {
      timeStatus() {
        const timeStr =
          this.beifenshijian < 60
            ? `${this.beifenshijian}${this.$t('appointment.appointment_1029')}`
            : `${parseInt(this.beifenshijian / 60)}${this.$t('appointment.appointment_1028')}${
                this.beifenshijian % 60
              }${this.$t('appointment.appointment_1029')}`;
        // console.log(timeStr);
        let statusStr = '';
        if (this.status == 'jieshu') {
          // '已结束';
          statusStr = this.$t('interact_tools.interact_tools_1056');
        } else if (this.status == 'zanting') {
          // '已暂停';
          statusStr = this.$t('interact_tools.interact_tools_1055');
        } else {
          // '进行中...';
          statusStr = this.$t('interact_tools.interact_tools_1057');
        }
        return `${timeStr} ${this.$t('interact_tools.interact_tools_1054')} ${statusStr}`;
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      // 是否为直播
      isLive() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      }
    },
    beforeCreate() {
      this.timerServer = useTimerServer();
    },
    async mounted() {
      // await this.getCommonConfig();
      console.log(this.roomBaseServer.state?.timerInfo, 'this.roomBaseServer.state?.timerInfo');
      this.timerInfo = this.roomBaseServer.state?.timerInfo;
      // this.timerServer.listenMsg();
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
        this.shijian = e.data.duration;
        this.beifenshijian = e.data.duration || 70;
        this.is_timeout = e.data.is_timeout;
        this.is_all_show = e.data.is_all_show;
        this.timeFormat(this.shijian);
        if (e.data.status != 4) {
          this.timerFun(this.shijian);
        }
        // 打开计时器组件
        if (this.is_all_show == 1 && this.isLive) {
          this.status = 'kaishi';
          this.handleTimer();
        }
      },
      // 计时器结束
      timer_end() {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', false])
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
        this.status = 'kaishi';
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', false])
        );
        this.timerVisible = false;
        clearInterval(this.timer);
      },
      // 计时器继续
      timer_resume(e) {
        this.status = 'kaishi';
        this.timerFun(e.data.remain_time);
      },
      init() {
        if (JSON.stringify(this.timerInfo) != '{}') {
          const resData = this.timerInfo;
          this.shijian = resData.remain_time;
          this.beifenshijian = resData.duration;
          this.is_timeout = resData.is_timeout;
          this.is_all_show = resData.is_all_show;
          if (resData.duration == -3599) return false;
          this.timeFormat(Math.abs(this.shijian));
          if (resData.status != 4) {
            this.timerFun(this.shijian);
          }
          // 打开计时器组件
          this.status = resData.status == 4 ? 'zanting' : 'kaishi';
          if (this.is_all_show == 1 && this.isLive) {
            this.handleTimer();
            console.log(this.cuid, 'emitChangeTimer');
          }
        } else {
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', false])
          );
          this.timerVisible = false;
          this.status = 'jieshu';
          clearInterval(this.timer);
        }
      },
      handleTimer() {
        this.timerVisible = true;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', true])
        );
      },
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
              this.status = 'jieshu';
            }
            if (data == 0) {
              clearInterval(this.timer);
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitChangeTimer', ['showTimer', false])
              );
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
          this.shijian = data;
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

<style lang="less" scoped>
  @import url(./style.less);
  .timer {
    .mt10 {
      margin-top: 0.17rem;
    }
    .pr {
      position: relative;
    }
    .ps {
      position: absolute;
    }
    .ft12 {
      font-size: 16px;
    }
    .fontWeight {
      font-weight: bold;
    }
    .ml16 {
      margin-left: 32px;
    }
    .color1D1C1F {
      color: #1d1c1f;
    }
    .icon-wrap {
      margin-bottom: 10px;
      width: 84px;
      height: 84px;
      position: relative;
      background-color: transparent;
      img {
        width: 84px;
        height: 84px;
      }
    }
    .have {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #ff0005;
      content: '';
    }
    .bgimg {
      width: 322px;
      // width: 4.47rem;
      position: fixed;
      z-index: 19;
      padding: 0.266667rem 0px;
      top: 200px;
      left: 74%;
      transform: translate(-50%, -50%);
      color: #fff;
      // background-image: linear-gradient(#fffaee, #fff6d5);
      background-image: url('./image/basebg.png');
      background-size: 101% 105%;
      border-radius: 20px;
      .timerbg {
        display: inline-block;
        // background: url('./image/timerbg.png');
        background-size: 100%;
        height: 1.093333rem;
        width: 0.773333rem;
        position: relative;
        strong {
          font-size: 38px;
          position: absolute;
          top: 24px;
          left: 18px;
        }
      }
      .bg000 {
        background: linear-gradient(180deg, #323136 0%, #0b0b0b 100%);
        border-radius: 4px;
      }
      .margin5 {
        box-sizing: border-box;
        margin: 4px;
      }
      .margin10 {
        border-radius: 4px;
        height: 1.2rem;
        .ft28 {
          font-size: 38px;
          top: -40px;
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
        padding: 0 20px;
      }
      .close {
        margin-right: 11px;
        margin-top: 11px;
        cursor: pointer;
        width: 20px;
        height: 20px;
        // opacity: 0.8;
        position: absolute;
        right: 15px;
        top: 5px;
        color: #fff;
        & > i {
          font-size: 10px;
          float: right;
          line-height: 20px;
        }
      }
    }
  }
</style>
