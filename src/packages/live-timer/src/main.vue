<template>
  <div class="vmp-live-timer">
    <div v-if="timerVisible && !groupInitData.isInGroup" class="background-img" v-drag>
      <el-row>
        <el-row
          :class="
            status == 'timeout'
              ? 'pause_font_color'
              : status == 'start'
              ? 'start_font_color'
              : 'timeout_font_color'
          "
        >
          <el-col align="center" class="ft14">
            <div v-if="time < 0">超时，开始正向计时</div>
            <div v-else>
              {{ timeComputed }}
              倒计时{{ status == 'timeout' ? '已暂停' : status == 'end' ? '已结束' : '进行中...' }}
            </div>
          </el-col>
          <!-- 如果角色是助理:3 或者 是主讲人可以关闭 -->
          <span class="close ps" @click="onClose" v-if="permissionFlag">
            <i class="vh-iconfont vh-line-close"></i>
          </span>
        </el-row>
        <!-- 时间显示区 -->
        <el-row class="number_base pr mt20">
          <div class="block-line ps"></div>

          <div class="timerbg">
            <div :class="time < 1 ? 'timeout_font_color' : ''">{{ ten_mon }}</div>
          </div>
          <div class="timerbg ml4">
            <div :class="time < 1 ? 'timeout_font_color' : ''">{{ mon }}</div>
          </div>

          <span class="pr ft22" :class="time < 1 ? 'timeout_font_color' : ''">:</span>

          <div class="timerbg">
            <div :class="time < 1 ? 'timeout_font_color' : ''">{{ ten_sec }}</div>
          </div>
          <div class="timerbg ml4">
            <div :class="time < 1 ? 'timeout_font_color' : ''">{{ sec }}</div>
          </div>
        </el-row>

        <el-row v-if="permissionFlag">
          <el-col align="center" class="mt16">
            <el-button
              round
              plain
              v-if="status == 'timeout'"
              @click="goOn(5)"
              class="button_width button_timeout"
            >
              继续
            </el-button>
            <el-button
              round
              plain
              v-else
              :disabled="(time == 0 && is_timeout == 0) || time == -3599"
              @click="goOn(4)"
              class="button_width button_timeout"
            >
              暂停
            </el-button>
            <el-button round plain @click="resetTimer" class="button_width button_reset">
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-row>
    </div>
  </div>
</template>

