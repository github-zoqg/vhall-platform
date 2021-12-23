<template>
  <div
    :id="cuid"
    :ref="cuid"
    class="vmp-icon-text"
    :class="[className, selected ? 'selected' : '', disable ? 'disable' : '']"
    :data-kind="options.kind"
    @click="handleClick"
  >
    <i :class="options.icon" style="font-size: 28px"></i>
    <span class="text">
      {{ options.text.startsWith('i18n') ? $t(options.text) : options.text }}
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
        options: {
          kind: '',
          icon: '',
          text: ''
        }
      };
    },
    mounted() {
      this.initConfig();
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = this.$serverConfig && this.$serverConfig[this.cuid];
        if (!widget) return;
        this.options = widget.options;
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
      handleClick: function (event) {
        if (this.disable) return false;
        // EventQueue.add(`${this.cuid}:emitClick`);
      }
    }
  };
</script>
