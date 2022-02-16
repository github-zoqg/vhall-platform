<template>
  <section class="vmp-tab-container">
    <main>
      <!-- 默认区域 -->
      <vmp-air-container :cuid="cuid" />
    </main>
  </section>
</template>

<script>
  // 相较于 tab-container，wap版多滑窗特性和subMenu特性
  export default {
    name: 'VmpTabContainerWap',
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

        console.log('switch it!', child, cuid, payload);

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

    & > main {
      height: 1px;
      flex: 1 1 auto;
    }
  }
</style>
