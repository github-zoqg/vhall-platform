<template>
  <div class="live-red-packet">
    <el-dialog :visible.sync="sendDialogVisible" width="440px" title="红包">
      <div class="live-red-packet_header">
        <p class="header_tip">
          请结合
          <span>[支付宝-口令红包]</span>
          功能发放红包
        </p>
        <p class="header_online">
          当前
          <span class="online">{{ onlineAmount }}</span>
          人在线
        </p>
      </div>
      <el-form class="packet-form-wrap" :model="packetForm" inline>
        <el-form-item label="红包口令">
          <el-input
            class="form-input"
            :class="isCheckCode ? 'el-form-item_error' : ''"
            maxlength="18"
            placeholder="6-18位汉字、数字"
            show-word-limit
            v-model.trim="packetForm.code"
          ></el-input>
          <br />
          <p class="envelope-tips">请确保与您在【支付宝-口令红包】中发出的口令一致</p>
        </el-form-item>

        <el-form-item label="参与人数">
          <el-radio v-model="packetForm.packetType" :label="1" @change="changePacketType">
            全部人员
          </el-radio>
          <el-radio
            v-model="packetForm.packetType"
            :label="2"
            @change="changePacketType"
            class="radio_last"
          >
            指定人数
          </el-radio>
          <el-input
            type="number"
            class="form-num"
            :class="isCheckSuccess ? 'el-form-item_error' : ''"
            @blur="checkNum"
            placeholder="输入人数"
            onkeyup="this.value=this.value.replace(/^((?!^[1-9]([0-9]+)?$).)*/g,'')"
            :disabled="packetForm.packetType == 1"
            show-word-limit
            v-model.trim="packetForm.num"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="live-red-packet_btnsbox">
        <el-button
          type="primary"
          round
          :disabled="packetForm.code.length < 6"
          class="start-btn"
          @click="redpacketSend()"
        >
          发红包
        </el-button>
      </div>
      <div class="live-red-packet_red-tips">
        <p>提示：直播观众抢到红包即获得口令，观众进入【支付宝-口令红包】输入口令领取</p>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useCodeRedPacketServer } from 'middle-domain';
  export default {
    name: 'VmpRedPacketLive',
    data() {
      const redPacketServerState = this.redPacketServer.state;
      return {
        redPacketServerState,
        sendDialogVisible: false,
        isCheckCode: false,
        isCheckSuccess: false,
        packetForm: {
          code: '',
          packetType: 1,
          num: ''
        }
      };
    },
    beforeCreate() {
      this.redPacketServer = useCodeRedPacketServer({
        mode: 'live'
      });
    },
    computed: {
      onlineAmount() {
        return this.redPacketServerState.online;
      },
      role() {
        return this.$domainStore?.state?.roomBaseServer?.watchInitData?.join_info?.role_name;
      }
    },
    methods: {
      handleRedPacket(flag) {
        flag ? this.open() : this.close();
      },
      open() {
        this.sendDialogVisible = true;
        this.restForm();
        this.redPacketServer.getRedpacketTotal();
      },
      close() {
        this.sendDialogVisible = false;
      },
      // 发起红包页面表单参数重置
      restForm() {
        this.isCheckCode = false;
        this.isCheckSuccess = false;
        this.packetForm = {
          code: '',
          packetType: 1,
          num: ''
        };
      },
      redpacketSend() {
        // if (this.isCheckCode) {
        //   this.$message.warning('请输入6~18位汉字、数字或字母');
        //   this.isCheckCode = true;
        //   return;
        // }
        if (this.packetForm.packetType == 2 && (this.isCheckSuccess || this.packetForm.num == '')) {
          this.$message.warning('需大于0小于当前在线人数');
          this.isCheckSuccess = true;
          return;
        }
        let params = {
          red_code: this.packetForm.code,
          join_type: this.packetForm.packetType,
          number: this.packetForm.packetType == 2 ? this.packetForm.num : undefined
        };
        this.redPacketServer
          .createCodeRedPacket(params)
          .then(res => {
            if (res.code === 200) {
              this.sendDialogVisible = false;
              this.restForm();
              this.reportRedPacket();
              this.$message.success('口令红包发送成功');
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch(error => {
            this.$message.error(error.msg);
          });
      },
      reportRedPacket() {
        window.vhallReportForProduct && window.vhallReportForProduct.report(110054);
      },
      checkNum() {
        if (this.packetForm.num == '' || this.packetForm.num > this.onlineAmount) {
          this.$message.warning('需大于0小于当前在线人数');
          this.isCheckSuccess = true;
          return;
        } else {
          this.isCheckSuccess = false;
        }
      },
      checkCode() {
        const regex = /^[a-z0-9_A-Z\u4E00-\u9FA5a]+$/g;
        if (this.packetForm.code === '' || !regex.test(this.packetForm.code)) {
          this.$message.warning('请输入6~18位汉字、数字或字母');
          this.isCheckCode = true;
          return;
        } else {
          this.isCheckCode = false;
        }
      },
      changePacketType() {
        if (this.packetForm.packetType == 1) {
          this.packetForm.num = '';
          this.isCheckSuccess = false;
        }
      }
    }
  };
</script>
<style lang="less">
  .live-red-packet {
    .el-form-item {
      margin-right: 0;
      width: 100%;
      .el-form-item__label {
        width: 76px;
        color: #1a1a1a;
      }
      .el-form-item__content {
        width: calc(100% - 76px);
        .form-input {
          width: 100%;
          &-tip {
            position: absolute;
            left: 100%;
          }
          &.el-form-item_error {
            .el-input__inner {
              border-color: #fb3a32;
            }
          }
        }
      }
      .el-input__count {
        font-size: 14px;
      }
    }
    .el-radio {
      margin-right: 20px;
      &.radio_last {
        margin-right: 5px;
      }
    }
    .el-radio__label {
      color: #222;
      padding-left: 0;
    }
    .el-radio__input {
      &.is-checked + .el-radio__label {
        color: #222;
      }
      .el-radio__inner {
        width: 16px;
        height: 16px;
        &::after {
          width: 8px;
          height: 8px;
        }
      }
    }
    .form-num {
      &.el-input {
        width: 120px;
        .el-input__inner {
          height: 36px;
          line-height: 36px;
        }
      }
      &.el-form-item_error {
        .el-input__inner {
          border-color: #fb3a32;
        }
      }
    }
    .envelope-tips {
      line-height: 22px;
      font-size: 12px;
      padding-top: 5px;
      color: #999;
    }
    &_header {
      width: 100%;
      text-align: center;
      padding: 14px 0;
      background: #f2f2f2;
      border-radius: 4px;
      margin-bottom: 16px;
      .header_tip {
        font-size: 16px;
        color: #000;
        font-weight: 400;
        span {
          font-weight: 600;
        }
      }
      .header_online {
        font-size: 14px;
        color: #999;
        padding-top: 5px;
        .online {
          color: #fb3a32;
        }
      }
    }
    &_btnsbox {
      padding: 12px 0 16px 0;
      text-align: center;
      .start-btn {
        width: 200px;
        // margin-left: 65px;
        line-height: 20px;
      }
      .btn {
        display: inline-block;
        width: 200px;
        height: 36px;
        line-height: 36px;
        font-size: 14px;
        background: #fb3a32;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        &.disabled {
          opacity: 0.6;
          cursor: default;
        }
        &.btn-light-red:hover {
          background: #c51f1d;
        }
      }
    }
    &_red-tips {
      // padding-bottom: 24px;
      text-align: left;
      p {
        color: #999;
        font-size: 12px;
        line-height: 17px;
      }
    }
  }
</style>
