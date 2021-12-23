<template>
  <div
    :id="cuid"
    :ref="cuid"
    class="vmp-icon-text"
    :class="[className, selected ? 'selected' : '', disable ? 'disable' : '']"
    @click="handleClick"
  >
    <i :class="icon" style="font-size: 28px"></i>
    <span class="text">
      {{ text.startsWith('i18n') ? $t(text) : text }}
    </span>
  </div>
</template>
<script>
  export default {
    name: 'VmpIconText',
    data() {
      return {
        className: '',
        selected: false,
        disable: false,
        kind: '',
        icon: '',
        text: ''
      };
    },
    mounted() {
      this.initConfig();
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = this.$serverConfig && this.$serverConfig[this.cuid];
        if (widget && widget.options) {
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('className')) {
            this.className = widget.options.className;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('selected')) {
            this.selected = widget.options.selected;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('disable')) {
            this.disable = widget.options.disable;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('icon')) {
            this.icon = widget.options.icon;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('text')) {
            this.text = widget.options.text;
          }
        }
      },
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
        // EventQueue.add(`${this.cuid}:emitClick`);
      }
    }
  };
</script>
