<template>
  <section class="vmp-tab-menu">
    <!-- item -->
    <ul class="vmp-tab-menu-scroll-container" ref="menu">
      <li
        v-for="item of menu"
        :ref="`${item.comp}_${item.key}`"
        class="vmp-tab-menu-item"
        :class="{ 'vmp-tab-menu-item__active': selectedId === `${item.comp}_${item.key}` }"
        :key="`${item.comp}_${item.key}`"
        @click="select(item.comp, item.key)"
      >
        <span class="item-text">{{ item.text }}</span>
      </li>
      <li class="vmp-tab-menu-more">
        <i class="vh-iconfont vh-full-more"></i>
      </li>
    </ul>

    <section class="vmp-tab-menu-sub"></section>
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
        menu: [{ comp: 'comIntro', key: 'intro', text: '简介', showIcon: false }]
      };
    },
    computed: {
      selectedIndex() {
        return this.menu.findIndex(item => `${item.comp}_${item.key}` === this.selectedId);
      }
    },
    async mounted() {
      await this.$nextTick(0);
      if (this.menu.length > 0) {
        const { comp, key } = this.menu[0];
        this.select(comp, key);
      }
    },
    methods: {
      prev() {
        if (this.selectedIndex === 0) return;
        const index = this.selectedIndex - 1;
        const item = this.menu[index];
        this.select(item.comp, item.key);
      },
      next() {
        if (this.selectedIndex >= this.menu.length - 1) return;
        const index = this.selectedIndex + 1;
        const item = this.menu[index];
        this.select(item.comp, item.key);
      },

      removeItemByIndex(index) {
        this.menu.splice(index);
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

      toggleIcon(comp, key) {
        const tab = this.getItem(comp, key);
        if (!tab) return;

        tab.showIcon = !tab.showIcon;
      },

      // 滑动到某个item的动画效果
      scrollToItem(comp, key) {
        // 由于menu列表随时会增减，
        const itemsWithPosition = this.menu.map(item => {
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
        if (comp === 'comCustomMenu') {
          payload = {
            method: 'queryDetail',
            arg: [key]
          };
        }

        this.scrollToItem(comp, key);

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
      }
    }
  }
</style>
