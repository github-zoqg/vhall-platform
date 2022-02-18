<template>
  <section class="vmp-tab-menu">
    <!-- prev-btn -->
    <span
      class="vmp-tab-menu-page-btn prev-btn"
      :class="{ disabledClick: selectedIndex === 0 }"
      @click="prev"
    >
      <i class="iconfont iconzuofanye" />
    </span>

    <!-- item -->
    <ul class="vmp-tab-menu-scroll-container" ref="menu">
      <li
        v-for="item of menu"
        :ref="`${item.comp}_${item.key}`"
        class="vmp-tab-menu-item"
        :class="{ 'vmp-tab-menu-item__active': selectedId === `${item.cuid}_${item.contentId}` }"
        :key="`${item.cuid}_${item.contentId}`"
        @click="select(item.cuid, item.contentId)"
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
      <i class="iconfont iconyoufanye" />
    </span>
  </section>
</template>

<script>
  import { getItemEntity } from './js/getItemEntity';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';

  // TODO: tips

  export default {
    name: 'VmpTabMenu',
    data() {
      return {
        direciton: 'row', // row(横)，column(纵)
        selectedId: '',
        menu: [
          { cuid: 'comChat', contentId: 'chat', text: '聊天', showIcon: false },
          { cuid: 'comMemberList', contentId: 'member', text: '成员', showIcon: false },
          { cuid: 'comNotice', contentId: 'notice', text: '公告', showIcon: false },
          { cuid: 'comCustomMenu', contentId: 32245, text: 'test1', showIcon: false },
          { cuid: 'comCustomMenu', contentId: 32246, text: 'test2', showIcon: false }
        ]
      };
    },
    computed: {
      selectedIndex() {
        return this.menu.findIndex(item => `${item.comp}_${item.key}` === this.selectedId);
      }
    },
    async mounted() {
      await this.$nextTick(0);
      this.selectDefault();
    },
    methods: {
      /**
       * 选中默认的菜单项（第一项）
       */
      selectDefault() {
        if (this.menu.length > 0) {
          const { cuid, contentId } = this.menu[0];
          this.select(cuid, contentId);
        }
      },
      /**
       * 选中当前项左边一项
       */
      prev() {
        if (this.selectedIndex === 0) return;
        const index = this.selectedIndex - 1;
        const item = this.menu[index];
        this.select(item.cuid, item.contentId);
      },
      /**
       * 选中当前想右边一项
       */
      next() {
        if (this.selectedIndex >= this.menu.length - 1) return;
        const index = this.selectedIndex + 1;
        const item = this.menu[index];
        this.select(item.cuid, item.contentId);
      },

      /**
       * 通过index删除tab-item
       * @param {Number} index
       */
      removeItemByIndex(index) {
        this.menu.splice(index);
      },

      addItem(item) {
        item = getItemEntity(item);

        this.menu.push(item);
      },

      addItemByIndex(index, item) {
        item = getItemEntity(item);

        this.menu.splice(index, 0, item);
      },

      /**
       * 获取某个菜单项（根据cuid和menuId获取某个菜单项）
       * @param {String} cuid
       * @param {String|Number} menuId
       */
      getItem(cuid, menuId) {
        return this.menu.find(item => {
          const precise = item.cuid === cuid && item.cotentId === menuId;
          const fuzzy = item.cuid === cuid;
          return precise || fuzzy;
        });
      },

      /**
       *
       * @param {String} cuid
       * @param {String|Number} menuId
       */
      scrollToItem(cuid, menuId = '') {
        // 由于menu列表随时会增减，
        const itemsWithPosition = this.menu.map(item => {
          const key = `${item.cuid}_${item.contentId}`;
          const ref = this.$refs[key][0];
          const paddingLeft = parseFloat(window.getComputedStyle(ref).paddingLeft);
          const left = ref.offsetLeft - paddingLeft;
          return { key, ref, left };
        });

        const positionItem = itemsWithPosition.find(item => item.key === `${cuid}_${menuId}`);

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
      select(cuid, menuId = '') {
        this.selectedId = `${cuid}_${menuId}`;
        let payload = null;
        if (cuid === 'comCustomMenu') {
          payload = {
            method: 'queryDetail',
            arg: [menuId]
          };
        }

        this.scrollToItem(cuid, menuId);

        // 切换container内容
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'handleSelect', [cuid, menuId, payload])
        );
      }
    }
  };
</script>

<style lang="less">
  .vmp-tab-menu {
    font-size: 14px;
    border-bottom: 1px solid #1a1a1a;
    display: flex;

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
</style>
