<template>
  <div class="vmp-interact-menu">
    <div :class="['vmp-interact-menu-icon', living ? 'vmp-interact-menu-disable' : '']">
      <i class="iconfont iconhudonggongju"></i>
      <p>互动工具</p>
    </div>
    <div class="vmp-interact-menu-wrap">
      <div class="vmp-interact-menu-list">
        <div class="vmp-interact-menu-list-item">
          <i class="iconfont iconchoujiang"></i>
          <p>抽奖</p>
        </div>
        <div class="vmp-interact-menu-list-item">
          <i class="iconfont iconqiandao"></i>
          <p>签到</p>
        </div>
        <div class="vmp-interact-menu-list-item">
          <i class="iconfont iconhudonggongju"></i>
          <p>问卷</p>
        </div>
        <div class="vmp-interact-menu-list-item vmp-interact-menu-list-disable">
          <i class="iconfont iconwenda"></i>
          <p>问答</p>
        </div>
        <div class="vmp-interact-menu-list-item">
          <i class="iconfont iconhongbao"></i>
          <p>红包</p>
        </div>
        <div class="vmp-interact-menu-list-item" @click="openTimer">
          <i class="iconfont iconjishiqi"></i>
          <p>计时器</p>
        </div>
        <div class="vmp-interact-menu-list-item">
          <i class="iconfont iconzhuanbo"></i>
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
        living: false
      };
    },
    methods: {
      // 打开计时器设置弹框
      openTimer() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimerSet'));
      }
    }
  };
</script>
<style lang="less">
  .vmp-interact-menu {
    position: relative;
    &-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 12px;
      color: #ececec;
      padding: 10px 0px;
      cursor: pointer;
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
    }
    &-disable {
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
