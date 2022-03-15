<template>
  <section class="vmp-tab-menu" v-if="!embedObj.embedVideo">
    <!-- <template v-if="isTryVideo && isSubscribe">
      <div class="vmp-tab-menu__try">
        <div class="try-img">
          <img src="./img/trySee.png" alt="" />
        </div>
        <p>{{ $t('appointment.appointment_1030') }}</p>
      </div>
    </template> -->
    <!-- <template v-else> -->
    <section class="vmp-tab-menu__header">
      <!-- prev-btn -->
      <span
        class="vmp-tab-menu-page-btn prev-btn"
        v-if="isToggleBtnVisible"
        :class="{ disabledClick: selectedIndex === 0 }"
        @click="prev"
      >
        <i class="vh-iconfont vh-line-arrow-left" />
      </span>

      <!-- 菜单区域 -->
      <ul class="vmp-tab-menu-scroll-container" ref="menu">
        <li
          v-for="item of visibleMenu"
          :ref="item.id"
          class="vmp-tab-menu-item"
          :class="{ 'vmp-tab-menu-item__active': selectedId === item.id }"
          :key="item.id"
          @click="select({ type: item.type, id: item.id })"
        >
          <span class="item-text">{{ $tdefault(item.name) }}</span>
          <i v-show="item.tipsVisible" class="tips"></i>
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
    </section>

    <!-- 正文区域 -->
    <section class="vmp-tab-menu__main">
      <tab-content ref="tabContent" :menu="menu" @noticeHint="handleHint" />
    </section>
    <!-- </template> -->
  </section>
</template>

<script>
  import {
    useMenuServer,
    useQaServer,
    useChatServer,
    useDocServer,
    useMsgServer,
    useGroupServer,
    useRoomBaseServer
  } from 'middle-domain';
  import { getItemEntity } from './js/getItemEntity';
  import tabContent from './components/tab-content.vue';

  export default {
    name: 'VmpTabMenuWap',
    components: { tabContent },
    data() {
      return {
        isToggleBtnVisible: true, // cfg-options:是否显示左右切换按钮
        direciton: 'row', // row(横)，column(纵)
        selectedType: '',
        selectedId: '',
        menu: [],
        pageEnv: 'default',
        tabOptions: {}
      };
    },
    computed: {
      selectedIndex() {
        return this.visibleMenu.findIndex(item => item.id === this.selectedId);
      },
      visibleMenu() {
        return this.menu.filter(item => {
          if (this.pageEnv === 'living') {
            return (item.status == 1 || item.status == 3) && item.visible;
          }

          if (this.pageEnv === 'live_over' || this.pageEnv === 'subscribe') {
            return (item.status == 1 || item.status == 4) && item.visible;
          }

          return item.visible;
        });
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      // 是否是试看
      isTryVideo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.record.preview_paas_record_id;
      },
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      }
    },
    watch: {
      async 'visibleMenu.length'() {
        await this.$nextTick();
        this.scrollToItem({ id: this.selectedId });
      }
    },
    beforeCreate() {
      this.menuServer = useMenuServer();
      this.docServer = useDocServer();
    },
    created() {
      // if (this.isTryVideo && this.isSubscribe) return;
      this.initConfig();
      this.initMenu();
      this.listenEvents();
    },
    async mounted() {
      // if (this.isTryVideo && this.isSubscribe) return;
      await this.$nextTick(0);
      this.selectDefault();
    },

    methods: {
      listenEvents() {
        const qaServer = useQaServer();
        const chatServer = useChatServer();
        const msgServer = useMsgServer();
        const groupServer = useGroupServer();
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

        // 设置观看端文档是否可见
        this.docServer.$on('dispatch_doc_switch_change', val => {
          console.log('dispatch_doc_switch_change', val);
          this.changeDocStatus(val);
        });
        // 设置观看端文档是否可见
        this.docServer.$on('dispatch_doc_switch_status', val => {
          console.log('dispatch_doc_switch_status', val);
          this.changeDocStatus(val);
        });
        //监听进出子房间消息
        groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
          const { interactToolStatus } = useRoomBaseServer().state;
          if (this.isInGroup) {
            this.setVisible({ visible: false, type: 'v5' });
            this.setVisible({ visible: false, type: 'private' });
          } else {
            if (interactToolStatus.question_status == 1) {
              this.setVisible({ visible: true, type: 'v5' });
            } else {
              this.setVisible({ visible: false, type: 'v5' });
            }
          }
        });
      },
      changeDocStatus(val) {
        this.setVisible({ visible: val, type: 2 });
        if (val) {
          let obj = this.getItem({ type: 2 });
          this.select({ type: obj.type, id: obj.id });
        }
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
            status: 3
          });
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
       * 设置显示条件
       * @param {String} condition [default|living|predition]
       */
      setPageEnv(condition = 'default') {
        this.pageEnv = condition;
      },
      /**
       * 选中默认的菜单项（第一项）
       *
       */
      selectDefault() {
        if (this.visibleMenu.length === 0) return;

        const item = this.visibleMenu[0];
        const { type, id } = item;
        this.select({ type, id });
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
      async setVisible({ visible = true, type, id }) {
        const tab = this.getItem({ type, id });
        if (!tab) return;
        tab.visible = visible;

        if (tab.id == this.selectedId) {
          visible === false && this.jumpToNearestItemById(tab.id);
        }
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
          return;
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
      },

      /**
       *
       * @param {String} cuid
       * @param {String|Number} menuId
       */
      async scrollToItem({ id }) {
        const rectArr = this.visibleMenu.map(item => {
          const id = item.id;
          const ref = this.$refs[id][0];
          const paddingLeft = parseFloat(window.getComputedStyle(ref).paddingLeft);
          const left = ref.offsetLeft - paddingLeft;
          return { id, ref, left };
        });

        const positionItem = rectArr.find(item => item.id === id);

        this.$refs['menu'].scrollTo({
          left: positionItem.left,
          behavior: 'smooth'
        });
      },

      /**
       * 选中一个菜单项，并显示对应内容
       * @param {String} type tab类型
       * @param {String|Number} menuId 菜单id，由后端返得，特别是自定义菜单依赖menuId来显示内容(customMenu必传)
       * @example select('comCustomMenuWap','10246')
       */
      async select({ type, id = '' }) {
        const item = this.getItem({ type, id });

        this.selectedType = item.type;
        this.selectedId = item.id;
        this.scrollToItem({ id: item.id });
        item.tipsVisible = false;

        this.$refs['tabContent'].switchTo(item); // tab-content视图切换

        await this.$nextTick();
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
    &__try {
      height: 100%;
      width: 100%;
      background: #f7f7f7;
      .try-img {
        width: 221px;
        height: 136px;
        margin: 0 auto;
        margin-top: 40%;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      p {
        text-align: center;
        font-size: 28px;
        color: #8c8c8c;
        padding-top: 24px;
        text-indent: -20px;
      }
    }

    &__header {
      position: relative;
      padding: 0 24px;
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

      .vmp-tab-menu-page-btn {
        position: relative;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        height: 100%;
        text-align: center;
        font-size: 14px;
        color: #444;
        height: 100%;
        cursor: pointer;

        &.disabledClick:hover {
          cursor: auto;
          i {
            color: @font-light-low;
          }
        }

        &:hover {
          color: #666;
        }
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
      overflow-x: auto;
      display: flex;
      flex-wrap: nowrap;
      overflow-x: auto;
      .vmp-tab-menu-item {
        flex: 0 0 auto;
        min-width: 33%;
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
    }
  }
</style>
