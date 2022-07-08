<template>
  <div class="timer-base">
    <el-dialog
      :visible.sync="timerVisible"
      width="342px"
      center
      class="bgimg"
      :before-close="onClose"
    >
      <el-row class="padding45">
        <el-row>
          <!-- 时间增 -->
          <div class="button_top">
            <img
              v-if="ten_mon != 5"
              src="./img/add.png"
              alt=""
              @click="operationTime('ten_mon', 'add')"
            />
            <img v-else src="./img/addDis.png" alt="" />
          </div>
          <div class="button_top">
            <img v-if="mon != 9" src="./img/add.png" alt="" @click="operationTime('mon', 'add')" />
            <img v-else src="./img/addDis.png" alt="" />
          </div>
          <div class="ml10 button_top">
            <img
              v-if="ten_sec != 5"
              src="./img/add.png"
              alt=""
              @click="operationTime('ten_sec', 'add')"
            />
            <img v-else src="./img/addDis.png" alt="" />
          </div>
          <div class="button_top">
            <img v-if="sec != 9" src="./img/add.png" alt="" @click="operationTime('sec', 'add')" />
            <img v-else src="./img/addDis.png" alt="" />
          </div>

          <!-- 时间显示区 -->
          <el-col class="margin10 bg000 ft42 pr font_zdy">
            <div class="border4 ps"></div>
            <span class="close ps" @click="onClose">
              <i class="vh-iconfont vh-line-close"></i>
            </span>
            <div class="margin5 timerbg">
              <el-input
                maxlength="1"
                v-model="ten_mon"
                @focus="inputClear('ten_mon')"
                @blur="testing('ten_mon')"
              ></el-input>
            </div>
            <div class="margin5 timerbg">
              <el-input
                maxlength="1"
                v-model="mon"
                @focus="inputClear('mon')"
                @blur="testing('mon')"
              ></el-input>
            </div>

            <strong class="pr ft28">:</strong>

            <div class="margin5 timerbg">
              <el-input
                maxlength="1"
                v-model="ten_sec"
                @focus="inputClear('ten_sec')"
                @blur="testing('ten_sec')"
              ></el-input>
            </div>
            <div class="margin5 timerbg">
              <el-input
                maxlength="1"
                v-model="sec"
                @focus="inputClear('sec')"
                @blur="testing('sec')"
              ></el-input>
            </div>
          </el-col>

          <!-- 时间减 -->
          <div class="button_top">
            <img
              v-if="ten_mon != 0"
              src="./img/down.png"
              alt=""
              @click="operationTime('ten_mon')"
            />
            <img v-else src="./img/downDis.png" alt="" />
          </div>
          <div class="button_top">
            <img v-if="mon != 0" src="./img/down.png" alt="" @click="operationTime('mon')" />
            <img v-else src="./img/downDis.png" alt="" />
          </div>
          <div class="ml10 button_top">
            <img
              v-if="ten_sec != 0"
              src="./img/down.png"
              alt=""
              @click="operationTime('ten_sec')"
            />
            <img v-else src="./img/downDis.png" alt="" />
          </div>
          <div class="button_top">
            <img v-if="sec != 0" src="./img/down.png" alt="" @click="operationTime('sec')" />
            <img v-else src="./img/downDis.png" alt="" />
          </div>
        </el-row>
        <!-- 表单部分 -->
        <el-row class="mt20">
          <el-col :span="13">
            <span>
              <span class="pr top3">
                <span class="color1a1a1a">观众可见</span>
                <el-tooltip
                  placement="right"
                  :visible-arrow="false"
                  popper-class="transfer-box"
                  style="margin-left: 4px"
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
                  placement="right"
                  :visible-arrow="false"
                  popper-class="transfer-box"
                  style="margin-left: 4px"
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
          <el-button round type="primary" @click="onSubmit" class="w120">开始计时</el-button>
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
  @import url(./style.less);
  .timer-base{
    .padding45{
      padding: 0 45px;
      user-select: none;
    }
    .color1a1a1a{
      color: #1a1a1a;
    }
    .el-switch__core{
      margin-top: 2px;
      height: 16px;
    }
    .el-switch__core::after{
      height: 12px;
      width: 12px;
    }
    .el-switch.is-checked .el-switch__core::after{
      margin-left: -13px;
    }
    .w120{
      padding: 9px 32px !important;
      border: 1px solid #fb3a32 !important;
      color: #fff !important;
      background: #fb3a32;
    }
    .margin10{
      border-radius: 4px;
      height: 83px;
      text-align: center;
    }
    .bg000{
      background: #000000;
      .ft28{
        font-size: 28px;
        top: -4px;
      }
    }
    .ft42{
      font-size: 20px;
      color: white;
    }
    .margin5{
      box-sizing: border-box;
      margin: 4px 3px;
    }
    .border4{
      border-top: 4px solid #000;
      top: 40px;
      z-index: 999;
      width: 100%;
    }
    .ps{
      position: absolute;
    }
    .pr{
      position: relative;
    }
    .top10{
      top: 11px;
    }
    .bgimg .el-dialog{
      background-image: linear-gradient(#fffaee, #fff6d5);
          border-radius: 20px
      // background: url('./img/timerset.png');
    }
    .bgimg .el-dialog--center .el-dialog__body{
      padding: 25px 0;
    }
    .bgimg .el-dialog__header{
      display: none;
    }
    .timerbg{
      display: inline-block;
      background: url('./img/timerbg.png');
      height: 75px;
      width: 53px;
      .el-input__inner{
        border: 0;
        height: 74px;
        background: transparent;
        color: #fff;
      }
      .el-input__inner{
        font-family: 'Gilroy';
        font-size: 38px;
        font-weight: bold;
        text-align: center;
      }
    }
    .mt20{
      margin-top: 20px;
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
      top: -25px;
      color: #1a1a1a;
      & > i {
        font-size: 10px;
        float: right;
        line-height: 20px;
      }
    }
    .button_top{
      display: inline-block;
      width: 60px;
      text-align: center;
      cursor: pointer;
      user-select: none;
      img {
        padding: 3px 10px
      }
    }
    .ml10{
      margin-left: 10px;
    }
    .top3{
      top: 3px;
    }
    .pr5{
      padding-right: 5px;
      margin-left: 1px !important;
    }
  }
</style>
