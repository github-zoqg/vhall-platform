<template>
  <a
    href="javascript:;"
    :id="cuid"
    :ref="cuid"
    class="vmp-icon-text"
    :data-kind="kind"
    :class="[className, selected ? 'selected' : '', disable ? 'disable' : '']"
    :style="{ display: hidden ? 'none' : 'flex' }"
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
        className: '',
        icon: '',
        text: '',
        kind: '',
        selected: false,
        disable: false,
        hidden: false
      };
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
      // click事件
      handleClick: function () {
        if (this.disable) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'handleClick'));
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

    &:hover {
      cursor: pointer;
    }

    &.selected {
      span.text,
      i {
        color: #fc5659;
      }
    }

    &.disable {
      span.text,
      i {
        color: #777777;
      }
    }
  }
</style>
