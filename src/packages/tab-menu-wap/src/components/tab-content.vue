<template>
  <section class="vmp-tab-container">
    <!-- 主菜单区域 -->
    <section class="vmp-tab-container-mainarea" ref="mainArea">
      <section v-for="tab of filterMenu" :key="tab.cuid" v-show="curItem.cuid === tab.cuid">
        <vmp-air-container :cuid="tab.cuid" :oneself="true" />
      </section>
    </section>
  </section>
</template>

<script>
  export default {
    name: 'TabContent',
    props: {
      menu: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        curItem: {}
      };
    },
    computed: {
      filterMenu() {
        let set = [];
        for (const item of this.menu) {
          if (set.every(i => i.cuid !== item.cuid)) {
            set.push(item);
          }
        }

        return [...set];
      }
    },
    methods: {
      getComp(cuid) {
        return this.$children.find(i => i.cuid === cuid);
      },
      async switchTo(item) {
        // 确保动态加载的dom渲染完成
        await this.$nextTick();

        let child = null;
        child = this.getComp(item.cuid);

        if (!child) return;

        // pre-show
        if (item.type === 1) {
          child.queryDetail(item.id);
        }

        this.curItem = item;
      }
    }
  };
</script>

<style lang="less">
  .vmp-tab-container {
    width: 100%;
    height: calc(100%);
    display: flex;
    flex-direction: column;
    overflow: auto;

    .vmp-tab-container-mainarea {
      height: 100%;
      position: relative;

      & > section {
        height: 100%;
      }
    }
  }
</style>
