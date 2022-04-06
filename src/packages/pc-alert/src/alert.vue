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
          <a class="cancel" href="javascript:;" @click="onCancel">
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
