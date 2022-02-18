<template>
  <section class="vmp-tab-menu">
    <section class="vmp-tab-menu__header">
      <!-- 菜单区域 -->
      <ul class="vmp-tab-menu-scroll-container" ref="menu">
        <li
          v-for="item of mainMenu"
          :ref="`${item.cuid}_${item.key}`"
          class="vmp-tab-menu-item"
          :class="{ 'vmp-tab-menu-item__active': selectedId === `${item.cuid}_${item.contentId}` }"
          :key="`${item.cuid}_${item.contentId}`"
          @click="select(item.cuid, item.contentId)"
        >
          <span class="item-text">{{ item.text }}</span>
        </li>
        <li
          v-if="menu.length > 3"
          class="vmp-tab-menu-more"
          :class="{ selected: isSubMenuShow }"
          @click="toggleSubMenuVisible"
        >
          <i class="vh-iconfont vh-full-more"></i>
        </li>
      </ul>

      <!-- 次级菜单 -->
      <ul v-if="isSubMenuShow" class="vmp-tab-menu-sub">
        <li
          class="vmp-tab-menu-sub__item"
          v-for="item of subMenu"
          :key="`${item.cuid}_${item.contentId}`"
          @click="select(item.cuid, item.contentId)"
        >
          {{ item.text }}
        </li>
      </ul>
    </section>

    <!-- 正文区域 -->
    <section class="vmp-tab-menu__main">
      <tab-content
        :tab-cuid="cuid"
        :mainMenu="mainMenu"
        :subMenu="subMenu"
        @closePopup="selectDefault"
        ref="tabContent"
      ></tab-content>
    </section>
  </section>
</template>

<script>
  import { getItemEntity } from './js/getItemEntity';
  import tabContent from './components/tab-content.vue';

  // TODO: tips

  export default {
    name: 'VmpTabMenuWap',
    components: { tabContent },
    data() {
      return {
        direciton: 'row', // row(横)，column(纵)
        selectedCuid: '',
        selectedContentId: '', //存在相同cuid，但不同内容的情形
        menu: [],
        isSubMenuShow: false,
        tabOptions: {}
      };
    },
    computed: {
      selectedId() {
        return `${this.selectedCuid}_${this.selectedContentId}`;
      },
      visibleMenu() {
        return this.menu.filter(item => item.visible);
      },
      mainMenu() {
        return this.visibleMenu.filter((item, index) => index < 3);
      },
      subMenu() {
        if (this.visibleMenu.length <= 3) return [];
        return this.visibleMenu.filter((item, index) => index >= 3);
      },
      selectedIndex() {
        return this.visibleMenu.findIndex(
          item => `${item.cuid}_${item.contentId}` === this.selectedId
        );
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
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.tabOptions = widget.options;
        }
      },
      // 初始化菜单选项
      initMenu() {
        const list = this.$domainStore.state.roomBaseServer.customMenu.list;

        for (const item of list) {
          this.addItem(item);
        }
      },
      selectDefault() {
        // 选择默认项
        if (this.visibleMenu.length > 0) {
          const { cuid, contentId } = this.visibleMenu[0];
          this.select(cuid, contentId);
        }
      },

      toggleSubMenuVisible() {
        this.isSubMenuShow = !this.isSubMenuShow;
      },

      removeItemByIndex(index) {
        this.menu.splice(index);
      },

      hasItem(item) {
        item = this.getItem(item);

        return this.menu.some(menuItem => {
          const sameComp = item.cuid === menuItem.cuid;
          const sameContentId = item.contentId === menuItem.contentId;
          return sameComp && sameContentId;
        });
      },

      addItem(item) {
        // if (this.hasItem(item)) {
        //   throw Error('不能传入已经存在的item');
        // }
        console.log('item::::', item);

        item = getItemEntity(item);
        this.menu.push(item);
      },

      addItemByIndex(index, item) {
        // if (this.hasItem(item)) {
        //   throw Error('不能传入cuid和contentId都相同的item');
        // }

        item = getItemEntity(item);

        this.menu.splice(index, 0, item);
      },

      getItem(cuid, contentId) {
        return this.menu.find(item => item.cuid === cuid && item.contentId === contentId);
      },

      setIcon(cuid, contentId) {
        const tab = this.getItem(cuid, contentId);
        if (!tab) return;
        tab.showIcon = true;
      },

      hiddenIcon(cuid, contentId) {
        const tab = this.getItem(cuid, contentId);
        if (!tab) return;

        tab.showIcon = false;
      },

      setVisible(cuid, contentId) {
        const tab = this.getItem(cuid, contentId);
        if (!tab) return;

        tab.visible = true;
      },

      setHidden(comp, key) {
        const tab = this.getItem(comp, key);
        if (!tab) return;

        tab.visible = false;
      },

      // 滑动到某个item的动画效果
      scrollToItem(comp, key) {
        // 由于menu列表随时会增减，
        const itemsWithPosition = this.visibleMenu.map(item => {
          const key = `${item.comp}_${item.key}`;
          const ref = this.$refs[key][0];
          const paddingLeft = parseFloat(window.getComputedStyle(ref).paddingLeft);
          const left = ref.offsetLeft - paddingLeft;
          return { key, ref, left };
        });

        const positionItem = itemsWithPosition.find(item => item.key === `${comp}_${key}`);

        this.$refs['menu'].scrollTo({
          left: positionItem.left,
          behavior: 'smooth'
        });
      },

      select(cuid, contentId = '') {
        this.selectedCuid = cuid;
        this.selectedContentId = contentId;

        let payload = null;

        // wap端逻辑
        this.isSubMenuShow = false;

        const item = this.getItem(cuid, contentId);
        this.$refs['tabContent'].switchTo(item, payload);
      }
    }
  };
</script>

<style lang="less">
  .vmp-tab-menu {
    height: 100%;
    position: relative;
    background: #fff;
    font-size: 32px;
    display: flex;
    flex-direction: column;

    &__header {
      position: relative;
      width: 100%;
      height: 90px;
      flex: 0 0 auto;
      display: flex;
      justify-content: space-around;

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 1px;
        border-bottom: 1px solid #d4d4d4;
      }
    }

    &__main {
      width: 100%;
      flex: 1 1 auto;
      overflow: hidden;
    }

    .vmp-tab-menu-scroll-container {
      height: 100%;
      flex: 1 1 auto;
      overflow-y: scroll;
      display: flex;
      flex-wrap: nowrap;
      overflow: hidden;
      .vmp-tab-menu-item {
        flex: 1 1 auto;
        width: calc((100% - 100px) / 4);
        position: relative;
        display: inline-flex;
        flex-direction: column;
        height: 100%;
        justify-content: center;
        align-items: center;
        padding: 0 20px;
        color: #333333;
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
          color: @font-error;
          font-weight: bolder;

          .item-text {
            position: relative;
            border-bottom: 6px solid @font-error;
          }

          .bottom-line {
            display: block;
          }
        }
      }

      .vmp-tab-menu-more {
        height: 100%;
        width: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;

        &.selected {
          background-color: #f3f3f3;
        }
      }
    }

    .vmp-tab-menu-sub {
      position: relative;
      font-size: 32px;
      position: absolute;
      top: 90px;
      left: 0;
      right: 0;
      z-index: 22; // 危险值
      background-color: #f3f3f3;
      color: #444;
      width: 100%;

      &__item {
        display: flex;
        align-items: center;
        width: 100%;
        height: 88px;
        padding: 0 40px;

        &:not(:last-child) {
          border-bottom: 1px solid #d4d4d4;
        }
      }
    }
  }
</style>
