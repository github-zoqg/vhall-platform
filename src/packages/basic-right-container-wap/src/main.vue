<template>
  <component :cuid="cuid" :event-smelled="true" :is="layout"></component>
</template>

<script>
  import defaultLayout from './layouts/default-layout/main.vue';
  import fullscreenLayout from './layouts/fullscreen-layout/main.vue';

  export default {
    name: 'VmpContainerRightWap',

    components: {
      defaultLayout,
      fullscreenLayout
    },

    data() {
      return {
        layout: 'defaultLayout' // 默认传统风格
      };
    },

    created() {
      this.initComponent();
    },

    methods: {
      initComponent() {
        // 竖屏直播
        if (this.$domainStore.state.roomBaseServer.watchInitData.webinar_show_type == 0) {
          this.layout = 'fullscreenLayout';
        }
      }
    }
  };
</script>
