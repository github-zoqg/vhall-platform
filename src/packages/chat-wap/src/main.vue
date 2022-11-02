<template>
  <component :cuid="cuid" :event-smelled="true" :is="layout"></component>
</template>

<script>
  import defaultLayout from './layouts/default-layout/main.vue';
  import fashionLayout from './layouts/fashion-layout/main.vue';
  import conciseLayout from './layouts/concise-layout/main.vue';

  export default {
    name: 'VmpChatWap',

    components: {
      defaultLayout,
      fashionLayout,
      conciseLayout
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
        // 竖屏直播
        const isPortraitLive =
          this.$domainStore.state.roomBaseServer.watchInitData.webinar_show_type == 0;
        if (isPortraitLive) {
          this.layout = 'conciseLayout';
          return;
        }
        const layoutMap = {
          1: 'defaultLayout', // 传统风格
          2: 'fashionLayout', // 时尚风格
          3: 'conciseLayout' // 简洁风格
        };
        const { skinInfo } = this.$domainStore.state.roomBaseServer;
        this.layout = layoutMap[skinInfo?.skin_json_wap?.style || 1] || 'defaultLayout';
      }
    }
  };
</script>
