<template>
  <div class="vmp-chat-wap">
    <!-- 礼物动画组件 -->
    <vmp-air-container :oneself="true" :cuid="childrenCom[1]"></vmp-air-container>
    <!-- 礼物动画组件-svga -->
    <vmp-air-container :oneself="true" :cuid="childrenCom[2]"></vmp-air-container>
    <div class="vmp-chat-wap__content" ref="chatContentMain">
      <!-- 如果开启观众手动加载聊天历史配置项，并且聊天列表为空的时候显示加载历史消息按钮 -->
      <p
        v-if="hideChatHistory && !chatList.length && !historyLoaded"
        class="vmp-chat-wap__content__get-list-btn-container"
      >
        <span @click="getHistoryMessage" class="vmp-chat-wap__content__get-list-btn">
          {{ $t('chat.chat_1058') }}
        </span>
      </p>
      <div ref="chatContent" class="virtual-content">
        <virtual-list
          ref="chatlist"
          :style="{ height: chatlistHeight + 'px', overflow: 'auto' }"
          :keeps="20"
          :estimate-size="100"
          :data-key="'count'"
          :data-sources="chatList"
          :data-component="msgItem"
          :extra-props="{
            previewImg: previewImg.bind(this),
            emitLotteryEvent,
            emitQuestionnaireEvent,
            joinInfo
          }"
          @tobottom="toBottom"
        ></virtual-list>
        <div
          class="vmp-chat-wap__content__new-msg-tips"
          v-show="isHasUnreadAtMeMsg"
          @click="scrollToTarget"
        >
          <span>{{ tipMsg }}</span>
          <i class="vh-iconfont vh-line-arrow-down"></i>
        </div>
      </div>
    </div>
    <div class="overlay" v-show="showSendBox" @click="closeOverlay"></div>
    <send-box
      ref="sendBox"
      :currentTab="3"
      :isAllBanned="allBanned"
      :isBanned="isBanned"
      :isHandsUp="isHandsUp"
      :deviceType="deviceType"
      :onlineMicStatus="onlineMicStatus"
      @showUserPopup="showUserPopup"
      @login="handleLogin"
      @sendEnd="sendMsgEnd"
      :cuid="cuid"
    ></send-box>
  </div>
</template>

