<template>
  <section class="vmp-tab-container">
    <main>
      <section
        style="height: 100%"
        v-for="tab of filterMenu"
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
      },
      auth: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        curItem: {}
      };
    },
    computed: {
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(
          this.$domainStore.state.roomBaseServer.clientType
        );
      },
      filterMenu() {
        let set = [];
        for (const item of this.menu) {
          if (set.every(i => i.cuid !== item.cuid)) {
            set.push(item);
          }
        }

        set = set.filter(item => {
          if (!this.isWatch) {
            if (item.type == 8 && !this.auth.member) return false; // 成员
            if (item.type == 'notice' && !this.auth.notice) return false; // 公告
          } else {
            if (item.type == 7 && !this.auth.chapter) return false; // 章节
          }

          return true;
        });
        return [...set];
      }
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
