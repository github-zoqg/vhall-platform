<template>
  <a
    href="javascript:;"
    v-if="!hidden && (configList[auth] == 1 || auth == true)"
    :id="cuid"
    :ref="cuid"
    class="vmp-icon-text"
    :data-kind="kind"
    :class="[className, selected ? 'selected' : '', disable ? 'disable' : '']"
    @click="handleClick"
  >
    <i :class="icon"></i>
    <span class="text">
      {{ $t(text) }}
    </span>
  </a>
</template>
<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpIconText',
    data() {
      return {
        className: '', // 自定义样式
        icon: '', // 小图标
        text: '', // 文本
        kind: '', // 类型
        auth: '', // 权限控制是否显示
        selected: false, // 是否选中
        disable: false, // 是否禁用
        hidden: false // 是否隐藏
      };
    },
    computed: {
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      }
    },
    watch: {
      // 音频直播隐藏桌面共享icon
      '$domainStore.state.roomBaseServer.watchInitData.webinar.mode': {
        immediate: true,
        handler: function (val) {
          if (val == 1 && this.cuid == 'comShareDesktopMenu') {
            this.setHiddenState(true);
          }
        }
      },
      // 云导播隐藏桌面共享icon
      '$domainStore.state.roomBaseServer.watchInitData.webinar.is_director': {
        immediate: true,
        handler: function (val) {
          if (val == 1 && this.cuid == 'comShareDesktopMenu') {
            this.setHiddenState(true);
          }
        }
      }
    },

    methods: {
      // 设置选中转态
      setSelectedState(val) {
        this.selected = val;
      },
      // 设置可用状态
      setDisableState(val) {
        this.disable = val;
      },
      // 设置显示隐藏状态
      setHiddenState(val) {
        this.hidden = val;
      },
      // 设置文本
      setText(val) {
        this.text = val;
      },
      // click事件
      handleClick: function () {
        if (this.disable) return false;
        // 数据埋点
        this._dataReport();
        // 事件驱动
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'handleClick'));
      },
      // 数据埋点
      _dataReport() {
        switch (this.kind) {
          case 'document': {
            window.vhallReportForProduct?.report(110027);
            break;
          }
          case 'board': {
            window.vhallReportForProduct?.report(110026);
            break;
          }
          case 'videoPolling': {
            window.vhallReportForProduct?.report(110148);
            break;
          }
          case 'share': {
            window.vhallReportForProduct?.report(110115);
          }
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-icon-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    color: #ececec;
    padding: 10px 0px;
    cursor: pointer;

    span.text {
      font-size: 12px;
      user-select: none;
    }
    i {
      user-select: none;
      display: block;
      width: 23px;
      height: 23px;
      margin: 0 auto;
      padding-bottom: 6px;
      font-size: 22px;
    }

    // &:hover {
    //   cursor: pointer;
    // }

    &.selected {
      span.text,
      i {
        color: #fb3a32;
      }
    }

    &.disable {
      cursor: default;
      span.text,
      i {
        color: #777777;
      }
      // &:hover {
      //   cursor: default;
      // }
    }
  }
</style>
