<template>
  <section class="vmp-tab-container">
    <main>
      <vmp-air-container :cuid="cuid" />
    </main>
  </section>
</template>

<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpTabContainer',
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
    height: 100%;
    display: flex;
    flex-direction: column;

    & > header {
      flex: 0 0 auto;
      height: 64px;
    }

    & > main {
      flex: 1 1 auto;
    }
  }
</style>