<script>
  import { useTimerServer, useMsgServer, useChatServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    // props: ['timerInfo', 'rootActive', 'doc_permission'],
    name: 'VmpLiveTimer',
    directives: {
      drag(el) {
        el.onmousedown = function (e) {
          const disx = e.pageX - el.offsetLeft;
          const disy = e.pageY - el.offsetTop;
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
      return {
        status: 'start',
        totalTimeNum: 60,
        time: 0,
        timer: null,
        auth: 1,
        timerVisible: false,
        is_timeout: 0,
        is_all_show: 0,
        sec: 0,
        ten_sec: 0,
        mon: 0,
        ten_mon: 0
      };
    },
    computed: {
      // 自身信息获取
      userInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      //互动工具状态
      interactToolStatus() {
        const { interactToolStatus = {} } = this.$domainStore.state.roomBaseServer;
        return interactToolStatus;
      },
      // 小组信息获取
      groupInitData() {
        return this.$domainStore.state.groupServer.groupInitData;
      },
      // 主讲人id
      doc_permission() {
        let currentSpeakerId;
        if (this.groupInitData.isInGroup) {
          currentSpeakerId = this.groupInitData.doc_permission;
        } else {
          currentSpeakerId = this.interactToolStatus.doc_permission;
        }
        return currentSpeakerId;
      },
      /**
       * 权限控制
       * 当前用户角色 1-主持人 2-观众(发起端没有观众) 3-助理；4-嘉宾（互动直播才有嘉宾）
       * 如果角色是助理:3 或者 是主讲人可以关闭
       */
      permissionFlag() {
        //是否在分组里
        if ([1, 3].includes(this.userInfo.role_name)) {
          return true;
        }
        if (this.userInfo.third_party_user_id == this.doc_permission) {
          return true;
        }
        return false;
      },
      // 总时间计算显示
      timeComputed() {
        return 60 > this.totalTimeNum
          ? this.totalTimeNum + '秒'
          : parseInt(this.totalTimeNum / 60) + '分' + (this.totalTimeNum % 60) + '秒';
      }
    },
    beforeCreate() {
      this.timerServer = useTimerServer();
      this.msgServer = useMsgServer();
    },
    mounted() {
      this.init();
      // this.timerServer.listenMsg();
      // console.log(this.timerServer, 'this.timerServer');
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
      // 添加聊天记录
      addChatToList(e) {
        let str = '';
        switch (e.data.type) {
          case 'timer_start':
            str = '发起了计时器';
            break;
          case 'timer_end':
            str = '关闭了计时器';
            break;
          case 'timer_pause':
            str = '暂停了计时器';
            break;
          case 'timer_reset':
            str = '重置了计时器';
            break;
          case 'timer_resume':
            str = '继续了计时器';
            break;
        }
        const text = this.$getRoleName(e.data.role_name);
        const data = {
          nickname: '计时器',
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: `${text}${str}`
          },
          type: e.data.type
        };
        useChatServer().addChatToList(data);
      },
      // 计时器开始
      timer_start(e) {
        console.warn('监听到了计时器开始-------', e);
        this.timerVisible = true;
        this.status = 'start';
        this.time = e.data.duration;
        this.totalTimeNum = e.data.duration;
        this.is_timeout = e.data.is_timeout;
        this.is_all_show = e.data.is_all_show;
        this.timeFormat(Math.abs(this.time));
        this.timerFun(e.data.duration);
        // 禁用互动工具-计时器
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitDisTimerIcon', ['disTimer', true])
        );
        this.addChatToList(e);
      },
      // 计时器结束
      timer_end(e) {
        console.warn('监听到了计时器结束-------', e);
        this.timerVisible = false;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitDisTimerIcon', ['disTimer', false])
        );
        // this.$emit('disTimer', true);
        clearInterval(this.timer);
        if (e.data.type == 'live_over') return;
        this.addChatToList(e);
      },
      // 计时器暂停
      timer_pause(e) {
        console.warn('监听到了计时器暂停-------', e);
        this.status = 'timeout';
        this.timeFormat(Math.abs(e.data.remain_time));
        clearInterval(this.timer);
        this.addChatToList(e);
      },
      // 计时器重置
      timer_reset(e) {
        console.warn('监听到了计时器重置-------', e);
        clearInterval(this.timer);
        this.timerVisible = false;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitDisTimerIcon', ['disTimer', false])
        );
        // 关闭计时器
        // 主讲人助理打开计时设置弹框
        // this.$emit('disTimer', true);
        // if (
        //   this.userInfo.role_name == 3 ||
        //   this.userInfo.third_party_user_id == this.doc_permission
        // ) {
        //   this.$emit('openSetTimer');
        //   return false;
        // }
        this.addChatToList(e);
      },
      // 计时器继续
      timer_resume(e) {
        console.warn('监听到了计时器继续-------', e);
        this.status = 'start';
        this.timerFun(this.time);
        this.addChatToList(e);
      },
      init() {
        this.timerServer
          .getTimerInfo()
          .then(res => {
            if (JSON.stringify(res.data) != '{}') {
              console.log(res.data, 'timerInfo');
              const resData = res.data;
              this.time = resData.remain_time;
              this.totalTimeNum = resData.duration;
              this.is_timeout = resData.is_timeout;
              this.is_all_show = resData.is_all_show;
              this.timeFormat(Math.abs(this.time));
              this.timerVisible = true;
              if (resData.status != 4) {
                this.timerFun(this.time);
              }
              if (resData.status == 4) {
                this.status = 'timeout';
              }
              if (resData.status == 2) {
                this.status = 'end';
              }
              // 禁用互动工具-计时器
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitDisTimerIcon', ['disTimer', true])
              );
              // this.$emit('disTimer', false);
            }
          })
          .catch(e => e);
      },
      // open关闭提示
      onClose() {
        this.$confirm('是否关闭计时器', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box ',
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
              this.status = 'end';
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
          this.time = data;
        }, 1000);
      },
      // 暂停 || 继续
      goOn(status) {
        if (status == 4) {
          this.status = 'timeout';
          this.msgServer.sendCustomMsg({
            role_name: this.userInfo.role_name,
            type: 'timer_pause',
            remain_time: this.time
          });
        } else {
          this.status = this.time > 0 ? 'start' : 'chaoshi';
          this.timerFun(this.time);
        }
        this.editTimer(status);
      },
      // open重置弹框
      resetTimer() {
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
        clearInterval(this.timer);
        this.status = 'start';
        this.editTimer(3);
      },
      // 操作计时器
      editTimer(status) {
        this.timerServer
          .timerEdit({
            action_type: status,
            duration: this.totalTimeNum || this.time,
            remain_time: this.time,
            is_all_show: this.is_all_show == 0 ? 0 : 1,
            is_timeout: this.is_timeout == 0 ? 0 : 1
          })
          .then(res => {
            console.log(res);
          });
      }
    }
  };
