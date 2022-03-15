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
      getComp(cuid, arr) {
        // 由于air-container不一定是本组件的直系chilren，需要深入遍历查找
        // const findComp = (cuid, array) => {
        //   if (!array || array.length === 0) return false;
        //   for (const item of array) {
        //     // 只找cuid，以及空cuid下的cuid，一旦找到cuid便不再深入遍历
        //     if (item.cuid && item.cuid === cuid) return item;
        //     if (item.cuid && item.cuid !== cuid) continue;
        //     const comp = findComp(cuid, item.$children);
        //     if (comp) return comp;
        //   }
        //   return false;
        // };

        // return findComp(cuid, arr);

        return this.$children.find(i => i.cuid === cuid);
      },
      async switchTo(item) {
        // 确保动态加载的dom渲染完成
        await this.$nextTick();

        let child = null;
        child = this.getComp(item.cuid, this.$children);

        if (!child) return;
        console.log('item:', item);

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
