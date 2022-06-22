<template>
  <section class="vmp-tab-container">
    <!-- 主菜单区域 -->
    <section class="vmp-tab-container-mainarea" ref="mainArea">
      <section
        :class="[
          'type-' + tab.type,
          alwaysShowTab.includes(tab.cuid) ? 'vmp-tab-container__h0' : ''
        ]"
        v-for="tab of filterMenu"
        :key="tab.cuid"
        v-show="curItem.cuid === tab.cuid || alwaysShowTab.includes(tab.cuid)"
      >
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
      },
      auth: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        curItem: {},
        alwaysShowTab: []
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
      },
      // wap-body和文档是否切换位置
      isWapBodyDocSwitch() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitch;
      }
    },
    watch: {
      isWapBodyDocSwitch(val) {
        val
          ? this.addAlwaysShowTabContent('comDocWap')
          : this.removeAlwaysShowTabContent('comDocWap');
      }
    },
    methods: {
      // 添加常显的tabContent
      addAlwaysShowTabContent(tabCuid) {
        if (this.alwaysShowTab.includes(tabCuid)) return;
        this.alwaysShowTab.push(tabCuid);
      },
      // 删除常显的tabContent
      removeAlwaysShowTabContent(tabCuid) {
        const index = this.alwaysShowTab.indexOf(tabCuid);
        if (index > -1) {
          this.alwaysShowTab.splice(index, 1);
        }
      },
      getComp(cuid) {
        return this.$children.find(i => i.cuid === cuid);
      },
      async switchTo(item) {
        // 确保动态加载的dom渲染完成
        await this.$nextTick();

        let child = null;
        child = this.getComp(item.cuid);
        console.log(child);
        if (!child) return;

        // pre-show
        if (item.type === 1) {
          child.queryDetail(item.id);
        }
        child.switchToBack && child.switchToBack();
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
    // overflow: auto;

    .vmp-tab-container-mainarea {
      height: 100%;
      position: relative;
      // overflow: auto;
      & > section {
        height: 100%;

        // 文档容器
        &.type-2 {
          background-color: #f2f2f2;
        }
      }
      .vmp-tab-container__h0 {
        height: 0;
      }
    }
  }
</style>
