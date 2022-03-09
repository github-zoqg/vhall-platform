<template>
  <section class="vmp-tab-menu" v-if="!embedObj.embedVideo">
    <section class="vmp-tab-menu__header">
      <!-- 菜单区域 -->
      <ul class="vmp-tab-menu-scroll-container" ref="menu">
        <li
          v-for="item of mainMenu"
          :ref="item.id"
          class="vmp-tab-menu-item"
          :class="{ 'vmp-tab-menu-item__active': selectedId === item.id }"
          :key="item.id"
          @click="select({ type: item.type, id: item.id })"
        >
          <span class="item-text">{{ $tdefault(item.name) }}</span>
          <i v-show="item.tipsVisible" class="tips"></i>
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
          :key="item.id"
          @click="select({ type: item.type, id: item.id })"
        >
          <span>{{ $tdefault(item.name) }}</span>
          <i class="tips" v-show="item.tipsVisible"></i>
        </li>
      </ul>
    </section>

    <!-- 正文区域 -->
    <section class="vmp-tab-menu__main">
      <tab-content
        ref="tabContent"
        :mainMenu="mainMenu"
        :subMenu="subMenu"
        @noticeHint="handleHint"
        @closePopup="selectDefault"
      />
    </section>
  </section>
</template>

<script>
  import {
    useMenuServer,
    useQaServer,
    useChatServer,
    useDocServer,
    useMsgServer
  } from 'middle-domain';
  import { getItemEntity } from './js/getItemEntity';
  import tabContent from './components/tab-content.vue';

  export default {
    name: 'VmpTabMenuWap',
    components: { tabContent },
    data() {
      return {
        direciton: 'row', // row(横)，column(纵)
        selectedType: '',
        selectedId: '',
        menu: [],
        isSubMenuShow: false,
        tabOptions: {}
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
        return this.visibleMenu.findIndex(item => item.id === this.selectedId);
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      }
    },
    beforeCreate() {
      this.menuServer = useMenuServer();
      this.docServer = useDocServer();
    },
    created() {
      this.initConfig();
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
          // 默认显示菜单中的第一个
          this.selectDefault();
        });
        //收到私聊消息
        chatServer.$on('receivePrivateMsg', () => {
          this.setVisible({ visible: true, type: 'private' });
        });
        // 直播结束不展示入口
        msgServer.$on('live_over', e => {
          this.setVisible({ visible: false, type: 'v5' });
          this.setVisible({ visible: false, type: 'private' });
        });
        // 设置观看端文档是否可见
        this.docServer.$on('dispatch_doc_switch_status', val => {
          console.log('dispatch_doc_switch_status', val);
          this.setVisible({ visible: val, type: 2 });
          if (val) {
            let obj = this.getItem({ type: 2 });
            this.select({ type: obj.type, id: obj.id });
          }
        });
      },
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
        const roomState = this.$domainStore.state.roomBaseServer;
        // 从接口拉取的配置
        const list = this.$domainStore.state.roomBaseServer.customMenu.list;
        console.log('[menu] list--:', list);
        for (const item of list) {
          this.addItem(item);
        }

        // TODO: temp，增加私聊
        const chatIndex = this.menu.findIndex(el => el.type === 3);
        if (chatIndex >= -1) {
          this.addItemByIndex(chatIndex + 2, {
            type: 'private',
            name: '私聊', // name只有自定义菜单有用，其他默认不采用而走i18n
            text: '私聊', // 同上
            status: 2
          });
          this.addItemByIndex(chatIndex + 1, {
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
        // 选择默认项
        if (this.visibleMenu.length > 0) {
          const { type, id } = this.visibleMenu[0];
          this.select({ type, id });
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
        this.menu = this.menu.splice(index);
      },
      /**
       * 添加一个菜单项
       * @param {*} item
       */
      addItem(item) {
        console.log('[menu] this.tabOptions.menuConfig:', this.tabOptions.menuConfig);
        item = getItemEntity(item, this.tabOptions.menuConfig);
        console.log('[menu] item:', item);
        this.menu.push(item);
      },
      /**
       * 在某个index位点添加菜单项
       * @param {*} index
       * @param {*} item
       */
      addItemByIndex(index, item) {
        item = getItemEntity(item, this.tabOptions.menuConfig);
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
          if (id !== undefined && !!id) {
            return item.id === id;
          } else {
            return item.type === type;
          }
        });
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
          return;
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
      },

      /**
       * 选中一个菜单项，并显示对应内容
       * @param {String} type tab类型
       * @param {String|Number} menuId 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容(customMenu必传)
       * @example select('comCustomMenuWap','10246')
       */
      select({ type, id = '' }) {
        this.selectedType = type;
        this.selectedId = id;

        this.isSubMenuShow = false;

        const item = this.getItem({ type, id });
        item.tipsVisible = false;

        this.$refs['tabContent'].switchTo(item); // tab-content视图切换
        this.menuServer.$emit('tab-switched', item);
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
          line-height: 1.2;
        }

        .tips {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ff0005;
          border: 9px solid #ff0005;
          transform: translate(30%, -100%);
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
      max-height: 352px;
      overflow-y: scroll;

      &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 88px;
        padding: 0 40px;

        &:not(:last-child) {
          border-bottom: 1px solid #d4d4d4;
        }

        .tips {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ff0005;
          border: 9px solid #ff0005;
        }
      }
    }
  }
</style>
