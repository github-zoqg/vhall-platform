<template>
  <div class="vmp-alert-wrap" v-show="visible">
    <div class="popup">
      <div class="recordboxHeader">
        <span class="header-title">{{ title || $t('account.account_1061') }}</span>
        <a
          href="javascript:;"
          @click="onClose"
          class="vh-iconfont vh-line-close"
          v-if="isShowClose"
        ></a>
      </div>
      <div class="popbody">
        <p class="f-12 tips">
          <slot name="content"></slot>
        </p>
        <p class="btnsbox" v-if="confirm">
          <a class="confirm" href="javascript:;" @click="onSubmit">
            {{ confirmText || $t('message.confirmText') }}
          </a>
          <a class="cancel" v-if="cancelText" href="javascript:;" @click="onCancel">
            {{ cancelText || $t('message.cancelText') }}
          </a>
        </p>
        <p class="btnsbox" v-else-if="retry">
          <a class="confirm" href="javascript:;" @click="onSubmit">
            {{ retry || $t('message.retryText') }}
          </a>
        </p>
        <p class="btnsbox" v-else>
          <a class="confirm" href="javascript:;" @click="onClose">
            {{ knowText || $t('message.knowText') }}
          </a>
        </p>
        <el-tooltip class="item" effect="dark" placement="bottom-end">
          <div class="tooltip-content" slot="content">
            <p class="content-title">请按以下方法排查：</p>
            <p>1.请确认网络连接正常</p>
            <p>2.请确认浏览器已授权摄像头、麦克风使用</p>
            <p>3.请确认摄像头、麦克风已正确连接并开启</p>
            <p>4.如果是外置摄像头、麦克风，请拔出重新拆入尝试</p>
            <p>5.重启您的电脑</p>
            <p>6.您还可以拨打客服：400-888-9970</p>
          </div>
          <span class="qaTip" v-if="showQA">问题排查</span>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'popup',
    props: {
      visible: {
        type: Boolean
      },
      title: {
        required: false
      },
      confirm: {
        required: false
      },
      knowText: {
        required: false
      },
      retry: {
        required: false
      },
      confirmText: {
        required: false
      },
      cancelText: {
        required: false
      },
      isShowClose: {
        type: Boolean,
        default: true
      },
      showQA: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      onClose() {
        this.$emit('onClose');
      },
      onCancel() {
        this.$emit('onCancel');
      },
      onSubmit() {
        this.$emit('onSubmit');
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-alert-wrap {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1200;
    align-items: center;
    display: flex;
    justify-content: center;
    * {
      box-sizing: border-box;
    }
    .popup {
      width: 400px;
      height: 200px;
      box-shadow: 0px 12px 42px 0px rgba(51, 51, 51, 0.24);
      border-radius: 4px;
      background-color: #fff;
      position: relative;
      margin-top: -10%;
      .recordboxHeader {
        position: relative;
        padding: 24px 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        a {
          color: #666;
        }
        .header-title {
          font-size: 20px;
          font-weight: 500;
          color: #1a1a1a;
        }
        .iconguanbi1 {
          position: absolute;
          top: 28px;
          color: #666;
          font-size: 12px;
          right: 32px;
        }
      }
      .popbody {
        font-size: 12px;
        line-height: 2;
        padding-top: 0px;
        padding-bottom: 25px;
        padding: 0 32px;
        .tips {
          font-size: 14px;
          line-height: 20px;
          color: #1a1a1a;
        }
        .content {
          margin: 10px auto 24px;
          text-align: center;
        }
        .btnsbox {
          text-align: right;
          position: absolute;
          bottom: 24px;
          right: 32px;
          a {
            display: inline-block;
            height: 36px;
            line-height: 36px;
            border-radius: 18px;
            display: inline-block;
            margin-bottom: 0;
            font-size: 14px;
            color: #666;
            font-weight: 400;
            text-align: center;
            padding: 0 24px;
            &.confirm {
              background: #fb3a32;
              color: #ffffff;
            }
            &.cancel {
              border: 1px solid #ccc;
              color: #666666;
              line-height: 34px;
              margin-left: 12px;
              &:hover {
                background: #fb3a32;
                border-color: #fb3a32;
                color: #ffffff;
              }
            }
          }
        }
        .qaTip {
          position: absolute;
          bottom: 24px;
          left: 32px;
          font-size: 14px;
          cursor: pointer;
          &:hover {
            color: #0a7ff5;
          }
        }
      }
    }
  }
  .vmp-dialog-wrap {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1200;
    align-items: center;
    display: flex;
    justify-content: center;
    * {
      box-sizing: border-box;
    }
  }
</style>
<style lang="less">
  .el-popper .popper__arrow::after {
    border-bottom-color: #fff !important;
  }
  .el-tooltip__popper .tooltip-content {
    line-height: 24px;
    .content-title {
      font-weight: bold;
    }
  }
</style>
