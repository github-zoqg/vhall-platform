<template>
  <div class="vmp-dialog-wrap" :class="{ 'vmp-dialog-wrap-op': !showDefault }" v-show="visible">
    <div class="vmp-popup-dialog" :style="{ width }">
      <template v-if="showDefault">
        <div class="header" v-if="headerShow" :style="{ background: headerBackgroundColor }">
          <span class="returnPage" @click="onReturn" v-if="isReturn">
            <i class="vh-iconfont vh-line-arrow-left"></i>
          </span>
          <h3>{{ title }}</h3>
          <span class="close" @click="onClose" v-if="isClose">
            <i class="vh-iconfont vh-line-close"></i>
          </span>
        </div>
      </template>
      <template v-else>
        <span class="close new-close" @click="onClose">
          <i class="vh-iconfont vh-line-close"></i>
        </span>
      </template>
      <slot></slot>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'popup',
    props: {
      headerShow: {
        type: Boolean,
        default: function () {
          return true;
        }
      },
      isReturn: {
        required: false
      },
      isClose: {
        required: false,
        default: true
      },
      visible: {
        required: true
      },
      width: {
        required: false
      },
      title: {
        required: false
      },
      headerBackgroundColor: {
        required: false,
        default: 'white'
      },
      showDefault: {
        require: false,
        default: true
      }
    },
    methods: {
      onCancel() {
        this.$emit('onClose');
      },
      onReturn() {
        this.$emit('onReturn');
      },
      onClose() {
        this.$emit('onClose');
      }
    }
  };
</script>
<style lang="less" scoped>
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
    .vmp-popup-dialog {
      font-family: @fontRegular;
      position: relative;
      border-radius: 6px !important;
      display: flex;
      max-height: 80%;
      justify-content: flex-start;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;

      .returnPage {
        display: inline-block;
        padding-right: 5px;
        cursor: pointer;
      }
      .iconzuofanye {
        font-size: 14px;
        color: #666;
      }
      & > .header {
        width: 100%;
        margin-bottom: 0;
        text-align: left;
        padding: 0 32px;
        h3 {
          // height: 40px;
          padding-top: 20px;
          padding-bottom: 24px;
          line-height: 24px;
          font-weight: 500;
          display: inline-block;
          font-size: 20px;
          color: #1a1a1a;
          vertical-align: middle;
        }
        .close {
          margin-right: 11px;
          margin-top: 11px;
          cursor: pointer;
          width: 20px;
          height: 20px;
          opacity: 0.8;
          position: absolute;
          right: 24px;
          top: 10px;
          color: #1a1a1a;
          & > i {
            font-size: 10px;
            float: right;
            line-height: 20px;
          }
        }
      }
      & > .new-close {
        position: absolute;
        right: 35px;
        top: 23px;
        & > i {
          cursor: pointer;
          color: #666666;
          font-size: 11px;
        }
      }
    }
    .vmp-dialog-content {
      height: 100%;
      width: 100%;
    }
  }
  .vmp-dialog-wrap-op {
    background-color: rgba(0, 0, 0, 0.6);
  }
</style>
