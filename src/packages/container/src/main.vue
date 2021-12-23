<template>
  <div :class="[className]">
    <component
      v-for="item of widgets"
      :is="item.component"
      :key="item.cuid"
      :cuid="item.cuid"
    ></component>
  </div>
</template>

<script>
  // 通用容器组件
  export default {
    name: 'VmpContainer',
    props: {
      cuid: String
    },
    computed: {
      className() {
        return (
          this.cuid &&
          this.$serverConfig &&
          this.$serverConfig[this.cuid] &&
          this.$serverConfig[this.cuid].options &&
          this.$serverConfig[this.cuid].options.className
        );
      },
      widgets() {
        const rlt = [];
        if (this.cuid && this.$serverConfig && this.$serverConfig[this.cuid]) {
          const list = this.$serverConfig[this.cuid].children || [];
          for (const cuid of list) {
            const widget = this.$serverConfig[cuid];
            if (widget && widget.component) {
              rlt.push({
                cuid,
                component: widget.component
              });
            }
          }
        }
        return rlt;
      }
    }
  };
</script>
