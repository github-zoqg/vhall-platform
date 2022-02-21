<template>
  <section class="vmp-tab-container">
    <main>
      <section
        style="height: 100%"
        v-for="tab of menu"
        :key="tab.cuid"
        v-show="curItem.cuid === tab.cuid"
      >
        <vmp-air-container :cuid="tab.cuid" :oneself="true" />
      </section>
    </main>
  </section>
</template>

<script>
  export default {
    name: 'VmpTabContainer',
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

    methods: {
      getComp(cuid) {
        return this.$children.find(i => i.cuid === cuid);
      },
      switchTo(item) {
        const child = this.getComp(item.cuid);
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

    & > main {
      height: 100%;
    }
  }
</style>
