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
          <hr class="bottom-line" :style="themeBgColor" />
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
      <tab-content ref="tabContent" :menu="menu" :auth="auth" @noticeHint="handleHint" />
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
        selectedId: '', // 选中的tab项
        pageEnv: 'live-room',
        menu: [],
        auth: {
          member: true, // 成员-tab
          notice: true, // 公告-tab
          chapter: true // 章节-tab
        },
        themeClass: {
          pageBg: '#fb3a32'
        }
      };
    },
    computed: {
      themeBgColor() {
        return {
          'background-color': this.themeClass.pageBg
        };
      },
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(
          this.$domainStore.state.roomBaseServer.clientType
        );
      },
      selectedIndex() {
        return this.visibleMenu.findIndex(item => item.id === this.selectedId);
      },
      visibleMenu() {
        return this.menu.filter(item => {
          // 权限判断
          if (!this.isWatch) {
            if (item.type == 8 && !this.auth.member) return false; // 成员
            if (item.type == 'notice' && !this.auth.notice) return false; // 公告
          } else {
            if (item.type == 7 && !this.auth.chapter) return false; // 章节
          }

          // pageEnv判断
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
      },
      isEmbed() {
        // 是不是嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      //活动信息
      webinarInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar;
      },
      roleName() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.role_name;
      }
    },
    watch: {
      ['roomBaseServer.state.configList']: {
        deep: true,
        immediate: true,
        handler() {
          this.updateAuth();
        }
      }
    },
    beforeCreate() {
      this.menuServer = useMenuServer();
      this.roomBaseServer = useRoomBaseServer();
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
      this.setSkinInfo();
      this.selectDefault();
    },
    methods: {
      async setSkinInfo() {
        const { skinInfo } = this.$domainStore.state.roomBaseServer;

        // 默认皮肤
        if (!skinInfo || !skinInfo.skin_json_pc || skinInfo.status != 1) {
          this.themeClass.pageBg = '#fb3a32';
          return;
        }

        // 自定义皮肤
        await this.$nextTick();
        const { pageStyle } = JSON.parse(skinInfo.skin_json_pc) || {};
        this.themeClass.pageBg = pageStyle;
      },
      updateAuth() {
        const configList = this.roomBaseServer.state.configList;
        this.auth.member = configList.members_manager;
        this.auth.notice = configList.webinar_notice;
        this.auth.chapter = configList['ui.watch_record_chapter'];
      },
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
          if (this.webinarInfo.type == 1) {
            this.setVisible({ visible: true, type: 'private' });
          }
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
            if (this.roleName != 2) {
              this.setVisible({ visible: false, type: 'v5' });
            } // qa
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
            this.initMenu();
            if (interactToolStatus.question_status == 1) {
              this.setVisible({ visible: true, type: 'v5' });
            } else {
              this.setVisible({ visible: false, type: 'v5' });
            }
            this.setVisible({ visible: true, type: 'notice' });
            this.selectDefault();
          }
        });
      },
      /**
       * 拉取接口，初始化菜单项
       */
      initMenu() {
        const roomState = this.$domainStore.state.roomBaseServer;
        let list = [];
        this.menu = [];
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
        this.addSpecialItem();
      },
      /**
       * 增加特殊Item
       */
      addSpecialItem() {
        const roomState = this.$domainStore.state.roomBaseServer;

        // 发起端逻辑
        if (!this.isWatch) {
          this.addItem({
            type: 'v5',
            name: this.$t('common.common_1004'), // name只有自定义菜单有用，其他默认不采用而走i18n
            text: this.$t('common.common_1004'), // 同上
            visible: roomState.interactToolStatus.question_status && !this.isInGroup ? true : false,
            status: 3 //1 永久显示, 2 永久隐藏, 3 直播中、回放中显示, 4 停播、预约页显示
          });

          return;
        }

        const chatIndex = this.menu.findIndex(el => el.type === 3);
        const hasMember = this.menu.includes(el => el.type === 'notice');

        if (chatIndex <= -1) return;
        const index = hasMember ? chatIndex + 2 : chatIndex + 1;
        this.addItemByIndex(index, {
          type: 'v5',
          name: this.$t('common.common_1004'), // name只有自定义菜单有用，其他默认不采用而走i18n
          text: this.$t('common.common_1004'), // 同上
          visible: roomState.interactToolStatus.question_status && !this.isInGroup ? true : false,
          status: 3 //1 永久显示, 2 永久隐藏, 3 直播中、回放中显示, 4 停播、预约页显示
        });
        this.addItemByIndex(index + 1, {
          type: 'private',
          name: this.$t('common.common_1008'), // name只有自定义菜单有用，其他默认不采用而走i18n
          text: this.$t('common.common_1008'), // 同上
          visible: false,
          status: 3
        });
      },
      /**
       * 设置显示条件
       * @param {String} condition [live-room|subscribe]
       */
      setPageEnv(condition = 'live-room') {
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
       * 组装tab的数据实体
       * @param {Object} item
       */
      getItemEntity(item) {
        return getItemEntity(item, this.tabOptions.menuConfig);
      },

      addItem(item) {
        item = this.getItemEntity(item);
        if (item === false) return;
        this.menu.push(item);
        if (this.isInGroup) {
          this.setVisible({ visible: false, type: 'notice' });
        }
      },

      addItemByIndex(index, item) {
        item = this.getItemEntity(item);
        if (item === false) return;
        this.menu.splice(index, 0, item);
      },

      /**
       * 获取某个菜单项（根据type和id获取某个菜单项）
       * @param {String} type tab的type
       * @param {String|Number} id [非必传] 菜单id，由后端返得
       * @example getItem({type:2,id:'10468'})
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
       * 平滑滚动到指定元素
       * @param {String} cuid
       * @param {String|Number} menuId
       */
      async smoothScrollToItem({ id }) {
        await this.$nextTick();
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
       * @example select({type:1,id:'10246'})
       */
      async select({ type, id }) {
        await this.$nextTick();
        this.selectedType = type;
        const item = this.getItem({ type, id });
        this.smoothScrollToItem({ id: item.id });
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

      /**
       * 接受从子孙组件冒的setTips
       * @param {String} type
       */
      handleHint(type) {
        if (this.selectedType == type) return;
        this.setTipsVisible({ visible: true, type });
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

    /*滚动条*/
    div::-webkit-scrollbar {
      width: 6px; // 横向滚动条
      height: 6px; // 纵向滚动条 必写
    }
    // 滚动条的滑块
    div::-webkit-scrollbar-thumb {
      border-radius: 5px;
      cursor: pointer;
      background-color: #666666;
    }
    div::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
</style>
