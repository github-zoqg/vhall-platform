<template>
  <section class="vmp-tab-container">
    <main>
      <vmp-air-container :cuid="tabCuid" />
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
      }
    },
    data() {
      return {
        selectedId: ''
      };
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
