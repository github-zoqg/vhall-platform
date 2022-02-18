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
          <span class="item-text">{{ $t(item.text) }}</span>
          <span v-if="item.tipsVisible">tips</span>
        </li>
        <li
          v-if="visibleMenu.length > 3"
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
  import { useMenuServer } from 'middle-domain';
  import { getItemEntity } from './js/getItemEntity';
  import tabContent from './components/tab-content.vue';

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
    beforeCreate() {
      this.menuServer = useMenuServer();
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
        const list = this.$domainStore.state.roomBaseServer.customMenu.list;

        for (const item of list) {
          console.log('initMenu::item:', item);
          this.addItem(item);
        }
      },
      /**
       * 选中默认的菜单项（第一项）
       */
      selectDefault() {
        // 选择默认项
        if (this.visibleMenu.length > 0) {
          const { cuid, contentId } = this.visibleMenu[0];
          this.select(cuid, contentId);
        }
      },
      /**
       * 切换次级菜单的显隐
       */
      toggleSubMenuVisible() {
        this.isSubMenuShow = !this.isSubMenuShow;
      },
      /**
       * 删除某个位置的菜单项
       * @param {*} index
       */
      removeItemByIndex(index) {
        this.menu.splice(index);
      },
      /**
       * 添加一个菜单项
       * @param {*} item
       */
      addItem(item) {
        item = getItemEntity(item);
        console.log('item:::::::', item);
        this.menu.push(item);
      },
      /**
       * 在某个index位点添加菜单项
       * @param {*} index
       * @param {*} item
       */
      addItemByIndex(index, item) {
        item = getItemEntity(item);

        this.menu.splice(index, 0, item);
      },
      /**
       * 获取某个菜单项（根据cuid和menuId获取某个菜单项）
       * @param {String} cuid cuid
       * @param {String|Number} menuId [非必传] 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容
       * @example getItem('comChatWap','10468')
       */
      getItem(cuid, menuId) {
        return this.menu.find(item => {
          const precise = item.cuid === cuid && item.cotentId === menuId;
          const fuzzy = item.cuid === cuid;
          return precise || fuzzy;
        });
      },
      /**
       * 设置菜单项显隐
       * @param {Boolean} visible [true|false] 显隐值
       * @param {String} cuid cuid
       * @param {String|Number} menuId [非必传] 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容
       */
      setVisible(visible, cuid, menuId) {
        const tab = this.getItem(cuid, menuId);
        if (!tab) return;

        tab.visible = visible;
      },
      /**
       * 切换某个菜单tab的可视性
       * @param {*} cuid
       * @param {*} menuId [非必传]
       * @example toggleVisible('comChatWap','')
       */
      toggleVisible(cuid, menuId) {
        const tab = this.getItem(cuid, menuId);
        if (!tab) return;

        tab.visible = !tab.visible;
      },
      /**
       * 设置小红点的显隐
       * @param {Boolean} visible [true|false] 显隐值
       * @param {String} cuid cuid
       * @param {String|Number} menuId 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容
       * @example setTipsVisible(true,'comChatWap','10186')
       */
      setTipsVisible(visible, cuid, menuId) {
        const tab = this.getItem(cuid, menuId);
        if (!tab) return;

        tab.tipsVisible = visible;
      },

      /**
       * 滑动到某个item
       * @param {String} cuid cuid
       * @param {String|Number} menuId 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容
       * @example scrollToItem('comChatWap','10478')
       */
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

      /**
       * 选中一个菜单项，并显示对应内容
       * @param {String} cuid cuid
       * @param {String|Number} menuId 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容(customMenu必传)
       * @example select('comCustomMenuWap','10246')
       */
      select(cuid, menuId = '') {
        this.selectedCuid = cuid;
        this.selectedContentId = menuId;

        let payload = null;

        // wap端逻辑
        this.isSubMenuShow = false;

        const item = this.getItem(cuid, menuId);

        this.$refs['tabContent'].switchTo(item, payload);
        this.menuServer.$emit('tab-switched', { cuid, menuId });
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
