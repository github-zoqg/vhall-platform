<template>
  <div>
    <component
      v-for="item of widgets"
      :is="item.component"
      :key="item.cuid"
      :cuid="item.cuid"
    ></component>
  </div>
</template>

<script>
  export default {
    name: 'VmpContainer',
    props: {
      cuid: String
    },
    computed: {
      widgets() {
        const rlt = [];
        if (this.cuid) {
          if (
            this.$serverConfig &&
            this.$serverConfig[this.cuid] &&
            this.$serverConfig[this.cuid].children
          ) {
            const list = this.$serverConfig[this.cuid].children;

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
        }
        return rlt;
      }
    }
  };
</script>
