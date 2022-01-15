<template>
  <a
    href="javascript:;"
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
  export default {
    name: 'VmpIconText',
    data() {
      return {
        className: '',
        kind: '',
        selected: false,
        disable: false,
        icon: '',
        text: ''
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
      // click事件
      handleClick: function () {
        if (this.disable) return false;
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClick'
        });
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
