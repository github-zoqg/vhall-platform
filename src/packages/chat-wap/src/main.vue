<template>
  <div class="vmp-chat-wap">
    <div class="vmp-chat-wap__content">
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
          v-if="virtual.showlist"
          :style="{ height: virtual.contentHeight + 'px' }"
          ref="chatlist"
          class="virtual-list"
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
          @totop="onTotop"
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
    <send-box
      :currentTab="3"
      :isAllBanned="allBanned"
      :isBanned="isBanned"
      :isHandsUp="isHandsUp"
      :deviceType="deviceType"
      :onlineMicStatus="onlineMicStatus"
      @showUserPopup="showUserPopup"
      @login="handleLogin"
      @sendEnd="sendMsgEnd"
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
  import { ImagePreview } from 'vant';
  import defaultAvatar from '@/packages/app-shared/assets/img/default_avatar.png';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import emitter from '@/packages/app-shared/mixins/emitter';
  export default {
    name: 'VmpChatWap',
    components: {
      VirtualList,
      // msgItem,
      sendBox
    },
    mixins: [emitter],
    data() {
      return {
        msgItem,
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
        //聊天消息是否有滚动条
        overflow: false,
        //每次加载的消息条数
        pageSize: 20,
        isLoading: false
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
      },
      chatList() {
        return this.$domainStore.state.chatServer.chatList;
      },
      pos() {
        return this.$domainStore.state.chatServer.pos;
      }
    },
    beforeCreate() {
      this.chatServer = useChatServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
      this.menuServer = useMenuServer();
    },
    created() {
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
    },
    methods: {
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
        ImagePreview({
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
      async onTotop() {
        if (this.isLoading) {
          return;
        }
        const offsetPos = this.pos;
        const vsl = this.$refs.chatlist;
        this.$nextTick(() => {
          this.$refs.chatlist.scrollToIndex(this.chatList.length - offsetPos);
        });
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
      height: calc(100% - 120px);
      overflow: hidden;
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
        bottom: 0;
        height: 60px;
        background-color: rgba(255, 233, 233, 0.9);
        border: 1px solid rgba(254, 129, 148, 1);
        color: #333;
        font-size: 26px;
        display: flex;
        justify-content: center;
        align-items: center;
        .vh-iconfont {
          font-size: 16px;
          margin-left: 19px;
        }
      }
    }
  }
</style>
