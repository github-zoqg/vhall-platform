<template>
  <div class="header-right_control">
    <div class="header-right_control_icon"></div>
    <div class="header-right_control_wrap">
      <div class="header-right_control_wrap-head">
        <div class="header-right_control_wrap-head-left">
          <span class="header-right_control_wrap-head-left-role">主持人</span>
          <span class="header-right_control_wrap-head-left-name">
            春有百花秋有月 夏有凉风冬有雪，若无闲事挂心头便是人间好时节
          </span>
        </div>
        <div class="header-right_control_wrap-head-right" v-if="isShowQuit">退出</div>
      </div>
      <div class="header-right_control_wrap-container">
        <div class="header-right_control_wrap-container-setting">
          <i class="iconfont iconmeitishezhi"></i>
          <p>媒体设置</p>
        </div>
        <div
          class="header-right_control_wrap-container-setting header-right_control_wrap-container-disabled"
          v-if="isShowSplitScreen"
        >
          <i class="iconfont iconfenpingmoshi"></i>
          <p>分屏模式</p>
        </div>
        <!-- <div class="header-right_control_wrap-container-setting">
          <i class="iconfont iconjiaosetuichu"></i>
          <p>角色退出</p>
        </div> -->
        <div class="header-right_control_wrap-container-setting">
          <i class="iconfont iconxuniguanzhong"></i>
          <p>虚拟人数</p>
        </div>
      </div>
      <div class="header-right_control_wrap-bottom" v-if="isShowSupport">微吼知客提供技术支持</div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpHeaderControl',
    props: {
      isShowQuit: {
        default: false,
        type: Boolean
      },
      isShowSupport: {
        default: false,
        type: Boolean
      },
      isShowSplitScreen: {
        default: false,
        type: Boolean
      }
    }
  };
</script>
<style lang="less">
  .header-right_control {
    // position: relative;
    &_icon {
      border-radius: 50%;
      width: 28px;
      height: 28px;
      line-height: 28px;
      text-align: center;
      color: @font-dark-low;
      font-size: 20px;
      cursor: pointer;
      border-radius: 50%;
      background: url('../images/my-dark@2x.png') no-repeat;
      background-size: 100% 100%;
      // background-color: hsla(0, 0%, 88.6%, 0.15);
    }
    &:hover {
      .header-right_control_wrap {
        display: block;
      }
    }
    &_wrap {
      display: none;
      position: absolute;
      top: 45px;
      right: 10px;
      z-index: 10;
      width: 260px;
      border-radius: 4px;
      overflow: hidden;
      background-color: @bg-light-normal;
      font-size: 14px;
      cursor: auto;
      &-head {
        height: 50px;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: @bg-error-light;
        border: 4px 4px 0 0;
        &-left {
          &-role {
            padding: 3px 8px;
            font-size: 12px;
            border: 1px solid @border-host-color;
            border-radius: 50px;
            text-align: center;
            color: @font-error-low;
          }
          &-name {
            width: 110px;
            color: @font-error-low;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: left;
            margin-left: 7px;
            vertical-align: bottom;
          }
        }
        &-right {
          color: @font-error-low;
          cursor: pointer;
          font-size: 14px;
        }
      }
      &-container {
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 18px 20px;
        &-setting {
          font-size: 12px;
          color: @font-hover-low;
          cursor: pointer;
          box-sizing: border-box;
          text-align: center;
          i {
            display: inline-block;
            width: 34px;
            height: 34px;
            font-size: 19px;
            color: @font-dark-second;
            line-height: 34px;
            border: 1px solid @font-dark-second;
            border-radius: 50%;
          }
          .iconfenpingmoshi {
            font-size: 16px;
          }
          p {
            line-height: 36px;
          }
          &:hover {
            i {
              border: 1px solid @border-light-color;
              color: @font-error-low;
              background-color: @bg-error-light;
            }
            p {
              color: @font-error;
            }
          }
        }
        &-disabled {
          cursor: default;
          color: @font-disabled-normal;
          pointer-events: none;
          i {
            border: 1px solid @border-normal-color;
            color: @border-normal-color;
            background-color: bg-light-normal;
          }
        }
      }
      &-bottom {
        text-align: center;
        height: 32px;
        line-height: 32px;
        background-color: @bg-lighter-normal;
        font-size: 12px;
        border-bottom-right-radius: 4px;
        border-bottom-left-radius: 4px;
      }
    }
  }
</style>
