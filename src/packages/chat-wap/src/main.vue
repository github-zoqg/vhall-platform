<template>
  <div class="vmp-chat-wap">
    <div class="vmp-chat-wap__content">
      <!-- 如果开启观众手动加载聊天历史配置项，并且聊天列表为空的时候显示加载历史消息按钮 -->
      <p
        v-if="hideChatHistory && !chatList.length"
        class="vmp-chat-wap__content__get-list-btn-container"
      >
        <span @click="getHistoryMessage" class="vmp-chat-wap__content__get-list-btn">
          {{ $t('chat.chat_1058') }}
        </span>
      </p>
      <virtual-list
        ref="chatlist"
        style="height: 100%; overflow: auto"
        :keeps="30"
        :data-key="'count'"
        :data-sources="chatList"
        :data-component="msgItem"
        :extra-props="{
          previewImg: previewImg.bind(this),
          emitLotteryEvent,
          emitQuestionnaireEvent
        }"
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
    <send-box
      :currentTab="3"
      :isAllBanned="allBanned"
      :isBanned="isBanned"
      :isHandsUp="isHandsUp"
      :noChatLogin="noChatLogin"
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
  import { useChatServer, useRoomBaseServer, useGroupServer } from 'middle-domain';
  import { ImagePreview } from 'vant';
  import defaultAvatar from './img/default_avatar.png';
  import { browserType, boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpChatWap',
    components: {
      VirtualList,
      // msgItem,
      sendBox
    },
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
        //是否隐藏聊天历史加载记录
        configList: {},
        //在线的上麦状态 todo 待确认从哪里取全局的speakerList
        onlineMicStatus: false,
        //当前页数
        page: 1,
        //是否已经下拉刷新
        isPullingDown: false,
        //关键词列表 todo 需要获取设置的关键词
        keywordList: [],
        //房间号
        roomId: '',
        //是否是嵌入端
        isEmbed: false,
        isBanned: useChatServer().state.banned, //true禁言，false未禁言
        allBanned: useChatServer().state.allBanned //true全体禁言，false未禁言
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
      //是否不登陆也可以参与聊天
      noChatLogin() {
        let noChatLogin = false;
        if (browserType()) {
          /**
           * ui.hide_wechat: 0使用微信授权 1不适用微信授权
           */
          if ([1, '1'].includes(this.configList['ui.hide_wechat'])) {
            noChatLogin = [1, '1'].includes(this.configList['ui.show_chat_without_login']);
          } else {
            noChatLogin = true;
          }
        } else {
          noChatLogin = [1, '1'].includes(this.configList['ui.show_chat_without_login']);
        }
        return noChatLogin;
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
      }
    },
    beforeCreate() {
      this.chatServer = useChatServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      this.initViewData();
      this.page = 0;
      if (!this.hideChatHistory) {
        this.getHistoryMessage();
      }

      this.imgUrls = [];
      // 给聊天服务保存一份关键词
      // this.chatServer.setKeywordList(this.keywordList);
    },
    mounted() {
      console.log('useChatServer', useChatServer().state);
      this.listenChatServer();
    },
    methods: {
      //初始化视图数据
      initViewData() {
        const { configList = {}, watchInitData = {}, embedObj = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        const { embed = false } = embedObj;
        console.log(this.roomBaseServer, 'roomBaseServer');
        console.log(join_info);
        this.webinar = webinar;
        this.configList = configList;
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
            this.tipMsg = `有${this.unReadMessageCount}条未读消息`;
          } else {
            this.scrollBottom();
          }
        });
        //监听@我的消息
        chatServer.$on('atMe', () => {
          if (!this.isBottom()) {
            this.isHasUnreadAtMeMsg = true;
            this.tipMsg = '有人@你';
          }
        });
        //监听回复我的消息
        chatServer.$on('replyMe', () => {
          if (!this.isBottom()) {
            this.isHasUnreadAtMeMsg = true;
            this.tipMsg = '有人回复你';
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
        chatServer.$on('changeChannel', () => {
          this.handleChannelChange();
        });
        //监听被提出房间消息
        chatServer.$on('roomKickout', () => {
          this.$message('您已经被踢出房间');
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
          pos: this.page * 10,
          limit: 10 // 所有端统一显示50条
        };
        // eslint-disable-next-line no-void
        if (['', void 0, null].includes(this.chatServer.state.defaultAvatar)) {
          this.chatServer.setState('defaultAvatar', defaultAvatar);
        }

        const { chatList = [], imgUrls = [] } = await this.chatServer.getHistoryMsg(data, 'h5');
        if (chatList.length > 0) {
          this.imgUrls = imgUrls;
        }
        this.scrollBottom();
      },
      previewImg(img) {
        const index = this.imgUrls.findIndex(item => item === img);
        ImagePreview({
          images: this.imgUrls,
          startPosition: index,
          lazyLoad: true
        });
      },
      //todo 下拉加载
      handlePullingDown() {
        this.page++;
        this.isPullingDown = true;
        this.getHistoryMessage();
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
          this.$refs.chatlist.scrollToBottom();
          this.unReadMessageCount = 0;
          this.isHasUnreadAtMeMsg = false;
        });
      },
      //滚动条是否在最底部
      isBottom() {
        return (
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
      //todo domain负责 抽奖情况检查
      emitLotteryEvent(msg) {
        console.log('emitLotteryEvent', msg);
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickLotteryChatItem', [msg])
        );
      },
      //todo domain负责 问卷情况检查
      emitQuestionnaireEvent(questionnaireId) {
        console.log('emitQuestionnaireEvent', questionnaireId);
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickQuestionnaireChatItem', [questionnaireId])
        );
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-wap {
    height: 100%;
    overflow: hidden;
    position: relative;
    &__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 120px;
      //overflow: hidden;
      overflow-x: hidden;
      overflow-y: auto;
      &__get-list-btn-container {
        width: 100%;
        text-align: center;
        color: #666666;
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
        color: #333333;
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
