<template>
  <section class="vmp-tab-menu">
    <!-- item -->
    <ul class="vmp-tab-menu-scroll-container" ref="menu">
      <li
        v-for="item of mainMenu"
        :ref="`${item.comp}_${item.key}`"
        class="vmp-tab-menu-item"
        :class="{ 'vmp-tab-menu-item__active': selectedId === `${item.comp}_${item.key}` }"
        :key="`${item.comp}_${item.key}`"
        @click="select(item.comp, item.key)"
      >
        <span class="item-text">{{ item.text }}</span>
      </li>

      <li
        v-if="menu.length > 3"
        class="vmp-tab-menu-more"
        :class="{ isSubMenuShow: 'selected' }"
        @click="toggleSubMenuVisible"
      >
        <i class="vh-iconfont vh-full-more"></i>
      </li>
    </ul>

    <ul v-if="isSubMenuShow" class="vmp-tab-menu-sub">
      <li
        class="vmp-tab-menu-sub__item"
        v-for="item of subMenu"
        :key="`${item.comp}_${item.key}`"
        @click="select(item.comp, item.key)"
      >
        {{ item.text }}
      </li>
    </ul>
  </section>
</template>

<script>
  import { getItemEntity } from './js/getItemEntity';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';

  // TODO: tips

  export default {
    name: 'VmpTabMenuWap',
    data() {
      return {
        direciton: 'row', // row(横)，column(纵)
        selectedId: '',
        menu: [],
        isSubMenuShow: false
      };
    },
    computed: {
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
        return this.visibleMenu.findIndex(item => `${item.comp}_${item.key}` === this.selectedId);
      }
    },
    async mounted() {
      await this.$nextTick(0);

      // 选择默认项
      if (this.visibleMenu.length > 0) {
        const { comp, key } = this.visibleMenu[0];
        this.select(comp, key);
      }
    },
    methods: {
      toggleSubMenuVisible() {
        this.isSubMenuShow = !this.isSubMenuShow;
      },
      prev() {
        if (this.selectedIndex === 0) return;
        const index = this.selectedIndex - 1;
        const item = this.visibleMenu[index];
        this.select(item.comp, item.key);
      },
      next() {
        if (this.selectedIndex >= this.visibleMenu.length - 1) return;
        const index = this.selectedIndex + 1;
        const item = this.visibleMenu[index];
        this.select(item.comp, item.key);
      },

      removeItemByIndex(index) {
        this.visibleMenu.splice(index);
      },

      hasItem(item) {
        return this.menu.some(menuItem => {
          const sameComp = item.comp === menuItem.comp;
          const sameKey = item.key === menuItem.key;
          return sameComp && sameKey;
        });
      },

      addItem(item) {
        if (!item || !item.key || !item.text) {
          throw Error('传入的 tab item 必须有id、text');
        }

        if (this.hasItem(item)) {
          throw Error('不能传入comp和key都相同的item');
        }

        item = getItemEntity(item);

        this.menu.push(item);
      },

      addItemByIndex(index, item) {
        if (!item || !item.key || !item.text) {
          throw Error('传入的 tab item 必须有id、text');
        }

        if (this.hasItem(item)) {
          throw Error('不能传入comp和key都相同的item');
        }

        item = getItemEntity(item);

        this.menu.splice(index, 0, item);
      },

      getItem(comp, key) {
        return this.menu.find(item => item.comp === comp && item.key === key);
      },

      setIcon(comp, key) {
        const tab = this.getItem(comp, key);
        if (!tab) return;
        tab.showIcon = true;
      },

      hiddenIcon(comp, key) {
        const tab = this.getItem(comp, key);
        if (!tab) return;

        tab.showIcon = false;
      },

      setVisible(comp, key) {
        const tab = this.getItem(comp, key);
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

      select(comp, key) {
        this.selectedId = `${comp}_${key}`;
        let payload = null;

        // TODO: 强耦合，需更改
        if (comp === 'comCustomMenu') {
          payload = {
            method: 'queryDetail',
            arg: [key]
          };
        }

        // wap端逻辑
        this.isSubMenuShow = false;

        // this.scrollToItem(comp, key);

        // 切换container内容
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'handleSelect', [comp, key, payload])
        );
      }
    }
  };
</script>

<style lang="less">
  .vmp-tab-menu {
    position: relative;
    background: #fff;
    font-size: 32px;
    display: flex;
    justify-content: space-around;
    height: 90px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 1px;
      border-bottom: 1px solid #d4d4d4;
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
