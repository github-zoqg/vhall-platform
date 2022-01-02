<template>
  <div :id="cuid" :ref="cuid" class="user__settingbox hide">
    <div class="setting-header">
      <span class="role">主持人</span>
      <span class="name">微吼</span>
      <!-- <span class="quit">退出</span> -->
    </div>
    <div class="setting-menu">
      <div class="setting-menu-item disabled">
        <span class="setting-menu-icon">
          <i class="iconfont icon-icon-meitishezhi"></i>
        </span>
        <span class="setting-menu-title">媒体设置</span>
      </div>
      <div class="setting-menu-item">
        <span class="setting-menu-icon">
          <i class="iconfont icon-iicon-xuniguanzhong"></i>
        </span>
        <span class="setting-menu-title">虚拟观众</span>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpUserSettingBox',
    data() {
      return {
        className: '',
        selected: false,
        disable: false,
        kind: '',
        icon: '',
        title: '',
        subject: '', // 直播名称
        id: '' // 房间id
      };
    },
    created() {},
    mounted() {
      this.initConfig();
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          // this.icon = widget.options.icon;
          // this.title = widget.options.title;
          Object.assign(this.$data, widget.options);
        }
      }
    }
  };
</script>
<style lang="less">
  .user__settingbox {
    position: fixed;
    top: 54px;
    right: 37px;
    width: 360px;
    min-height: 156px;
    border-radius: 4px;
    box-shadow: 0 0 5px #666;
    background-color: #fff;
    z-index: 2000;
    font-size: 14px;

    .hide {
      display: none;
    }
    .setting-header {
      position: relative;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      background-color: @bg-light-yellow;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      color: #222;
      text-align: left;
      span {
        display: inline-block;
      }
      .role {
        height: 18px;
        line-height: 16px;
        padding: 0 6px;
        border-radius: 12px;
        border: 1px solid #222;
        font-size: 12px;
        vertical-align: middle;
      }
      .name {
        max-width: 180px;
        margin-left: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-all;
        vertical-align: middle;
        user-select: none;
      }
    }
    .setting-menu {
      display: flex;
      margin-top: 10px;
      flex-flow: wrap;
      .setting-menu-item {
        width: 100px;
        text-align: center;
        margin: 10px;
        cursor: pointer;
        &.disabled,
        &.disabled:hover {
          pointer-events: none;
          opacity: 0.6;
          user-select: none;
          cursor: not-allowed;
        }
        .setting-menu-icon {
          display: block;
          width: 48px;
          height: 48px;
          line-height: 48px;
          margin: 0 auto;
          border-radius: 50%;
          background-color: #f5f5f5;
          .iconfont {
            font-size: 20px;
          }
        }
        .setting-menu-title {
          display: block;
          margin-top: 10px;
          line-height: 14px;
          font-size: 12px;
          color: #222;
        }
      }
    }
  }
</style>
