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
          <span class="item-text">{{ $tdefault(item.name) }}</span>
          <i v-show="item.tipsVisible" class="tips"></i>
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
      <tab-content ref="tabContent" :menu="menu" @noticeHint="handleHint" />
    </main>
  </section>
</template>

<script>
  import { getItemEntity } from './js/getItemEntity';
  import TabContent from './components/tab-content.vue';
  import {
    useMenuServer,
    useQaServer,
    useChatServer,
    useMsgServer,
    useGroupServer,
    useRoomBaseServer
  } from 'middle-domain';

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
        pageEnv: 'live-room',
        menu: []
      };
    },
    computed: {
      selectedIndex() {
        return this.visibleMenu.findIndex(item => item.id === this.selectedId);
      },
      visibleMenu() {
        return this.menu.filter(item => {
          if (this.pageEnv === 'live-room') {
            return item.status != 2 && item.visible;
          }

          if (this.pageEnv === 'subscribe') {
            return (item.status == 1 || item.status == 4) && item.visible;
          }

          return item.visible;
        });
      },
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
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
        const msgServer = useMsgServer();
        const groupServer = useGroupServer();
        //收到问答开启消息
        qaServer.$on(qaServer.Events.QA_OPEN, msg => {
          this.setVisible({ visible: true, type: 'v5' });
          chatServer.addChatToList({
            content: {
              text_content: this.$t('chat.chat_1026')
            },
            roleName: msg.data.role_name,
            type: msg.data.type,
            interactStatus: true
          });
        });
        //收到问答关闭消息
        qaServer.$on(qaServer.Events.QA_CLOSE, msg => {
          this.setVisible({ visible: false, type: 'v5' });
          this.setVisible({ visible: false, type: 'private' });
          chatServer.addChatToList({
            content: {
              text_content: this.$t('chat.chat_1081')
            },
            roleName: msg.data.role_name,
            type: msg.data.type,
            interactStatus: true
          });
        });
        //收到私聊消息
        chatServer.$on('receivePrivateMsg', () => {
          this.setVisible({ visible: true, type: 'private' });
        });

        if (this.isSubscribe) {
          this.setPageEnv('subscribe');
          this.setVisible({ visible: false, type: 3 }); // chat
        } else {
          this.setPageEnv('live-room');
        }

        // 直播中、结束直播更改状态
        msgServer.$onMsg('ROOM_MSG', msg => {
          const { clientType } = useRoomBaseServer().state;

          if (msg.data.type === 'live_start') {
            this.setPageEnv('live-room');
          }

          if (msg.data.type === 'live_over') {
            this.setVisible({ visible: false, type: 'private' }); // private-chat
            this.setVisible({ visible: false, type: 'v5' }); // qa
            clientType === 'send' && this.selectDefault();
          }
        });
        //监听进出子房间消息
        groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
          const { interactToolStatus } = useRoomBaseServer().state;
          if (this.isInGroup) {
            this.setVisible({ visible: false, type: 'v5' });
            this.setVisible({ visible: false, type: 'private' });
            this.setVisible({ visible: false, type: 'notice' });
          } else {
            if (interactToolStatus.question_status == 1) {
              this.setVisible({ visible: true, type: 'v5' });
            } else {
              this.setVisible({ visible: false, type: 'v5' });
            }
            this.setVisible({ visible: true, type: 'notice' });
          }
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
          let customMenuList = roomState?.customMenu?.list || [];
          list = [...customMenuList];
        }
        for (const item of list) {
          this.addItem(item);
        }

        const chatIndex = this.menu.findIndex(el => el.type === 3);
        if (chatIndex >= -1) {
          this.addItemByIndex(chatIndex + 1, {
            type: 'v5',
            name: this.$t('common.common_1004'), // name只有自定义菜单有用，其他默认不采用而走i18n
            text: this.$t('common.common_1004'), // 同上
            visible: roomState.interactToolStatus.question_status && !this.isInGroup ? true : false,
            status: 3 //1 永久显示, 2 永久隐藏, 3 直播中、回放中显示, 4 停播、预约页显示
          });
          this.addItemByIndex(chatIndex + 2, {
            type: 'private',
            name: this.$t('common.common_1008'), // name只有自定义菜单有用，其他默认不采用而走i18n
            text: this.$t('common.common_1008'), // 同上
            visible: false,
            status: 3
          });
        }

        console.log('this.menu--------->', this.menu);
      },
      /**
       * 设置显示条件
       * @param {String} condition [default|living|predition]
       */
      setPageEnv(condition = 'default') {
        this.pageEnv = condition;
      },
      /**
       * 选中默认的菜单项（第一项）
       */
      selectDefault() {
        if (this.visibleMenu.length === 0) return;

        const item = this.visibleMenu[0];
        const { type, id } = item;
        this.select({ type, id });
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
      async scrollToItem({ id }) {
        await this.$nextTick();
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
       * @param {String} type 后端传过来的menu type
       * @param {String|Number} menuId 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容(customMenu必传)
       * @example select('comCustomMenuWap','10246')
       */
      async select({ type, id }) {
        await this.$nextTick();
        this.selectedType = type;
        const item = this.getItem({ type, id });
        this.scrollToItem({ id: item.id });
        this.selectedId = item.id;
        item.tipsVisible = false;
        this.$refs['tabContent'].switchTo(item);
        this.menuServer.$emit('tab-switched', item);
      },
      /**
       * 设置菜单项显隐
       * @param {Boolean} visible [true|false] 显隐值
       * @param {String} type 后端传过来的 menu type
       * @param {String|Number} id [非必传] 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容
       */
      setVisible({ visible = true, type, id }) {
        const tab = this.getItem({ type, id });
        if (!tab) return;
        tab.visible = visible;
        if (tab.id == this.selectedId) {
          visible === false && this.jumpToNearestItemById(tab.id);
        }
      },
      /**
       * 切换某个菜单tab的可视性
       * @param {*} type
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
       * @param {String} type 后端传过来的 menu type
       * @param {String|Number} menuId 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容
       * @example setTipsVisible(true,'comChatWap','10186')
       */
      setTipsVisible({ visible, type, id }) {
        const tab = this.getItem({ type, id });
        if (!tab || this.selectedId === tab.id) return;

        tab.tipsVisible = visible;
      },
      handleHint(cuid) {
        if (this.selectedType == cuid) {
          return;
        }
        this.setTipsVisible({ visible: true, type: cuid });
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
        // this.selectedId = '';
        // this.selectedType = '';
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
      box-sizing: border-box;
      border-bottom: 1px solid #1a1a1a;
      display: flex;
      height: 45px;

      .vmp-tab-menu-page-btn {
        position: relative;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        height: 100%;
        text-align: center;
        font-size: 14px;
        color: #999;
        height: 100%;
        cursor: pointer;

        i {
          font-size: 14px;
          cursor: pointer;
        }

        &.disabledClick:hover {
          i {
            cursor: pointer;
            color: @border-lighter-color;
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
          height: 100%;
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
          .tips {
            position: absolute;
            right: 10px;
            top: 10px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #fb3a32;
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
