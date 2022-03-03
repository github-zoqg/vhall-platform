<template>
  <section class="vmp-tab-menu">
    <header class="vmp-tab-menu__header">
      <!-- prev-btn -->
      <span
        class="vmp-tab-menu-page-btn prev-btn"
        v-if="isToggleBtnVisible"
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
        v-if="isToggleBtnVisible"
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
  import { useMenuServer, useQaServer, useChatServer } from 'middle-domain';

  // TODO: tips

  export default {
    name: 'VmpTabMenu',
    components: {
      TabContent
    },
    data() {
      return {
        isToggleBtnVisible: true, // cfg-options:是否显示左右切换按钮
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
    beforeCreate() {
      this.menuServer = useMenuServer();
    },
    created() {
      // initConfig
      const widget = window.$serverConfig?.[this.cuid];
      if (widget && widget.options) {
        this.tabOptions = widget.options;
      }
      // console.log(this.visibleMenu, '???!231324');
      this.initMenu();
      this.listenEvents();
    },
    async mounted() {
      await this.$nextTick(0);
      this.selectDefault();
    },
    methods: {
      listenEvents() {
        const qaServer = useQaServer();
        const chatServer = useChatServer();
        //收到问答开启消息
        qaServer.$on(qaServer.Events.QA_OPEN, msg => {
          this.setVisible({ visible: true, type: 'v5' });
          chatServer.addChatToList({
            content: {
              text_content: this.$t('chat.chat_1026')
            },
            roleName: msg.data.role_name,
            type: msg.type,
            interactStatus: true
          });
        });
        //收到问答关闭消息
        qaServer.$on(qaServer.Events.QA_CLOSE, msg => {
          this.setVisible({ visible: false, type: 'v5' });
          chatServer.addChatToList({
            content: {
              text_content: this.$t('chat.chat_1081')
            },
            roleName: msg.data.role_name,
            type: msg.type,
            interactStatus: true
          });
        });
        //收到私聊消息
        chatServer.$on('receivePrivateMsg', () => {
          this.setVisible({ visible: true, type: 'private' });
        });
      },
      /**
       * 拉取接口，初始化菜单项
       */
      initMenu() {
        const roomState = this.$domainStore.state.roomBaseServer;
        let list = [];

        // 从接口拉取的配置
        if (roomState.clientType === 'send') {
          list = [...this.menuServer.state.list];
        } else {
          list = [...roomState.customMenu.list];
        }

        for (const item of list) {
          this.addItem(item);
        }
        // TODO: temp，增加私聊
        const chatIndex = this.menu.findIndex(el => el.type === 3);
        if (chatIndex >= -1) {
          this.addItemByIndex(chatIndex + 1, {
            type: 'private',
            name: '私聊', // name只有自定义菜单有用，其他默认不采用而走i18n
            text: '私聊', // 同上
            status: 2
          });
          this.addItemByIndex(chatIndex + 2, {
            type: 'v5',
            name: '问答', // name只有自定义菜单有用，其他默认不采用而走i18n
            text: '问答', // 同上
            status: roomState.interactToolStatus.question_status ? 1 : 2
          });
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

      getItemEntity(item) {
        return getItemEntity(item, this.tabOptions.menuConfig);
      },

      addItem(item) {
        item = this.getItemEntity(item);
        if (item === false) return;
        this.menu.push(item);
      },

      addItemByIndex(index, item) {
        item = this.getItemEntity(item);
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
        this.menuServer.$emit('tab-switched', item);
      },
      /**
       * 设置菜单项显隐
       * @param {Boolean} visible [true|false] 显隐值
       * @param {String} cuid cuid
       * @param {String|Number} id [非必传] 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容
       */
      setVisible({ visible = true, type, id }) {
        const tab = this.getItem({ type, id });
        if (!tab) return;

        tab.visible = visible;
        visible === false && this.jumpToNearestItemById(id);
      },
      /**
       * 切换某个菜单tab的可视性
       * @param {*} cuid
       * @param {*} menuId [非必传]
       * @example toggleVisible('comChatWap','')
       */
      toggleVisible({ type, id }) {
        const tab = this.getItem({ type, id });
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
      setTipsVisible({ visible, type, id }) {
        const tab = this.getItem({ type, id });
        if (!tab) return;

        tab.tipsVisible = visible;
      },
      /**
       * 跳转到最近的item
       */
      jumpToNearestItemById(id) {
        const index = this.visibleMenu.findIndex(item => item.id === id);

        // 向后跳
        const nextItem = this.visibleMenu[index + 1];
        if (index < this.visibleMenu.length && nextItem !== undefined) {
          const { type, id } = nextItem;
          this.select({ type, id });
        }

        // 向前跳
        const lastItem = this.visibleMenu[index - 1];
        if (index > 0 && lastItem !== undefined) {
          const { type, id } = lastItem;
          this.select({ type, id });
        }

        // 前后都没有清空任何选择(基本不会发生的极端情况)
        this.selectedId = '';
        this.selectedType = '';
      }
    }
  };
</script>

<style lang="less">
  .vmp-tab-menu {
    height: 100%;
    font-size: 14px;

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
      height: calc(100% - 46px);
      overflow: hidden;
    }
  }
</style>
