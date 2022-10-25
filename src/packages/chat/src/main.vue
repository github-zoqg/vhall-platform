<template>
  <component :cuid="cuid" :event-smelled="true" :is="layout"></component>
</template>

<script>
  import defaultLayout from './layouts/default-layout/main.vue';
  import fashionLayout from './layouts/fashion-layout/main.vue';
  export default {
    name: 'VmpChat',

    components: {
      defaultLayout,
      fashionLayout
    },

    data() {
      return {
        layout: 'defaultLayout' // 默认传统风格聊天
      };
    },

    created() {
      this.initComponent();
    },

    methods: {
      initComponent() {
        const layoutMap = {
          1: 'defaultLayout', // 传统风格
          2: 'fashionLayout' // 简洁风格
        };
        const { skinInfo } = this.$domainStore.state.roomBaseServer;
        this.layout = layoutMap[skinInfo?.skin_json_pc?.chatLayout || 1] || 'defaultLayout';
      }
    }
  };
</script>
