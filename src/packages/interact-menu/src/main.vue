<template>
  <div
    class="vmp-interact-menu"
    :class="[className, disable ? 'disable' : '']"
    :style="{ display: hidden ? 'none' : 'flex' }"
  >
    <div class="vmp-interact-menu-icon">
      <i class="vh-saas-iconfont vh-saas-a-line-Interactivetools"></i>
      <p>互动工具</p>
    </div>
    <div class="vmp-interact-menu-wrap">
      <div class="vmp-interact-menu-list">
        <div class="vmp-interact-menu-list-item" @click="openLottery">
          <i class="vh-saas-iconfont vh-saas-line-label"></i>
          <p>抽奖</p>
        </div>
        <div class="vmp-interact-menu-list-item">
          <i class="vh-saas-iconfont vh-saas-a-line-Signin"></i>
          <p>签到</p>
        </div>
        <div class="vmp-interact-menu-list-item">
          <i class="vh-saas-iconfont vh-saas-color-Question"></i>
          <p>问卷</p>
        </div>
        <div class="vmp-interact-menu-list-item vmp-interact-menu-list-disable">
          <i class="vh-saas-iconfont vh-saas-color-questionnaire"></i>
          <p>问答</p>
        </div>
        <div class="vmp-interact-menu-list-item">
          <i class="vh-saas-iconfont vh-saas-a-color-redpacket"></i>
          <p>红包</p>
        </div>
        <div class="vmp-interact-menu-list-item" @click="openTimer">
          <i class="vh-iconfont vh-line-time"></i>
          <p>计时器</p>
        </div>
        <div class="vmp-interact-menu-list-item">
          <i class="vh-saas-iconfont vh-saas-a-color-Playbackmanagement"></i>
          <p>转播</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpInteractMenu',
    data() {
      return {
        className: '', // 自定义样式
        kind: '', // 类型
        disable: false, // 是否禁用
        hidden: false // 是否隐藏
      };
    },
    methods: {
      // 设置可用状态
      setDisableState(val) {
        this.disable = val;
      },
      // 设置显示隐藏状态
      setHiddenState(val) {
        this.hidden = val;
      },
      // 打开计时器设置弹框
      openTimer() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimerSet'));
      },
      // 打开抽奖弹窗
      openLottery() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenLottery'));
      }
    }
  };
</script>
<style lang="less">
  .vmp-interact-menu {
    position: relative;
    justify-content: center;

    &-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 12px;
      padding: 10px 0px;
      cursor: pointer;
      color: #ececec;
      i {
        user-select: none;
        display: block;
        width: 23px;
        height: 23px;
        margin: 0 auto;
        padding-bottom: 6px;
        font-size: 22px;
      }
      p {
        font-size: 12px;
      }
      &:hover {
        color: #fc5659;
      }
    }

    &.disable {
      i,
      p {
        color: #777777;
      }
    }
    &:hover {
      .vmp-interact-menu-wrap {
        display: block;
      }
    }
    &-wrap {
      display: none;
      position: absolute;
      left: 58px;
      top: 0;
      width: 154px;
      background: #434343;
      z-index: 2;
      border-radius: 4px;
      box-sizing: border-box;
      border: 1px solid #2d2d2d;
      padding: 0 10px 20px 10px;
    }
    &-list {
      display: flex;
      flex-wrap: wrap;
      &-item {
        flex-shrink: 0;
        width: 44px;
        margin-top: 20px;
        font-size: 12px;
        color: #ececec;
        text-align: center;
        cursor: pointer;
        i {
          display: block;
          margin: 0 auto;
          font-size: 16px;
          padding-bottom: 4px;
        }
        &:hover {
          color: #fc5659;
        }
      }
      &-disable {
        i,
        p {
          color: #777777;
        }
      }
    }
  }
</style>
