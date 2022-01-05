<template>
  <div class="vmp-icon-item" :class="className" :title="$t(title)" v-if="show" @click="handleClick">
    <i :class="icon"></i>
  </div>
</template>
<script>
  export default {
    name: 'VmpIconItem',
    data() {
      return {
        icon: '',
        title: '',
        show: true
      };
    },
    mounted() {
      this.initConfig();
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('className')) {
            this.className = widget.options.className;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('title')) {
            this.title = widget.options.title;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('icon')) {
            this.icon = widget.options.icon;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('show')) {
            this.show = widget.options.show;
          }
        }
      },
      // click事件
      handleClick: function () {
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
