<template>
  <section class="vmp-tab-container">
    <main>
      <!-- 主菜单区域 -->
      <section class="vmp-tab-container-mainarea" ref="mainArea">
        <section
          v-for="tab of mainMenu"
          :key="tab.cuid"
          v-show="curItem.cuid === tab.cuid && mainMenu.find(item => item.id === curItem.id)"
        >
          <vmp-air-container :cuid="tab.cuid" :oneself="true" />
        </section>
      </section>

      <!-- 弹窗区域 -->
      <section class="vmp-tab-container-poparea">
        <van-popup
          v-model="isPopupVisible"
          position="bottom"
          ref="subArea"
          :lazy-render="false"
          :overlay="false"
          :style="{ height: popHeight + 'px' }"
        >
          <section class="vmp-tab-container-popup__body">
            <header>
              <span>{{ $t(curItem.text) }}</span>
              <i class="vh-iconfont vh-line-close" @click="closePopup"></i>
            </header>
            <main>
              <section
                v-for="tab of filterSubMenu"
                v-show="curItem.cuid === tab.cuid && subMenu.find(item => item.id === curItem.id)"
                :key="tab.cuid"
              >
                <vmp-air-container :cuid="tab.cuid" :oneself="true" />
              </section>
            </main>
          </section>
        </van-popup>
      </section>
    </main>
  </section>
</template>

<script>
  export default {
    name: 'TabContent',
    props: {
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
        curItem: {},
        popHeight: 200
      };
    },
    computed: {
      filterSubMenu() {
        let set = [];
        for (const item of this.subMenu) {
          if (set.every(i => i.cuid !== item.cuid)) {
            set.push(item);
          }
        }

        return [...set];
      },
      isPopupVisible: {
        get() {
          return Boolean(
            this.subMenu.find(item => {
              const sameComp = item.cuid === this.curItem.cuid;
              const sameId = item.id === this.curItem.id;
              return sameComp && sameId;
            })
          );
        },
        set() {}
      }
    },
    watch: {
      isPopupVisible() {
        this.popHeight = this.getTabContentHeight();
      }
    },
    created() {
      window.tabContent = this;
    },
    methods: {
      getTabContentHeight() {
        const dom = document.querySelector('.tab-content');
        if (dom) {
          const rect = dom.getBoundingClientRect();
          return rect.height;
        }
        return 200;
      },
      getComp(cuid, arr) {
        // 由于air-container不一定是本组件的直系chilren，需要深入遍历查找
        const findComp = (cuid, array) => {
          if (!array || array.length === 0) return false;
          for (const item of array) {
            // 只找cuid，以及空cuid下的cuid，一旦找到cuid便不再深入遍历
            if (item.cuid && item.cuid === cuid) return item;
            if (item.cuid && item.cuid !== cuid) continue;
            const comp = findComp(cuid, item.$children);
            if (comp) return comp;
          }
          return false;
        };

        return findComp(cuid, arr);
      },
      switchTo(item) {
        let child = null;

        child = this.getComp(item.cuid, this.$children);

        // hack(TODO: 临时，后面需要改)
        const onSubMenu = this.subMenu.find(i => i.id === item.id);
        const isNotMainComp = ![...this.$refs['subArea'].$el.children].includes(el => el === child);
        if (onSubMenu && isNotMainComp) {
          child = this.getComp(item.cuid, this.$refs['subArea'].$children);
        }

        if (!child) return;

        // pre-show
        if (item.type === 1) {
          child.queryDetail(item.id);
        }

        this.curItem = item;
      },
      closePopup() {
        this.isPopupVisible = false;
        this.curItem = {};
        this.$emit('closePopup');
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
    overflow: scroll;

    & > main {
      flex: 1 1 auto;
      position: relative;

      .vmp-tab-container-mainarea {
        height: 100%;
        position: relative;

        & > section {
          height: 100%;
        }
      }

      .vmp-tab-container-poparea {
        position: relative;
      }
    }

    .vmp-tab-container-popup__body {
      display: flex;
      flex-direction: column;
      height: 100%;

      & > header {
        flex: 0 0 auto;
        position: relative;
        width: 100%;
        height: 90px;
        display: flex;
        color: @border-bormal;
        border-bottom: 1px solid #d4d4d4;

        & > span {
          position: relative;
          width: 100%;
          text-align: center;
          display: inline-flex;
          justify-content: center;
          align-items: center;
        }

        & > i {
          position: absolute;
          right: 33px;
          top: 50%;
          transform: translateY(-50%);
        }
      }

      & > main {
        flex: 1 1 auto;
        overflow: scroll;
      }

      & > main > section {
        height: 100%;
      }
    }
  }
</style>
