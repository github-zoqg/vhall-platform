<template>
  <section
    :class="['vmp-tab-menu', isConcise || isFullScreen ? ' tab-menu__concise' : '']"
    v-if="!embedObj.embedVideo"
    v-show="visibleMenu.length > 0"
  >
    <!-- <template v-if="isTryVideo && isSubscribe">
      <div class="vmp-tab-menu__try">
        <div class="try-img">
          <img src="./img/trySee.png" alt="" />
        </div>
        <p>{{ $t('appointment.appointment_1030') }}</p>
      </div>
    </template> -->
    <!-- <template v-else> -->
    <div class="tab_box">
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
            :class="{
              'vmp-tab-menu-item__active': selectedId === item.id,
              'vmp-tab-menu-item_subscrbe': !isToggleBtnVisible
            }"
            :key="item.id"
            @click="select({ type: item.type, id: item.id })"
          >
            <span class="item-text">{{ $tdefault(item.name) }}</span>
            <i class="tips" v-show="item.tipsVisible"></i>
            <hr v-show="selectedId === item.id" class="bottom-line" />
          </li>
        </ul>

        <!-- next btn -->
        <span
          v-if="isToggleBtnVisible"
          class="vmp-tab-menu-page-btn next-btn"
          :class="{ disabledClick: selectedIndex === visibleMenu.length - 1 }"
          @click="next"
        >
          <i class="vh-iconfont vh-line-arrow-right" />
        </span>
      </section>
    </div>

    <!-- 正文区域 -->
    <section class="vmp-tab-menu__main" v-show="visibleMenu.length > 0">
      <tab-content
        ref="tabContent"
        :menu="isConcise || isFullScreen ? conciseMenu : menu"
        :auth="auth"
        @noticeHint="handleHint"
      />
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
    useRoomBaseServer,
    useInteractiveServer,
    useMicServer
  } from 'middle-domain';
  import { getItemEntity } from './js/getItemEntity';
  import tabContent from './components/tab-content.vue';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpTabMenuWap',
    components: { tabContent },
    data() {
      return {
        isToggleBtnVisible: true, // cfg-options:是否显示左右切换按钮
        selectedType: '',
        selectedId: '',
        menu: [],
        pageEnv: 'live-room',
        tabOptions: {},
        auth: {
          member: true, // 成员-tab
          notice: true, // 公告-tab
          chapter: true // 章节-tab
        },
        themeClass: {
          bgColor: '',
          pageBg: '#fb2626'
        }
      };
    },
    computed: {
      // themeBgColor() {
      //   return {
      //     'background-color': this.themeClass.pageBg
      //   };
      // },
      isConcise() {
        let skin_json_wap = {
          style: 1
        };
        const { skinInfo } = this.$domainStore.state.roomBaseServer;
        console.log(skinInfo);
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        if (skin_json_wap?.style == 3) {
          return true;
        } else {
          return false;
        }
      },
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(
          this.$domainStore.state.roomBaseServer.clientType
        );
      },
      selectedIndex() {
        return this.visibleMenu.findIndex(item => item.id === this.selectedId);
      },
      visibleMenu() {
        let otherVisibleMenu = this.menu.filter(item => {
          if (!this.isWatch) {
            // 此处逻辑较复杂，请参考tab-menu/readme.md
            if (item.type == 8 && !this.auth.member) return false; // 成员
            if (item.type == 'notice' && !this.auth.notice) return false; // 公告
          } else {
            if (item.type == 7 && !this.auth.chapter) return false; // 章节
          }

          if (this.pageEnv === 'live-room') {
            return item.status !== 2 && item.visible;
          }

          if (this.pageEnv === 'live_over' || this.pageEnv === 'subscribe') {
            return (item.status == 1 || item.status == 4) && item.visible;
          }
          return item.visible === true;
        });
        let conciseVisibleMenu = [];
        if (this.isConcise || this.isFullScreen) {
          conciseVisibleMenu = otherVisibleMenu.filter(item => {
            // 如果是简洁模式，菜单抛开 - 聊天tab
            if (item.type == 3) return false;
            // 如果是简洁模式，并且 连麦+演示是 合并模式 - 不展示文档tab
            if (this.speakerAndShowLayout == 1 && item.type == 2) return false;
            return item.visible === true;
          });
        }
        let visibleMenu = this.isConcise ? conciseVisibleMenu : otherVisibleMenu;
        console.log('当前菜单个数', visibleMenu.length, this.menu);
        if (this.isConcise || this.isFullScreen) {
          // // 告知外部当前可展示的自定义菜单个数
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitVisibleMenuLength', [visibleMenu.length])
          );
        }
        return visibleMenu;
      },
      // 简洁模式菜单，因外部已有私聊内容，当前正文区域的渲染，需要绕开私聊部分。
      conciseMenu() {
        return this.menu.filter(item => item.type != 3);
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      // 是否为单视频嵌入页
      isEmbedVideo() {
        return this.$domainStore.state.roomBaseServer.embedObj.embedVideo;
      },
      // 是否是试看
      isTryVideo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.record.preview_paas_record_id;
      },
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      },
      //是否在小组中
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      //活动信息
      webinarInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar;
      },
      roleName() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.role_name;
      },
      isSmallPlayer() {
        return this.$domainStore.state.playerServer.isSmallPlayer;
      },
      // wap-body和文档是否切换位置
      isWapBodyDocSwitch() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitch;
      },
      isNoDelay() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar;
      },
      // 当前连麦+演示模式：0分离模式；1合并模式
      speakerAndShowLayout() {
        let skin_json_wap = {
          speakerAndShowLayout: 0
        };
        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return skin_json_wap?.speakerAndShowLayout;
      },
      // 竖屏直播
      isFullScreen() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar_show_type == 0;
      }
    },
    watch: {
      isWapBodyDocSwitch(val) {
        const docTabIndex = this.menu.findIndex(item => item.type == 2);
        if (val) {
          // 备份一下，还原时候用
          this._docTabNameCopy = this.menu[docTabIndex].name;
          const tabName =
            this.webinarInfo.mode == 1 ? this.$t('menu.menu_1015') : this.$t('menu.menu_1014');
          this.$set(this.menu, docTabIndex, { ...this.menu[docTabIndex], name: tabName });
        } else {
          this.$set(this.menu, docTabIndex, {
            ...this.menu[docTabIndex],
            name: this._docTabNameCopy
          });
        }
      },
      async 'visibleMenu.length'() {
        if (this.isEmbedVideo) return;
        await this.$nextTick();
        this.scrollToItem({ id: this.selectedId });
        this.computedWidth();
      },
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
      this.docServer = useDocServer();
      this.roomBaseServer = useRoomBaseServer();
      this.micServer = useMicServer();
      this.interactiveServer = useInteractiveServer();
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
      this.setSkinInfo();
      this.selectDefault();
      this.setSetingHeight();
      this.computedWidth();
      this.micServer.$on('vrtc_disconnect_success', async () => {
        // 非无延迟互动，下麦退出全屏
        if (
          this.interactiveServer.state.fullScreenType &&
          this.isNoDelay != 1 &&
          this.webinarInfo.mode == 3
        ) {
          console.log('wap-exitFullscreen-----1');
          this.exitFullscreen();
          setTimeout(() => {
            this.setSetingHeight();
          }, 500);
        }
      });
    },

    methods: {
      /**
       * 计算 设置tab-content高度
       */
      setSetingHeight() {
        if (
          this.isSubscribe ||
          this.isConcise ||
          this.isFullScreen ||
          this.isEmbedVideo ||
          this.embedObj.embedVideo
        )
          return;
        let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
        // postcss 换算基数为75 头部+播放器区域高为 522px
        let playerHeight = this.isSmallPlayer == true ? 130 : 422;
        let baseHeight = playerHeight + 71 + 94;
        let classname = '.tab-content';
        if (this.embedObj.embed) {
          baseHeight = playerHeight;
          classname = '.tab-content-embed';
        }
        let popHeight =
          document.body.clientHeight - (baseHeight / 75) * parseFloat(htmlFontSize) + 'px';
        document.querySelector(classname).style.height = popHeight;
      },
      computedWidth() {
        if (this.isEmbedVideo) return;
        let childNodes = document.querySelector('.vmp-tab-menu-scroll-container').childNodes;
        let childWidth = 0;
        childNodes.forEach(e => {
          childWidth += e.clientWidth; //每个item的padding
        });
        childWidth += 24; //tab的padding
        console.log(childWidth, '------------', screen.width);
        if (screen.width > childWidth) {
          this.isToggleBtnVisible = false;
        } else {
          this.isToggleBtnVisible = true;
        }
      },

      async setSkinInfo() {
        const { skinInfo } = this.$domainStore.state.roomBaseServer;

        // 默认皮肤
        if (!skinInfo || !skinInfo.skin_json_pc || skinInfo.status != 1) {
          this.themeClass.pageBg = '#fb3a32';
          return;
        }

        // 自定义皮肤
        await this.$nextTick();
        const { pageStyle } = skinInfo.skin_json_pc || {};
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
        qaServer.$on(qaServer.Events.QA_OPEN, msg => {
          this.setVisible({
            visible: true,
            type: 'v5',
            name:
              this.roleName == 1 || !msg.data.name || msg.data.name == '问答'
                ? this.$t('common.common_1004')
                : msg.data.name
          });
          chatServer.addChatToList({
            content: {
              //观看端显示编辑后的问答名称，发起端不变，消息体默认返回“问答”
              text_content:
                this.roleName == 1 || !msg.data.name || msg.data.name == '问答'
                  ? this.$t('chat.chat_1026', { n: this.$t('common.common_1004') })
                  : this.$t('chat.chat_1026', { n: msg.data.name })
            },
            roleName: msg.data.role_name,
            nickname: msg.data.nick_name,
            type: msg.data.type,
            interactStatus: true
          });
          if (this.visibleMenu && this.visibleMenu.length == 1) {
            // 若开启了问答后，菜单总数为1，那么默认菜单第一个被选中。
            this.selectDefault();
          }
        });
        qaServer.$on(qaServer.Events.QA_CLOSE, msg => {
          this.setVisible({ visible: false, type: 'v5' });
          this.setVisible({ visible: false, type: 'private' });
          chatServer.addChatToList({
            content: {
              text_content:
                this.roleName == 1 || !msg.data.name || msg.data.name == '问答'
                  ? this.$t('chat.chat_1081', { n: this.$t('common.common_1004') })
                  : this.$t('chat.chat_1081', { n: msg.data.name })
            },
            roleName: msg.data.role_name,
            nickname: msg.data.nick_name,
            type: msg.data.type,
            interactStatus: true
          });
          // 默认显示菜单中的第一个
          this.selectDefault();
        });
        //收到问答修改消息
        qaServer.$on(qaServer.Events.QA_SET, msg => {
          if (this.roleName == 2) {
            this.setTabName({
              type: 'v5',
              name:
                this.roleName != 2 || !msg.data.name || msg.data.name == '问答'
                  ? this.$t('common.common_1004')
                  : msg.data.name
            });
          }
        });
        //收到私聊消息
        chatServer.$on('receivePrivateMsg', () => {
          console.log('当前私聊消息');
          if (this.webinarInfo.type == 1) {
            // 如果是直播中，才展示。1-直播中，2-预约，3-结束，4-点播，5-回放
            this.setVisible({ visible: true, type: 'private' });
            if (this.visibleMenu.length == 1) {
              this.selectDefault();
            }
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
            this.setVisible({ visible: false, type: 'private' });
            if (this.roleName != 2) {
              this.setVisible({ visible: false, type: 'v5' });
            } // qa
            clientType === 'send' && this.selectDefault();
          }
        });

        // 设置观看端文档是否可见
        this.docServer.$on('dispatch_doc_switch_change', val => {
          console.log('dispatch_doc_switch_change', val);
          // 如果文档播放器互换位置，不需要切换自定义菜单
          if (val && this.isWapBodyDocSwitch) return;
          this.changeDocStatus(val);
        });
        // 设置观看端文档是否可见
        this.docServer.$on('dispatch_doc_switch_status', val => {
          console.log('dispatch_doc_switch_status', val);
          // 如果文档播放器互换位置，不需要切换自定义菜单
          if (val && this.isWapBodyDocSwitch) return;
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
        // 如果开启了合并模式，自定义菜单不显示文档
        if (this.roomBaseServer.state.interactToolStatus.speakerAndShowLayout != 1) {
          this.setVisible({ visible: val, type: 2 });
          if (val) {
            const obj = this.getItem({ type: 2 });
            if (obj) {
              this.select({ type: obj.type, id: obj.id });
            }
          } else {
            this.roomBaseServer.state.isWapBodyDocSwitch = false;
          }
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
        // 从接口拉取的配置
        const list = this.$domainStore.state.roomBaseServer.customMenu.list;
        for (const item of list) {
          // 如果是合并模式，需要把文档从自定义菜单中刨除去
          if (
            this.$domainStore.state.roomBaseServer.interactToolStatus.speakerAndShowLayout == 1 &&
            item.type == 2
          ) {
            continue;
          }
          this.addItem(item);
        }

        this.addSpecialItem();
      },
      addSpecialItem() {
        const roomState = this.$domainStore.state.roomBaseServer;
        let index = 0;
        if (this.isConcise) {
          // 极简风格，菜单顺序：问答>私聊>简介
          index = 0;
        } else {
          // 查找聊天的下标区域
          const chatIndex = this.menu.findIndex(el => el.type === 3);
          // 是否包含广告位置
          const hasMember = this.menu.includes(el => el.type === 'notice');
          if (chatIndex <= -1) return;
          index = hasMember ? chatIndex + 2 : chatIndex + 1;
        }
        const QAName =
          this.roleName == 1 ||
          !roomState.interactToolStatus.question_name ||
          roomState.interactToolStatus.question_name == '问答'
            ? this.$t('common.common_1004')
            : roomState.interactToolStatus.question_name;
        this.addItemByIndex(index, {
          type: 'v5',
          name: QAName, // name只有自定义菜单有用，其他默认不采用而走i18n
          text: QAName, // 同上
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
       * @param {String} condition [default|living]
       */
      setPageEnv(condition = 'live-room') {
        this.pageEnv = condition;
      },
      /**
       * 选中默认的菜单项（第一项）
       *
       */
      selectDefault() {
        if (this.isEmbedVideo) return;
        if (this.visibleMenu.length === 0) return;

        const item = this.visibleMenu[0];
        const { type, id } = item;
        this.select({ type, id });
      },

      /**
       * 添加一个菜单项
       * @param {*} item
       */
      addItem(item) {
        item = getItemEntity(item, this.tabOptions.menuConfig);
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
      async setVisible({ visible = true, type, id, name }) {
        const tab = this.getItem({ type, id });
        if (!tab) return;
        tab.visible = visible;
        name && (tab.name = name);
        if (tab.id == this.selectedId) {
          visible === false && this.jumpToNearestItemById(tab.id);
        }
      },
      setTabName({ type, id, name }) {
        const tab = this.getItem({ type, id });
        if (!tab) return;
        name && (tab.name = name);
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
      },

      /**
       *
       * @param {String} cuid
       * @param {String|Number} menuId
       */
      async scrollToItem({ id }) {
        await this.$nextTick();
        if (this.visibleMenu.length <= 0) {
          return;
        }
        const rectArr = this.visibleMenu.map(item => {
          try {
            const id = item.id;
            const ref = this.$refs[id][0];
            const paddingLeft = parseFloat(window.getComputedStyle(ref).paddingLeft);
            const left = ref.offsetLeft - paddingLeft;
            return { id, ref, left };
          } catch (error) {
            console.error('refs error title:', error);
            console.error('refs:', id, this.$refs, this.$refs[id]);
          }
        });

        const positionItem = rectArr.find(item => item.id === id);

        positionItem &&
          this.$refs['menu'].scrollTo({
            left: positionItem.left - 12, // 左右切换多留出来间距了
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
        this.menuServer.state.selectedType = type;
        this.selectedId = item.id;
        this.scrollToItem({ id: item.id });
        item.tipsVisible = false;

        this.$refs['tabContent'] && this.$refs['tabContent'].switchTo(item); // tab-content视图切换

        await this.$nextTick();
        this.menuServer.$emit('tab-switched', item);
      },
      exitFullscreen() {
        if (document.exitFullScreen) {
          document.exitFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      },
      // 极简模式下，弹出框点开后初始化宽度计算效果。
      async menuDialogComputed() {
        if (this.isEmbedVideo) return;
        await this.$nextTick();
        console.log('啥啥啥', this.visibleMenu, this.selectedId);
        // 初始化也好，消息事件触发之后；若点击菜单小icon图标，当前菜单总数 超过0个时，默认第一个选中。
        if (this.visibleMenu && this.visibleMenu.length > 0) {
          // 默认显示菜单中的第一个
          this.selectDefault();
          this.scrollToItem({ id: this.selectedId });
          this.computedWidth();
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-tab-menu {
    height: 100%;
    position: relative;
    background: var(--theme-tab-menu-bg);
    font-size: 28px;
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
    .tab_box {
      height: 80px;
      background: var(--theme-tab-menu-box-bg);
    }
    &__header {
      position: relative;
      padding: 0 24px;
      width: 100%;
      height: 80px;
      flex: 0 0 auto;
      display: flex;
      justify-content: space-around;
      border-bottom: var(--theme-tab-menu-border);

      /*  &::before {
        content: '';
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 1px;
        border-bottom: 1px solid #d4d4d4;
      } */

      .vmp-tab-menu-page-btn {
        position: relative;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-width: 24px;
        text-align: center;
        font-size: 24px;
        color: var(--tab-menu-btn-color);
        height: 100%;
        cursor: pointer;
        &.prev-btn {
          padding-right: 32px;
        }
        &.next-btn {
          padding-left: 30px;
        }
        &.disabledClick {
          i {
            color: rgba(140, 140, 140, 0.4);
          }
        }

        // &:hover {
        //   color: #666;
        // }
        .vh-iconfont {
          font-weight: 600;
          font-size: 24px;
          color: var(--tab-menu-btn-color);
        }
      }
    }

    &__main {
      width: 100%;
      flex: 1 1 auto;
      overflow: hidden;
      height: calc(100% - 90px);
    }

    .vmp-tab-menu-scroll-container {
      height: 100%;
      flex: 1 1 auto;
      overflow-x: auto;
      display: flex;
      flex-wrap: nowrap;

      &::-webkit-scrollbar {
        display: none;
      }

      .vmp-tab-menu-item {
        flex: 0 0 auto;
        position: relative;
        display: inline-flex;
        height: 100%;
        justify-content: center;
        align-items: center;
        padding: 0 32px;
        color: var(--theme-tab-menu-font);
        cursor: pointer;
        user-select: none;
        &_subscrbe {
          &:first-child {
            padding-left: 0;
          }
        }

        .item-text {
          display: flex;
          align-items: center;
          line-height: 1.2;
          font-size: 28px;
        }

        .tips {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          // background: var(--theme-tab-menu-tip);
          // border: 9px solid var(--theme-tab-menu-tip);
          background: #fb2626;
          border: 9px solid #fb2626;
          right: 18px;
          top: 10px;
        }

        .bottom-line {
          display: block;
          border: none;
          position: absolute;
          bottom: 9px;
          width: 40px;
          height: 5px;
          border-radius: 3px;
          background: var(--theme-tab-menu-tip);
        }

        &:hover {
          i {
            color: #e6e6e6;
          }
        }

        &__active {
          color: var(--theme-tab-menu-font-active);
          position: relative;

          .bottom-line {
            position: absolute;
            bottom: 9px;
            height: 5px;
            width: 40px;
            border-radius: 3px;
          }

          .item-text {
            font-weight: 500;
            position: relative;
          }
        }
      }
    }
  }
</style>
