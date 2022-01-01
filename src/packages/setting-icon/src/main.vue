<template>
  <span :id="cuid" :ref="cuid" :title="$t(title)" :class="icon"></span>
</template>
<script>
  // import { contextServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpSettingIcon',
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
<style lang="less"></style>