<script>
  import VirtualList from 'vue-virtual-scroll-list';
  import msgItem from './components/msg-item';
  import sendBox from './components/send-box';
  import {
    useChatServer,
    useRoomBaseServer,
    useGroupServer,
    useMicServer,
    useMenuServer
  } from 'middle-domain';
  // import { ImagePreview } from 'vh5-ui';
  import defaultAvatar from '@/packages/app-shared/assets/img/default_avatar.png';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import emitter from '@/packages/app-shared/mixins/emitter';
  import EventBus from './js/Events.js';
  import { isMse } from './js/utils.js';

  export default {
    name: 'VmpChatWap',
    components: {
      VirtualList,
      // msgItem,
      sendBox
    },
    mixins: [emitter],
    data() {
      const { chatList } = this.chatServer.state;
      return {
        msgItem,
        chatList: chatList,
        //新消息信息集合体
        messageType: {
          atList: false,
          reply: false,
          normal: false,
          id: '',
          noNormal: false
        },
        //消息提示
        tipMsg: '',
        //是否有未读
        isHasUnreadAtMeMsg: false,
        //新消息数量
        unReadMessageCount: 0,
        //活动信息
        webinar: {},
        //当前页数
        page: 1,
        //是否已经下拉刷新
        isPullingDown: false,
        //关键词列表
        keywordList: [],
        //房间号
        roomId: '',
        //是否是嵌入端
        isEmbed: false,
        //true禁言，false未禁言
        isBanned: useChatServer().state.banned,
        //true全体禁言，false未禁言
        allBanned: useChatServer().state.allBanned,
        //是否加载完聊天历史
        historyLoaded: false,
        //虚拟列表配置
        virtual: {
          showlist: false,
          contentHeight: 0
        },
        //聊天内容高度
        chatlistHeight: 0,
        //android的内初始部高度
        innerHeight: 0,
        //显示输入组件
        showSendBox: false,
        childrenCom: []
      };
    },
    watch: {
      chatList: function () {
        if (this.isBottom()) {
          this.scrollBottom();
        }
      }
    },
    computed: {
      //是否开启手动加载聊天历史记录
      hideChatHistory() {
        return [1, '1'].includes(this.configList['ui.hide_chat_history']);
      },
      //当前登录人信息
      joinInfo() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {} } = watchInitData;
        return join_info;
      },
      //是否允许举手
      isHandsUp() {
        const { interactToolStatus = {} } = this.roomBaseServer.state;
        return interactToolStatus && !!interactToolStatus['is_handsup'];
      },
      // 设备状态
      deviceType() {
        const { interactToolStatus = {} } = this.roomBaseServer.state;
        let muteType = {};
        const { groupInitData = {} } = this.groupServer.state;
        if (this.webinar.mode == 6 && groupInitData.speaker_list && groupInitData.isInGroup) {
          muteType = groupInitData.speaker_list.find(
            ele => ele.account_id === this.joinInfo.third_party_user_id
          );
        } else {
          muteType =
            interactToolStatus &&
            Array.isArray(interactToolStatus.speaker_list) &&
            interactToolStatus.speaker_list.find(
              ele => ele.account_id === this.joinInfo.third_party_user_id
            );
        }
        if (muteType) {
          return {
            audio:
              (muteType.audio != 1 && !groupInitData.isInGroup) ||
              (muteType.audio != 1 && groupInitData.isInGroup && groupInitData.join_role == 2),
            video: muteType.video != 1
          };
        } else {
          return {
            // 开启自动上麦需要静音
            audio:
              (this.webinar.mode == 6 &&
                interactToolStatus.auto_speak == 1 &&
                !groupInitData.isInGroup) ||
              groupInitData.join_role == 2,
            video: false
          };
        }
      },
      //是否已上麦
      onlineMicStatus() {
        return (useMicServer().state.speakerList || []).some(item => {
          return (
            item.account_id == this.joinInfo.third_party_user_id ||
            item.accountId == this.joinInfo.third_party_user_id
          );
        });
      },
      // 聊天区欢迎语
      welcomeText() {
        if (Array.isArray(this.roomBaseServer.state.customMenu?.list)) {
          // 获取聊天菜单内容
          const chatItem = this.roomBaseServer.state.customMenu.list.find(item => {
            return item.type == 3;
          });
          // 返回欢迎语
          return chatItem?.welcome_content || '';
        }
        return '';
      },
      //黄金链路配置
      configList() {
        return this.roomBaseServer.state.configList;
      }
    },
    beforeCreate() {
      this.chatServer = useChatServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
      this.menuServer = useMenuServer();
    },
    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      this.initViewData();
      this.page = 0;
      // 给聊天服务保存一份关键词
      // this.chatServer.setKeywordList(this.keywordList);
    },
    mounted() {
      this.listenChatServer();
      this.showWelcomeTxt();
      if (!this.hideChatHistory) {
        this.getHistoryMessage();
      }
      const IsMse = isMse();
      if (IsMse.os === 'android') {
        this.innerHeight = window.innerHeight;
        window.addEventListener('resize', this.resizeAndroid);
      } else if (IsMse.os === 'ios') {
        window.addEventListener('focusin', this.focusinIOS);
        window.addEventListener('focusout', this.focusoutIOS);
      }
      this.initEvent();
      this.eventListener();
    },
    beforeDestroy() {
      //移除事件
      window.removeEventListener('resize', this.resizeAndroid);
      window.removeEventListener('focusin', this.focusinIOS);
      window.removeEventListener('focusout', this.focusoutIOS);
    },
    methods: {
      //初始化eventbus
      initEvent() {
        EventBus.$on('showEmoji', e => {
          this.$nextTick(() => {
            if (e) {
              this.chatlistHeight =
                this.$refs.chatContentMain.clientHeight - this.$refs.sendBox.$el.clientHeight + 60;
              this.scrollBottom();
            } else {
              this.chatlistHeight = this.virtual.contentHeight;
            }
          });
        });
      },
      resizeAndroid() {
        const newInnerHeight = window.innerHeight;
        if (this.innerHeight > newInnerHeight) {
          // 键盘弹出事件处理
          // alert('android 键盘弹窗事件');
          this.scrollBottom();
        } else {
          // 键盘收起事件处理
          // alert('android 键盘收起事件处理');
        }
      },
      focusoutIOS() {
        // 键盘收起事件处理
        // alert('iphone 键盘收起事件处理');
      },
      focusinIOS() {
        // 键盘弹出事件处理
        // alert('iphone 键盘弹出事件处理');
        this.scrollBottom();
      },
      showWelcomeTxt() {
        // 注意： 欢迎语不能跟弹框重合，需要有点距离，此处进行了特殊处理
        this.welcomeText &&
          this.$toast({
            message: `${this.joinInfo.nickname}${this.welcomeText}`,
            position: 'bottom'
          });
      },
      //初始化视图数据
      initViewData() {
        const { watchInitData = {}, embedObj = {} } = this.roomBaseServer.state;
        const { webinar = {}, interact = {} } = watchInitData;
        const { embed = false } = embedObj;
        this.webinar = webinar;
        this.roomId = interact.room_id;
        this.isEmbed = embed;
      },
      listenChatServer() {
        const chatServer = useChatServer();
        // const giftsServer = useGiftsServer();
        //监听到新消息过来
        chatServer.$on('receiveMsg', () => {
          if (!this.isBottom()) {
            this.isHasUnreadAtMeMsg = true;
            this.unReadMessageCount++;
            this.tipMsg = this.$t('chat.chat_1035', { n: this.unReadMessageCount });
          }
          this.dispatch('TabContent', 'noticeHint', 3);
        });
        //监听@我的消息
        chatServer.$on('atMe', () => {
          if (!this.isBottom()) {
            this.isHasUnreadAtMeMsg = true;
            this.tipMsg = this.$t('chat.chat_1075');
          }
        });
        //监听回复我的消息
        chatServer.$on('replyMe', () => {
          if (!this.isBottom()) {
            this.isHasUnreadAtMeMsg = true;
            this.tipMsg = this.$t('chat.chat_1076');
          }
        });
        //监听禁言通知
        chatServer.$on('banned', res => {
          this.isBanned = res;
        });
        //监听全体禁言通知
        chatServer.$on('allBanned', res => {
          this.allBanned = res;
        });
        //监听分组房间变更通知
        // chatServer.$on('changeChannel', () => {
        //   this.handleChannelChange();
        // });
        this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
          this.handleChannelChange();
        });
        //监听被提出房间消息
        chatServer.$on('roomKickout', () => {
          this.$toast(this.$t('chat.chat_1007'));
        });
        //监听切换到当前tab
        this.menuServer.$on('tab-switched', data => {
          this.$nextTick(() => {
            this.virtual.contentHeight = this.$refs.chatContent.offsetHeight;
            this.virtual.showlist = data.cuid == this.cuid;
            this.chatlistHeight = this.virtual.contentHeight;
            this.scrollBottom();
          });
        });
      },
      //处理分组讨论频道变更
      handleChannelChange() {
        this.page = 0;
        useChatServer().clearChatMsg();
        this.getHistoryMessage();
      },
      // 获取历史消息
      async getHistoryMessage() {
        const data = {
          room_id: this.roomId,
          // webinar_id: this.webinar_id,
          pos: this.page * 10,
          limit: 50 // 所有端统一显示50条
        };
        // eslint-disable-next-line no-void
        if (['', void 0, null].includes(this.chatServer.state.defaultAvatar)) {
          this.chatServer.setState('defaultAvatar', defaultAvatar);
        }
        await this.chatServer.getHistoryMsg(data, 'h5');
        this.historyLoaded = true;
        this.scrollBottom();
      },
      //图片预览
      previewImg(img, index = 0, list = []) {
        if ((Array.isArray(list) && !list.length) || index < 0) {
          return;
        }
        this.$imagePreview({
          images: list,
          startPosition: index,
          lazyLoad: true
        });
      },
      //滚动到目标处
      scrollToTarget() {
        const index = this.chatList.length - this.unReadMessageCount;
        this.$refs.chatlist.scrollToIndex(index);
        this.unReadMessageCount = 0;
        this.isHasUnreadAtMeMsg = false;
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$refs && this.$refs.chatlist && this.$refs.chatlist.scrollToBottom();
          this.unReadMessageCount = 0;
          this.isHasUnreadAtMeMsg = false;
        });
      },
      //监听滚动条滚动到底部
      toBottom() {
        this.unReadMessageCount = 0;
        this.isHasUnreadAtMeMsg = false;
      },
      //滚动条是否在最底部
      isBottom() {
        return (
          this.$refs.chatlist &&
          this.$refs.chatlist.$el.scrollHeight -
            this.$refs.chatlist.$el.scrollTop -
            this.$refs.chatlist.getClientSize() <
            5
        );
      },
      showUserPopup() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenUserCenterWap'));
      },
      //唤起登录弹窗
      handleLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      //自己发送消息后的回调
      sendMsgEnd() {
        this.scrollBottom();
      },
      //抽奖情况检查
      emitLotteryEvent(msg) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickLotteryChatItem', [msg])
        );
      },
      //问卷情况检查
      emitQuestionnaireEvent(questionnaireId) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickQuestionnaireChatItem', [questionnaireId])
        );
      },
      // eventBus监听
      eventListener() {
        //监听聊天组件是否打开
        EventBus.$on('showSendBox', e => {
          this.showSendBox = e;
        });
      },
      //关闭遮罩层
      closeOverlay() {
        EventBus.$emit('showSendBox', false);
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-wap {
    height: 100%;
    overflow: hidden;
    position: relative;
    .virtual-content {
      height: 100%;
      overflow: hidden;
      position: relative;
      .virtual-list {
        height: 100%;
        overflow: auto;
      }
    }
    &__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 94px;
      overflow-x: hidden;
      overflow-y: auto;
      &__get-list-btn-container {
        width: 100%;
        text-align: center;
        color: #666;
        font-size: 28px;
        padding-top: 20px;
      }
      &__get-list-btn {
      }
      &__new-msg-tips {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 20px;
        width: 337px;
        height: 56px;
        background: #ffffff;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08), 0px 4px 12px rgba(0, 0, 0, 0.1);
        border-radius: 28px;
        color: #0a7ff5;
        font-size: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        .vh-iconfont {
          font-size: 16px;
          margin-left: 7px;
        }
      }
    }
    > .overlay {
      width: 100vw;
      height: 100vh;
      z-index: 21;
      position: fixed;
      left: 0;
      top: 0;
      background: transparent;
    }
  }
</style>
