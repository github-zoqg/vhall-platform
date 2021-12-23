<template>
  <div
    :id="cuid"
    :ref="cuid"
    class="vmp-icon-text"
    :class="className"
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
    props: {
      cuid: String
    },
    data() {
      return {
        className: '',
        options: {
          kind: '',
          icon: '',
          text: ''
        }
      };
    },
    created() {
      // 注册到服务池
      this.$serverPool.set(this.cuid, this);
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
      emitSelected() {
        alert(this.cuid);
      },
      handleClick: function (event) {
        // console.log('args', args);
        const api = this.$serverConfig[this.cuid].emitapis;
        if (api && api.emitClick) {
          // EventSDk.send(api.emitClick);
          console.log(api.emitClick);
        }
      },
      dubleClick: function () {
        //
      }
    }
  };
</script>
