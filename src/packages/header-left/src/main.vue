<template>
  <div class="vmp-header-left">
    <div title="测试直播" class="vhall-room-name">测试直播</div>
    <div class="vhall-room-id-container">
      <div class="vhall-room-id-icon">ID</div>
      <div id="vhall-room-id-copy-val" class="vhall-room-id">846642264</div>
      <div data-clipboard-text="846642264" class="vhall-room-id-copy">
        <i class="iconfont iconfuzhi"></i>
      </div>
    </div>
    <!---->
    <div class="delay-icon">
      <img
        src="//cnstatic01.e.vhall.com/saas-v3/static/common/img/nodelay-icon/v1.0.0/pc/delay-icon_zh-CN.png"
        alt=""
      />
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpHeaderLeft',
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
      }
    }
  };
</script>
