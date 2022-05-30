<template>
  <section class="vmp-custom-menu">
    <div v-show="!loading" class="vmp-custom-menu-wrapper">
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

  import { useCustomMenuServer } from 'middle-domain';
  export default {
    name: 'VmpCustomMenuWap',
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
        roomId: '',
        loading: false
      };
    },
    beforeCreate() {
      this.customMenuServer = useCustomMenuServer();
    },
    methods: {
      async queryDetail(id) {
        if (id === undefined || id === null) {
          return;
        }

        this.loading = true;
        await this.$nextTick();

        try {
          const res = await this.customMenuServer.getCustomMenuDetail({
            menu_id: id
          });

          this.loading = false;

          if (res.code === 200 && res.data) {
            this.customTabs = res.data.components.map(menu => {
              menu.componentName = `component-${componentMap[menu.component_id]}`;
              return menu;
            });
          }
        } catch (error) {
          this.loading = false;
        }
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
      padding: 16px 30px 100px 30px;
      overflow: auto;
    }
  }
</style>
