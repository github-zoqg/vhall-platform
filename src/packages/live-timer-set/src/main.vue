<template>
  <div class="timer-base">
    <el-dialog
      :visible.sync="timerVisible"
      width="296px"
      center
      class="bgimg"
      :before-close="onClose"
    >
      <el-row class="timer-base-padding">
        <el-row>
          <!-- 时间增 -->
          <div class="ml8 button_top">
            <img
              :class="{ opacity: ten_mon == 5 }"
              src="./img/add.png"
              alt=""
              @click="ten_mon != 5 && operationTime('ten_mon', 'add')"
            />
          </div>
          <div class="button_top ml4">
            <img
              :class="{ opacity: mon == 9 }"
              src="./img/add.png"
              alt=""
              @click="mon != 9 && operationTime('mon', 'add')"
            />
          </div>
          <div class="ml6 button_top">
            <img
              :class="{ opacity: ten_sec == 5 }"
              src="./img/add.png"
              alt=""
              @click="ten_sec != 5 && operationTime('ten_sec', 'add')"
            />
          </div>
          <div class="button_top ml4">
            <img
              :class="{ opacity: sec == 9 }"
              src="./img/add.png"
              alt=""
              @click="sec != 9 && operationTime('sec', 'add')"
            />
          </div>

          <!-- 时间显示区 -->
          <el-col class="margin10 bg000 pr custom-font-barlow">
            <div class="line_weight ps"></div>
            <span class="close ps" @click="onClose">
              <i class="vh-iconfont vh-line-close"></i>
            </span>
            <div class="timerbg">
              <el-input
                maxlength="1"
                v-model="ten_mon"
                @focus="inputClear('ten_mon')"
                @blur="testing('ten_mon')"
              ></el-input>
            </div>
            <div class="timerbg marl4">
              <el-input
                maxlength="1"
                v-model="mon"
                @focus="inputClear('mon')"
                @blur="testing('mon')"
              ></el-input>
            </div>

            <strong class="pr ft42">:</strong>

            <div class="timerbg">
              <el-input
                maxlength="1"
                v-model="ten_sec"
                @focus="inputClear('ten_sec')"
                @blur="testing('ten_sec')"
              ></el-input>
            </div>
            <div class="timerbg marl4">
              <el-input
                maxlength="1"
                v-model="sec"
                @focus="inputClear('sec')"
                @blur="testing('sec')"
              ></el-input>
            </div>
          </el-col>

          <!-- 时间减 -->
          <div class="ml8 button_top">
            <img
              :class="{ opacity: ten_mon == 0 }"
              src="./img/down.png"
              alt=""
              @click="operationTime('ten_mon')"
            />
          </div>
          <div class="button_top ml4">
            <img
              :class="{ opacity: mon == 0 }"
              src="./img/down.png"
              alt=""
              @click="operationTime('mon')"
            />
          </div>
          <div class="ml6 button_top">
            <img
              :class="{ opacity: ten_sec == 0 }"
              src="./img/down.png"
              alt=""
              @click="operationTime('ten_sec')"
            />
          </div>
          <div class="button_top ml4">
            <img
              :class="{ opacity: sec == 0 }"
              src="./img/down.png"
              alt=""
              @click="operationTime('sec')"
            />
          </div>
        </el-row>
        <!-- 表单部分 -->
        <el-row class="time_form">
          <el-col :span="13">
            <span>
              <span class="pr top3">
                <span class="color1a1a1a">观众可见</span>
                <el-tooltip
                  placement="top-start"
                  offset="70"
                  :visible-arrow="false"
                  popper-class="timer_form_transfer-box"
                >
                  <i class="vh-iconfont vh-line-question pr5" style="color: #666"></i>
                  <div slot="content">
                    1.计时器功能在默认情况下，对观众不可见。（仅对主持人、嘉宾、助理三个身份可见）
                    <br />
                    2.无延迟模式下，可开启对观众可见。（非无延迟模式下，不可开启对观众可见）
                  </div>
                </el-tooltip>
              </span>
              <el-switch
                :width="28"
                v-model="form.is_all_show"
                @change="changeAllShow"
                size="mini"
                active-color="#fb3a32"
              ></el-switch>
            </span>
          </el-col>
          <el-col :span="11">
            <span>
              <span class="pr top3">
                <span class="color1a1a1a">可超时</span>
                <el-tooltip
                  placement="top-end"
                  offset="-40"
                  :visible-arrow="false"
                  popper-class="timer_form_transfer-box"
                >
                  <i class="vh-iconfont vh-line-question pr5" style="color: #666"></i>
                  <div slot="content">
                    1.设置可超时后，倒计时结束，变倒计时为从00:00开始的正向计时，记录超时时间
                    <br />
                    2.超时后，发起人可手动暂停/结束计时，或可重置计时器
                  </div>
                </el-tooltip>
              </span>
              <el-switch
                :width="28"
                v-model="form.is_timeout"
                size="mini"
                active-color="#fb3a32"
              ></el-switch>
            </span>
          </el-col>
        </el-row>
        <el-col align="center" class="mt20">
          <el-button round plain @click="onSubmit" class="w120">开始计时</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { useTimerServer, useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpLiveTimerSet',
    data() {
      return {
        form: {
          is_all_show: false,
          is_timeout: false
        },
        timerVisible: false,
        sec: 0,
        ten_sec: 0,
        mon: 0,
        ten_mon: 0
      };
    },
    beforeCreate() {
      this.timerServer = useTimerServer();
    },
    mounted() {
      // this.timerServer.listenMsg();
      // 计时器开始
      this.timerServer.$on('timer_start', temp => {
        console.log(temp, '原始消息');
        this.timerVisible = false;
      });
      // 计时器结束
      this.timerServer.$on('timer_end', () => {
        console.warn('监听到了计时器结束-------');
        this.form = {
          is_all_show: false,
          is_timeout: false
        };
        this.sec = 0;
        this.ten_sec = 0;
        this.mon = 0;
        this.ten_mon = 0;
      });
    },
    methods: {
      openTimerSet() {
        this.timerVisible = true;
      },
      onClose() {
        // this.$emit('disTimer', true);
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitDisTimerIcon', ['disTimer', false])
        );
        this.timerVisible = false;
      },
      // 表单&时间提交
      onSubmit() {
        console.log(this.form);
        const time = this.ten_sec * 10 + this.sec * 1 + (this.ten_mon * 10 + this.mon * 1) * 60;
        if (time == 0) {
          this.$message.warning('请先确认倒计时间');
          return false;
        }
        this.timerVisible = false;
        this.$emit('showTimerFunc', {
          time: time,
          is_timeout: this.form.is_timeout,
          is_all_show: this.form.is_all_show
        });
        this.timerServer
          .timerCreate({
            duration: time,
            is_all_show: this.form.is_all_show ? 1 : 0,
            is_timeout: this.form.is_timeout ? 1 : 0
          })
          .then(res => {
            console.log(res);
          })
          .catch(err => console.log(err));
      },
      // 时间操作
      operationTime(data, status) {
        if (!status && this[data] == 0) return;
        status == 'add' ? this[data]++ : this[data]--;
      },
      // input检查
      testing(data) {
        if (!/^[0-9]{1}$/.test(this[data])) {
          this[data] = 0;
        } else {
          if ((data == 'ten_sec' || data == 'ten_mon') && this[data] > 5) {
            this[data] = 5;
          }
        }
      },
      // 清空input
      inputClear(data) {
        this[data] = '';
      },
      changeAllShow() {
        if (useRoomBaseServer().state.watchInitData.webinar.no_delay_webinar != 1) {
          this.$message({
            type: 'warning',
            message: '当前活动非无延迟模式，不支持此功能'
          });
          this.form.is_all_show = false;
          return false;
        }
      }
    }
  };
