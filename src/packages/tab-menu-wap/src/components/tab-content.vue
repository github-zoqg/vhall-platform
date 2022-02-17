<template>
  <section class="vmp-tab-container">
    <main>
      <!-- 主菜单区域 -->
      <section class="vmp-tab-container-mainarea">
        <section v-for="tab of mainMenu" :key="tab.cuid" v-show="curItem.cuid === tab.cuid">
          <vmp-air-container :cuid="tab.cuid" :oneself="true" />
        </section>
      </section>

      <!-- 弹窗区域 -->
      <section class="vmp-tab-container-poparea">
        <van-popup
          v-model="isPopupVisible"
          position="bottom"
          closeable
          :lazy-render="false"
          :overlay="false"
          :style="{ height: popHeight + 'px' }"
        >
          <section class="vmp-tab-container-popup__body">
            <header>
              <span>{{ curItem.text }}</span>
              <i class="vh-iconfont vh-line-close" @click="closePopup"></i>
            </header>
            <main>
              <section v-for="tab of subMenu" v-show="curItem.cuid === tab.cuid" :key="tab.cuid">
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
        curItem: {},
        popHeight: 200
      };
    },
    computed: {
      isPopupVisible: {
        get() {
          return Boolean(this.subMenu.find(item => item.cuid === this.curItem.cuid));
        },
        set() {}
      }
    },
    watch: {
      isPopupVisible() {
        this.popHeight = this.getTabContentHeight();
      }
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
      getComp(cuid) {
        // 由于air-container不一定是本组件的直系chilren，需要深入遍历查找
        const findComp = (cuid, array) => {
          if (!array || array.length === 0) return false;
          for (const item of array) {
            // 只找cuid和空cuid下的cuid，一旦找到cuid便不再深入遍历
            if (item.cuid && item.cuid === cuid) return item;
            if (item.cuid && item.cuid !== cuid) continue;
            const comp = findComp(cuid, item.$children);
            if (comp) return comp;
          }
          return false;
        };

        return findComp(cuid, this.$children);
      },
      switchTo(item, payload = null) {
        const child = this.getComp(item.cuid);
        if (!child) return;

        // pre-show
        if (item.cuid === 'comCustomMenu') {
          const { method, arg = [] } = payload;
          child[method] && child[method](...arg);
        }

        this.curItem = item;
      },
      closePopup() {
        this.isPopupVisible = false;
        this.curItem = {};
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
    overflow: scroll;

    & > main {
      flex: 1 1 auto;
      position: relative;

      .vmp-tab-container-mainarea {
        position: relative;
      }

      .vmp-tab-container-poparea {
        position: relative;
      }
    }

    .vmp-tab-container-popup__body {
      & > header {
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
    }
  }
</style>
