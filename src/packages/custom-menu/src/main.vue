<template>
  <section class="vmp-custom-menu">
    <component
      v-for="(block, index) in customTabs"
      :is="block.componentName"
      :key="index"
      :info="block"
      :room-id="roomId"
    />
  </section>
</template>

<script>
  import ComponentDesimg from './components/component-desimg.vue';
  import ComponentQrcode from './components/component-qrcode.vue';
  import ComponentTitle from './components/component-title.vue';
  import ComponentLine from './components/component-line.vue';
  import ComponentRank from './components/component-rank.vue';
  import ComponentTextlink from './components/component-textlink.vue';
  import ComponentImglink from './components/component-imglink.vue';
  import ComponentLives from './components/component-lives.vue';
  import ComponentProjects from './components/component-projects.vue';
  import componentMap from './js/componentMap';
  import { mock1, mock2, mock3 } from './mock.js';

  export default {
    name: 'VmpCustomMenu',
    components: {
      ComponentDesimg,
      ComponentQrcode,
      ComponentTitle,
      ComponentLine,
      ComponentRank,
      ComponentTextlink,
      ComponentImglink,
      ComponentLives,
      ComponentProjects
    },
    data() {
      return {
        customTabs: [],
        roomId: ''
      };
    },
    created() {
      this.queryDetail();
    },
    methods: {
      queryDetail(id) {
        // 测试数据组
        let mock = mock1;
        if (id === 1) mock = mock1;
        if (id === 2) mock = mock2;
        if (id === 3) mock = mock3;

        // query
        this.customTabs = mock.map(menu => {
          menu.componentName = `component-${componentMap[menu.component_id]}`;
          return menu;
        });

        console.log('customTabs:', this.customTabs);
      }
    }
  };
</script>

<style lang="less"></style>
