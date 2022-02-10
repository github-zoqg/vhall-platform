<template>
  <section class="vmp-custom-menu">
    <div class="vmp-custom-menu-wrapper">
      <component
        v-for="(block, index) in customTabs"
        :is="block.componentName"
        :key="index"
        :info="block"
        :room-id="roomId"
      />
    </div>
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
  import ComponentPromote from './components/component-promote.vue';
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
      ComponentProjects,
      ComponentPromote
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
      queryDetail(id = 3) {
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

<style lang="less">
  .vmp-custom-menu {
    height: 100%;
    width: 100%;

    &-wrapper {
      height: 100%;
      width: 100%;
      overflow-y: scroll;
    }
  }
</style>