</script>

<style lang="less">
  @import url(./font_family/numberFont.less);
  .ft14 {
    font-size: 14px;
  }
  .vmp-live-timer {
    @font-high-light-normal: #fb2626;
    .button_timeout {
      border: 1px solid #595959 !important;
      color: #595959 !important;
      &:hover {
        border: 1px solid @font-high-light-normal !important;
        background: @font-high-light-normal;
        color: white !important;
      }
      &:active {
        border: 1px solid @active-normal !important;
        background: @active-normal;
        color: white !important;
      }
    }
    .el-button.is-disabled:hover {
      background: @font-high-light-normal;
    }
    .button_reset {
      border: 1px solid @font-high-light-normal !important;
      color: @font-high-light-normal !important;
      &:hover {
        border: 1px solid @font-high-light-normal !important;
        background: @font-high-light-normal;
        color: white !important;
      }
      &:active {
        border: 1px solid @active-normal !important;
        background: @active-normal;
        color: white !important;
      }
    }
    .start_font_color {
      color: #0fbb5a;
    }
    .pause_font_color {
      color: #fc9600;
    }
    .timeout_font_color {
      color: @font-high-light-normal;
    }
    .mt16 {
      margin-top: 16px;
    }
    .mt20 {
      margin-top: 20px;
    }
    .ml4 {
      margin-left: 4px;
    }
    .background-img {
      width: 296px;
      box-sizing: border-box;
      position: fixed;
      z-index: 102;
      padding: 24px 32px;
      top: 15vh;
      left: 50vw;
      transform: translate(-50%, 0);
      color: #262626;
      background: white;
      border-radius: 8px;
    }
    .timerbg {
      display: inline-block;
      background: url('./img/timerbg.png') no-repeat;
      background-size: 100% 100%;
      height: 62px;
      width: 50px;
      position: relative;
      text-align: center;
      & > :first-child {
        .custom-font-barlow;
        font-size: 44px;
        font-weight: bold;
        line-height: 58px;
      }
    }
    .number_base {
      border-radius: 8px;
      padding: 8px;
      background: #d9d9d9;
      .ft22 {
        .custom-font-barlow;
        font-size: 22px;
        top: -10px;
        font-weight: bold;
      }
    }
    .ps {
      position: absolute;
    }
    .block-line {
      border: 1px solid #d9d9d9;
      top: 48%;
      z-index: 999;
      width: 95%;
    }
    .close {
      cursor: pointer;
      position: absolute;
      right: 0;
      color: #666;
      & > i {
        font-size: 10px;
        float: right;
        line-height: 20px;
      }
    }
    .pr {
      position: relative;
    }
  }
</style>
