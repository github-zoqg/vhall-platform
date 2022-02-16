<template>
  <div class="time-open">
    <div style="postsion: relative">
      <div v-if="timerVisible" class="bgimg" v-drag>
        <el-row class="padding45">
          <el-row
            :class="
              status == 'zanting'
                ? 'colorFC9600'
                : status == 'kaishi'
                ? 'color0FBB5A'
                : 'colorFB3A32'
            "
          >
            <el-col align="center" class="ft14">
              <div v-if="shijian < 0">超时，开始正向计时</div>
              <div v-else>
                {{
                  60 > beifenshijian
                    ? beifenshijian + '秒'
                    : parseInt(beifenshijian / 60) + '分' + (beifenshijian % 60) + '秒'
                }}
                倒计时{{
                  status == 'zanting' ? '已暂停' : status == 'jieshu' ? '已结束' : '进行中...'
                }}
              </div>
            </el-col>
            <span
              class="close ps"
              @click="onClose"
              v-if="userInfo.role_name == 3 || userInfo.third_party_user_id == this.doc_permission"
            >
              <i class="iconfont iconguanbi"></i>
            </span>
          </el-row>
          <!-- 时间显示区 -->
          <el-row class="margin10 bg000 pr mt24 font_zdy">
            <div class="border3 ps"></div>

            <div class="margin5 timerbg">
              <strong :class="shijian < 1 ? 'colorFB3A32' : ''">{{ ten_mon }}</strong>
            </div>
            <div class="margin5 timerbg">
              <strong :class="shijian < 1 ? 'colorFB3A32' : ''">{{ mon }}</strong>
            </div>

            <span class="pr ft28" :class="shijian < 1 ? 'colorFB3A32' : ''">:</span>

            <div class="margin5 timerbg">
              <strong :class="shijian < 1 ? 'colorFB3A32' : ''">{{ ten_sec }}</strong>
            </div>
            <div class="margin5 timerbg">
              <strong :class="shijian < 1 ? 'colorFB3A32' : ''">{{ sec }}</strong>
            </div>
          </el-row>

          <el-row
            v-if="userInfo.role_name == 3 || userInfo.third_party_user_id == this.doc_permission"
          >
            <el-col align="center" class="mt20">
              <el-button
                round
                v-if="status == 'zanting'"
                type="primary"
                @click="goOn(5)"
                size="mini"
                class="w92 button_zanting"
              >
                继续
              </el-button>
              <el-button
                round
                v-else
                :disabled="(shijian == 0 && is_timeout == 0) || shijian == -3599"
                type="primary"
                @click="goOn(4)"
                size="mini"
                class="w92 button_zanting"
              >
                暂停
              </el-button>
              <el-button
                round
                type="primary"
                @click="reset"
                size="mini"
                class="w92 button_chongzhi"
              >
                重置
              </el-button>
            </el-col>
          </el-row>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
  import { useRoomBaseServer, useTimerServer, useMsgServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    // props: ['timerInfo', 'rootActive', 'doc_permission'],
    name: 'VmpLiveTimer',
    directives: {
      drag(el, bindings) {
        el.onmousedown = function (e) {
          var disx = e.pageX - el.offsetLeft;
          var disy = e.pageY - el.offsetTop;
          document.onmousemove = function (e) {
            let l = e.pageX - disx;
            let t = e.pageY - disy;
            if (l < 230) {
              l = 230;
            }
            if (l > window.innerWidth - 170) {
              l = window.innerWidth - 170;
            }
            if (t < 5) {
              t = 5;
            }
            if (t > window.innerHeight - 240) {
              t = window.innerHeight - 240;
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
      let roomBaseServer = useRoomBaseServer();
      return {
        roomBaseServer,
        status: 'kaishi',
        beifenshijian: 60,
        shijian: 0,
        timer: null,
        auth: 1,
        timerVisible: false,
        is_timeout: 0,
        is_all_show: 0,
        sec: 0,
        ten_sec: 0,
        mon: 0,
        ten_mon: 0,
        userInfo: JSON.parse(sessionStorage.getItem('user')) || {},
        doc_permission: ''
      };
    },
    beforeCreate() {
      this.timerServer = useTimerServer();
      this.msgServer = useMsgServer();
    },
    mounted() {
      this.init();
      this.timerServer.listenMsg();
      console.log(this.timerServer, 'this.roomBaseServer');
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
      this.doc_permission = this.roomBaseServer.state.watchInitData.webinar.userinfo.user_id;
    },
    methods: {
      // 计时器开始
      timer_start(e) {
        console.warn('监听到了计时器开始-------', e);
        this.timerVisible = true;
        this.status = 'kaishi';
        this.shijian = e.data.duration;
        this.beifenshijian = e.data.duration;
        this.is_timeout = e.data.is_timeout;
        this.is_all_show = e.data.is_all_show;
        this.timeFormat(Math.abs(this.shijian));
        this.timerFun(e.data.duration);
        // 禁用互动工具-计时器
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitDisTimerIcon', ['disTimer', true])
        );
        this.$emit('disTimer', true);
      },
      // 计时器结束
      timer_end(e) {
        console.warn('监听到了计时器结束-------', e);
        this.timerVisible = false;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitDisTimerIcon', ['disTimer', false])
        );
        this.$emit('disTimer', true);
        clearInterval(this.timer);
      },
      // 计时器暂停
      timer_pause(e) {
        console.warn('监听到了计时器暂停-------', e);
        this.status = 'zanting';
        this.timeFormat(Math.abs(e.data.remain_time));
        clearInterval(this.timer);
      },
      // 计时器重置
      timer_reset(e) {
        console.warn('监听到了计时器重置-------', e);
        clearInterval(this.timer);
        this.timerVisible = false;
        // 关闭计时器
        // 主讲人助理打开计时设置弹框
        this.$emit('disTimer', true);
        const arr = [3];
        if (
          arr.includes(this.userInfo.role_name) ||
          this.userInfo.third_party_user_id == this.doc_permission
        ) {
          this.$emit('openSetTimer');
          return false;
        }
      },
      // 计时器继续
      timer_resume(e) {
        console.warn('监听到了计时器继续-------', e);
        this.status = 'kaishi';
        this.timerFun(this.shijian);
      },
      init() {
        this.timerServer
          .getTimerInfo()
          .then(res => {
            if (JSON.stringify(res.data) != '{}') {
              console.log(res.data, 'timerInfo');
              const resData = res.data;
              this.shijian = resData.remain_time;
              this.beifenshijian = resData.duration;
              this.is_timeout = resData.is_timeout;
              this.is_all_show = resData.is_all_show;
              this.timeFormat(Math.abs(this.shijian));
              this.timerVisible = true;
              if (resData.status != 4) {
                this.timerFun(this.shijian);
              }
              if (resData.status == 4) {
                this.status = 'zanting';
              }
              if (resData.status == 2) {
                this.status = 'jieshu';
              }
              this.$emit('disTimer', false);
            }
          })
          .catch(e => e);
      },
      // 打开计时弹框
      openTimer() {
        // this.$nextTick(()=>{
        //   console.log(this.shijian)
        //   this.shijian = this.timerInfo.time;
        //   this.beifenshijian = this.timerInfo.time;
        //   this.timerVisible = true;
        this.$emit('disTimer', false);
        //   this.timeFormat(this.shijian)
        //   this.timerFun(this.shijian);
        // })
      },
      // open关闭提示
      onClose() {
        this.$emit('disTimer', true);
        this.$confirm('是否关闭计时器', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            this.closeTimerConfirm();
          })
          .catch(() => {});
      },
      // close关闭提示弹框
      closeTimerConfirm() {
        this.timerVisible = false;
        clearInterval(this.timer);
        this.editTimer(2);
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
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        console.log(data);
        this.timer = setInterval(() => {
          if (this.is_timeout == 0) {
            if (data == 1) {
              this.status = 'jieshu';
            }
            if (data == 0) {
              clearInterval(this.timer);
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
      },
      // 暂停 || 继续
      goOn(status) {
        if (status == 4) {
          this.status = 'zanting';
          // if (window.chatSDK) {
          // TODO: // 主动向房间暂停发送消息
          this.msgServer.sendCustomMsg({
            role_name: JSON.parse(sessionStorage.getItem('user')).role_name,
            type: 'timer_pause',
            remain_time: this.shijian
          });
          // }
        } else {
          this.status = this.shijian > 0 ? 'kaishi' : 'chaoshi';
          this.timerFun(this.shijian);
        }
        this.editTimer(status);
      },
      // open重置弹框
      reset() {
        this.$confirm('是否重新设置计时器？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            this.resetTimerConfirmClose();
          })
          .catch(() => {});
      },
      // 重置时间
      resetTimerConfirmClose() {
        this.timerVisible = false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimerSet'));
        // this.$emit('openSetTimer');
        clearInterval(this.timer);
        this.status = 'kaishi';
        this.editTimer(3);
      },
      // 操作计时器
      editTimer(status) {
        this.timerServer
          .timerEdit({
            action_type: status,
            duration: this.beifenshijian || this.shijian,
            remain_time: this.shijian,
            is_all_show: this.is_all_show ? 1 : 0,
            is_timeout: this.is_timeout ? 1 : 0
          })
          .then(res => {
            console.log(res);
          });
      }
    }
  };
</script>

<style lang="less">
  @import url(./style.less);
  .ft14 {
    font-size: 14px;
  }
  .time-open {
    .w92 {
      padding: 9px 34px !important;
      color: #fff;
    }
    .button_zanting,
    .button_zanting:hover {
      border: 1px solid #595959 !important;
      background: #595959 !important;
    }
    .button_chongzhi {
      border: 1px solid #fb3a32;
      background: #fb3a32;
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
    .mt10 {
      margin-top: 10px;
    }
    .mt20 {
      margin-top: 20px;
    }
    .mt24 {
      margin-top: 24px;
    }
    .bgimg {
      width: 292px;
      position: fixed;
      z-index: 12;
      padding: 24px 20px;
      top: 15vh;
      left: 50vw;
      transform: translate(-50%, 0%);
      color: #fff;
      background-image: linear-gradient(#fffaee, #fff6d5);
      border-radius: 20px;
    }
    .timerbg {
      display: inline-block;
      background: url('./img/timerbg.png');
      height: 75px;
      width: 53px;
      position: relative;
      strong {
        font-size: 38px;
        position: absolute;
        top: 15px;
        left: 14px;
      }
    }
    .padding45 {
      padding: 0 20px;
    }
    .margin10 {
      border-radius: 4px;
      height: 83px;
      text-align: center;
    }
    .ps {
      position: absolute;
    }
    .border3 {
      border-top: 4px solid #000;
      top: 40px;
      z-index: 999;
      width: 100%;
    }
    .bg000 {
      background: #000000;
      .ft28 {
        font-size: 28px;
        top: -33px;
        font-weight: bold;
      }
    }
    .close {
      margin-right: 11px;
      margin-top: 11px;
      cursor: pointer;
      width: 20px;
      height: 20px;
      opacity: 0.8;
      position: absolute;
      right: -35px;
      top: -10px;
      color: #666666;
      & > i {
        font-size: 10px;
        float: right;
        line-height: 20px;
      }
    }
    .margin5 {
      box-sizing: border-box;
      margin: 4px 3px;
    }
    .mb20 {
      margin-bottom: 20px;
    }
    .pr {
      position: relative;
    }
  }
  .timer-padtop {
    .button_cancle {
      border: 1px solid #cccccc;
      color: #666666;
      background: #fff;
    }
    .button_cancle:hover {
      border: 1px solid #fb3a32;
      color: #fb3a32;
      background: #fff;
    }
    .el-dialog__body {
      padding-top: 0 !important;
    }
    .mt10 {
      margin-top: 10px;
    }
    .mt20 {
      margin-top: 20px;
    }
  }
  .time-open .el-dialog__wrapper {
    // position: absolute;
    left: 400px;
    right: 400px;
    top: 200px;
    bottom: 200px;
  }
</style>
