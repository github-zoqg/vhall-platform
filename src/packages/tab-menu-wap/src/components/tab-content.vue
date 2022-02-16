<template>
  <section class="vmp-tab-container">
    <main>
      <!-- 主菜单区域 -->
      <section class="vmp-tab-container-mainarea">
        <vmp-air-container
          v-for="tab of mainMenu"
          :key="tab.cuid"
          :cuid="tab.cuid"
          :oneself="true"
        />
      </section>

      <section class="vmp-tab-container-subarea">
        <vmp-air-container
          v-for="tab of subMenu"
          :key="tab.cuid"
          :cuid="tab.cuid"
          :oneself="true"
        />
      </section>
    </main>
  </section>
</template>

<script>
  export default {
    name: 'VmpTabContainer',
    props: {
      tabCuid: {
        type: String,
        default: ''
      },
      mainMenu: {
        type: Array,
        default: () => []
      },
      subMenu: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        selectedId: '',
        childrenComp: []
      };
    },
    created() {
      this.childrenComp = window.$serverConfig[this.tabCuid].children;
    },
    mounted() {
      for (const child of this.$children) {
        child.$el.style.display = 'none';
      }
    },

    methods: {
      hiddenAll() {
        this.$children.forEach(i => (i.$el.style.display = 'none'));
      },
      getComp(cuid) {
        return this.$children.find(i => i.cuid === cuid);
      },
      switchTo(cuid, id, payload = null) {
        this.hiddenAll();
        const child = this.getComp(cuid, payload);

        if (!child) return;

        // pre-show
        if (cuid === 'comCustomMenu') {
          const { method, arg = [] } = payload;
          child[method] && child[method](...arg);
        }

        // show
        child.$el.style.display = '';
      }
    }
  };
</script>

<style lang="less">
  .vmp-tab-container {
    width: 100%;
    height: calc(100% - 90px);
    display: flex;
    flex-direction: column;

    & > main {
      height: 1px;
      flex: 1 1 auto;
    }
  }
</style>
