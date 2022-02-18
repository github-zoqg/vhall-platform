<template>
  <section class="vmp-tab-menu">
    <header class="vmp-tab-menu__header">
      <!-- prev-btn -->
      <span
        class="vmp-tab-menu-page-btn prev-btn"
        :class="{ disabledClick: selectedIndex === 0 }"
        @click="prev"
      >
        <i class="vh-iconfont vh-line-arrow-left" />
      </span>

      <!-- item -->
      <ul class="vmp-tab-menu-scroll-container" ref="menu">
        <li
          v-for="item of visibleMenu"
          :ref="item.id"
          :key="item.id"
          class="vmp-tab-menu-item"
          :class="{ 'vmp-tab-menu-item__active': selectedId === item.id }"
          @click="select({ type: item.type, id: item.id })"
        >
          <span class="item-text">{{ $t(item.text) }}</span>
          <hr class="bottom-line" />
        </li>
      </ul>

      <!-- next btn -->
      <span
        class="vmp-tab-menu-page-btn next-btn"
        :class="{ disabledClick: selectedIndex === menu.length - 1 }"
        @click="next"
      >
        <i class="vh-iconfont vh-line-arrow-right" />
      </span>
    </header>

    <main class="vmp-tab-menu__main">
      <tab-content ref="tabContent" :menu="menu" />
    </main>
  </section>
</template>

<script>
  import { getItemEntity } from './js/getItemEntity';
  import TabContent from './components/tab-content.vue';

  // TODO: tips

  export default {
    name: 'VmpTabMenu',
    components: {
      TabContent
    },
    data() {
      return {
        direciton: 'row', // row(横)，column(纵)
        selectedId: '',
        menu: []
      };
    },
    computed: {
      selectedIndex() {
        return this.visibleMenu.findIndex(item => item.id === this.selectedId);
      },
      visibleMenu() {
        return this.menu.filter(item => item.visible);
      }
    },
    created() {
      this.initConfig();
      this.initMenu();
    },
    async mounted() {
      await this.$nextTick(0);
      this.selectDefault();
    },
    methods: {
      /**
       * 初始化配置
       */
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.tabOptions = widget.options;
        }
      },
      /**
       * 拉取接口，初始化菜单项
       */
      initMenu() {
        // 从接口拉取的配置
        const list = this.$domainStore.state.roomBaseServer.customMenu.list;

        for (const item of list) {
          this.addItem(item);
        }
      },
      /**
       * 选中默认的菜单项（第一项）
       */
      selectDefault() {
        if (this.visibleMenu.length > 0) {
          const { type, id } = this.visibleMenu[0];
          this.select({ type, id });
        }
      },
      /**
       * 选中当前项左边一项
       */
      prev() {
        if (this.selectedIndex === 0) return;
        const index = this.selectedIndex - 1;
        const item = this.visibleMenu[index];
        const { type, id } = item;
        this.select({ type, id });
      },
      /**
       * 选中当前想右边一项
       */
      next() {
        if (this.selectedIndex >= this.visibleMenu.length - 1) return;
        const index = this.selectedIndex + 1;
        const item = this.visibleMenu[index];
        const { type, id } = item;
        this.select({ type, id });
      },

      /**
       * 通过index删除tab-item
       * @param {Number} index
       */
      removeItemByIndex(index) {
        this.menu.splice(index);
      },

      addItem(item) {
        item = getItemEntity(item, this.tabOptions.menuConfig);
        if (item === false) return;
        this.menu.push(item);
      },

      addItemByIndex(index, item) {
        item = getItemEntity(item, this.tabOptions.menuConfig);
        if (item === false) return;
        this.menu.splice(index, 0, item);
      },

      /**
       * 获取某个菜单项（根据cuid和menuId获取某个菜单项）
       * @param {String} type tab的type
       * @param {String|Number} menuId [非必传] 菜单id，由后端返得
       * @example getItem(2,'10468')
       */
      getItem({ type, id }) {
        return this.menu.find(item => {
          if (id !== undefined) {
            return item.id === id;
          } else {
            return item.type === type;
          }
        });
      },

      /**
       *
       * @param {String} cuid
       * @param {String|Number} menuId
       */
      scrollToItem({ id }) {
        // 由于menu列表随时会增减，
        const itemsWithPosition = this.visibleMenu.map(item => {
          const id = item.id;
          const ref = this.$refs[id][0];
          const paddingLeft = parseFloat(window.getComputedStyle(ref).paddingLeft);
          const left = ref.offsetLeft - paddingLeft;
          return { id, ref, left };
        });

        const positionItem = itemsWithPosition.find(item => item.id === id);

        this.$refs['menu'].scrollTo({
          left: positionItem.left,
          behavior: 'smooth'
        });
      },

      /**
       * 选中一个菜单项，并显示对应内容
       * @param {String} cuid cuid
       * @param {String|Number} menuId 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容(customMenu必传)
       * @example select('comCustomMenuWap','10246')
       */
      select({ type, id }) {
        this.selectedType = type;
        this.selectedId = id;

        this.scrollToItem({ id });

        const item = this.getItem({ type, id });
        item.tipsVisible = false;
        this.$refs['tabContent'].switchTo(item);
      }
    }
  };
</script>

<style lang="less">
  .vmp-tab-menu {
    height: 100%;
    font-size: 14px;
    display: flex;
    flex-direction: column;

    &__header {
      flex: 0 0 auto;
      border-bottom: 1px solid #1a1a1a;
      display: flex;
      height: 46px;

      .vmp-tab-menu-page-btn {
        position: relative;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        height: 100%;
        text-align: center;
        font-size: 14px;
        color: #fff;
        height: 100%;
        cursor: pointer;

        &.disabledClick:hover {
          cursor: auto;
          i {
            color: @font-light-low;
          }
        }

        &:hover {
          color: #e6e6e6;
        }
      }

      .vmp-tab-menu-scroll-container {
        height: 45px;
        flex: 1 1 auto;
        overflow-y: scroll;
        display: flex;
        flex-wrap: nowrap;
        overflow: hidden;
        .vmp-tab-menu-item {
          flex: 0 0 auto;
          position: relative;
          display: inline-flex;
          flex-direction: column;
          height: 45px;
          justify-content: center;
          align-items: center;
          padding: 0 20px;
          color: #999;
          cursor: pointer;
          user-select: none;

          .item-text {
            display: flex;
            align-items: center;
          }

          .bottom-line {
            display: none;
            position: absolute;
            border: none;
            border-radius: 2px 2px 0 0;
            bottom: 1px;
            left: 50%;
            width: 34px;
            transform: translateX(-50%);
            height: 3px;
            background-color: #fb3a32;
          }

          &:hover {
            i {
              color: #e6e6e6;
            }
          }

          &__active {
            color: #ccc;

            .item-text {
              position: relative;
            }

            .bottom-line {
              display: block;
            }
          }
        }
      }
    }

    &__main {
      flex: 1 1 auto;
    }
  }
</style>