</script>

<style lang="less">
  @import url(./font_family/numberFont.less);
  .timer_form_transfer-box {
    width: 246px;
    box-sizing: border-box;
  }
  .timer-base {
    .timer-base-padding {
      padding: 48px 32px 26px;
      user-select: none;
      & > :first-child {
        font-size: 0;
      }
    }
    .color1a1a1a {
      color: #1a1a1a;
    }
    .el-switch__core {
      margin-top: 2px;
      height: 16px;
    }
    .el-switch__core::after {
      height: 12px;
      width: 12px;
    }
    .el-switch.is-checked .el-switch__core::after {
      margin-left: -13px;
    }
    @font-high-light-normal: #fb2626;
    .w120 {
      margin-top: 24px;
      border: 1px solid @font-high-light-normal !important;
      color: @font-high-light-normal !important;
      &:hover {
        color: white !important;
        background: @font-high-light-normal !important;
      }
      &:active {
        color: white !important;
        background: @active-normal !important;
      }
    }
    .margin10 {
      border-radius: 4px;
      text-align: center;
      padding: 8px;
    }
    .bg000 {
      background: #d9d9d9;
    }
    .ft42 {
      font-size: 20px;
      top: -11px;
    }
    .line_weight {
      border: 1px solid #d9d9d9;
      top: 49%;
      z-index: 999;
      width: 95%;
    }
    .ps {
      position: absolute;
    }
    .pr {
      position: relative;
    }
    .top10 {
      top: 11px;
    }
    .bgimg .el-dialog {
      background: #fff;
      border-radius: 8px;
    }
    .bgimg .el-dialog--center .el-dialog__body {
      padding: 0;
    }
    .bgimg .el-dialog__header {
      display: none;
    }
    .timerbg {
      display: inline-block;
      background: url('./img/timerbg.png');
      background-size: 100% 100%;
      height: 62px;
      width: 50px;
      .el-input__inner {
        border: 0;
        height: 62px;
        background: transparent;
        color: #262626;
      }
      .el-input__inner {
        .custom-font-barlow;
        font-size: 44px;
        font-weight: 700;
        text-align: center;
      }
    }
    .marl4 {
      margin-left: 4px;
    }
    .time_form {
      margin-top: 12px;
    }

    .close {
      cursor: pointer;
      position: absolute;
      right: 0;
      top: -42px;
      color: #666;
      & > i {
        line-height: 20px;
        font-size: 10px;
      }
    }
    .button_top {
      display: inline-block;
      width: 50px;
      text-align: center;
      cursor: pointer;
      user-select: none;
      height: 10px;
      line-height: 10px;
      img {
        padding: 0 10px;
      }
      .opacity {
        opacity: 0.4;
      }
    }
    .ml6 {
      margin-left: 6px;
    }
    .ml8 {
      margin-left: 8px;
    }
    .ml4 {
      margin-left: 4px;
    }
    .top3 {
      top: 3px;
    }
    .pr5 {
      padding: 0 5px;
    }
  }
</style>
