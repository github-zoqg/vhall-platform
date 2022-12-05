<template>
  <div class="vmp-watch-private-chat">
    <!--消息区域-->
    <div class="private-chat-content" :style="{ height: 'calc(100% - ' + operatorHeight + 'px)' }">
      <virtual-list
        ref="chatlist"
        style="height: 100%; overflow: auto"
        :keeps="30"
        :data-key="'count'"
        :data-sources="chatList"
        :data-component="msgItem"
        :extra-props="{}"
      ></virtual-list>
      <div
        v-show="unReadMessageCount !== 0 && isHasUnreadNormalMsg"
        class="private-chat-content__tip-box-content"
        @click="scrollToTarget"
      >
        {{ tipMsg }}
        <span class="vh-iconfont vh-d-arrow-down"></span>
      </div>
    </div>
    <!--操作栏-->
    <chat-operate
      ref="privateChatOperator"
      :chat-list="chatList"
      :chat-login-status="chatLoginStatus"
      :input-status="inputStatus"
      :latestMessage="latestMessage"
      :join-info="joinInfo"
      @needLogin="handleLogin"
      @sendMsgEnd="sendMsgEnd"
    ></chat-operate>
  </div>
</template>

<script>
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import msgItem from './components/msg-item';
  import chatOperate from './components/chat-operate';
  import { useRoomBaseServer, useChatServer, useMsgServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  import VirtualList from 'vue-virtual-scroll-list';
  import emitter from '@/app-shared/mixins/emitter';
  export default {
    name: 'VmpWatchPrivateChat',
    components: {
      chatOperate,
      VirtualList
    },
    mixins: [emitter],
    data() {
      return {
        msgItem,
        defaultAvatar,
        //私聊的列表
        chatList: useChatServer().state.privateChatList,
        //私聊是否需要登录
        chatLoginStatus: false,
        //滚动插件配置
        overlayScrollBarsOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        },
        //是否滚动
        doScroll: false,
        //操作栏高度
        operatorHeight: 91,
        //是否在执行动画
        animationRunning: false,
        //是否有正常的未读消息
        isHasUnreadNormalMsg: false,
        //未读消息数量
        unReadMessageCount: 0,
        //输入框状态
        inputStatus: {
          disable: false,
          placeholder: this.$t('chat.chat_1021')
        },
        //最新的消息
        latestMessage: {},
        //用户角色
        roleName: '',
        //提示消息
        tipMsg: {},
        //是否是嵌入端
        isEmbed: false,
        //登录信息
        joinInfo: null,
        //活动信息
        webinar: null,
        //观看端初始化的信息
        watchInitData: null,
        //房间号
        roomId: '',
        //true禁言，false未禁言
        isBanned: useChatServer().state.banned,
        //true全体禁言，false未禁
        allBanned: useChatServer().state.allBanned,
        private_allBanned_status: useChatServer().state.allBannedModuleList.private_chat_status //全体禁言对问答是否生效
      };
    },
    watch: {
      //观察私聊列表变动，如果有新消息，滚动到底部
      chatList: function () {
        // if (this.isBottom()) {
        this.scrollBottom();
        // }
      },
      //观察黄金链路权限变化，更新输入框的状态
      configList: {
        deep: true,
        handler(val, oldVal) {
          if (val['ui.watch_record_no_chatting'] != oldVal['ui.watch_record_no_chatting']) {
            this.initInputStatus();
          }
          if (val['ui.show_chat_without_login'] != oldVal['ui.show_chat_without_login']) {
            this.initLoginStatus();
          }
        }
      },
      //观察直播状态，更新输入框的状态
      liveStatus: function () {
        this.initInputStatus();
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.chatServer = useChatServer();
      this.msgServer = useMsgServer();
    },
    computed: {
      //配置信息
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      },
      //当前直播状态
      liveStatus() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
      }
    },
    mounted() {
      this.initViewData();
      this.listenEvents();
      this.initInputStatus();
      this.initLoginStatus();
    },
    methods: {
      //初始化视图数据
      initViewData() {
        const { watchInitData = {}, embedObj = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        const { embed = false } = embedObj;
        this.roomId = interact.room_id;
        this.roleName = join_info.role_name;
        this.userId = join_info.user_id;
        this.thirdPartyUserId = join_info.third_party_user_id;
        this.isEmbed = embed;
        this.joinInfo = join_info;
        this.webinar = webinar;
        this.watchInitData = watchInitData;
      },
      // 初始化聊天登录状态
      initLoginStatus() {
        if (
          [2, '2'].includes(this.roleName) &&
          !this.isEmbed &&
          (!this.userId || this.userId == 0) &&
          !this.configList['ui.show_chat_without_login']
        ) {
          this.chatLoginStatus = true;
          this.inputStatus.placeholder = '';
        } else {
          // 非嵌入并或者是没有登录
          this.chatLoginStatus = false;
        }
      },
      //初始化输入框状态
      initInputStatus() {
        this.inputStatus.disable =
          this.isBanned || (this.allBanned && this.private_allBanned_status);
        if (this.isBanned) {
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        } else if (this.allBanned && this.private_allBanned_status) {
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        } else {
          this.inputStatus.placeholder = this.$t('chat.chat_1021');
        }
        const isVod =
          (this.webinar.type == 5 || this.webinar.type == 4) && this.watchInitData.paas_record_id;
        // 判断控制台回放禁言状态
        if (isVod && this.configList && this.configList['ui.watch_record_no_chatting']) {
          this.inputStatus.disable = true;
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        }
        if (this.liveStatus == 3 && this.roleName == 2) {
          this.inputStatus.disable = true;
          this.inputStatus.placeholder = this.$t('chat.chat_1092');
        }
      },
      //处理唤起登录
      handleLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      //事件监听
      listenEvents() {
        this.chatServer.$on('receivePrivateMsg', () => {
          this.unReadMessageCount++;
          this.dispatch('VmpTabContainer', 'noticeHint', 'private');
        });
        //监听禁言通知
        this.chatServer.$on('banned', res => {
          this.isBanned = res;
          this.initInputStatus();
        });
        //监听全体禁言通知
        this.chatServer.$on('allBanned', (status, msg) => {
          this.allBanned = status;
          if (msg) {
            this.private_allBanned_status = msg.private_chat_status == 1 ? true : false;
          }
          this.initInputStatus();
        });
      },
      //获取历史的私聊消息
      getHistoryMsg() {
        this.chatServer.getPrivateChatHistoryList();
      },
      //滚动到目标处
      scrollToTarget() {
        const index = this.chatList.length - this.unReadMessageCount;
        this.$refs.chatlist.scrollToIndex(index);
        this.unReadMessageCount = 0;
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
      //自己发送消息后的回调
      sendMsgEnd() {
        this.scrollBottom();
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$refs.chatlist.scrollToBottom();
          this.unReadMessageCount = 0;
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-watch-private-chat {
    position: relative;
    width: 100%;
    height: 100%;

    ::-webkit-scrollbar-thumb {
      background-color: var(--chat-scrollbar-thumb-bg) !important;
    }

    .private-chat-content {
      position: relative;
      &:last-child {
        padding-bottom: 20px;
      }
      &__tip-box-content {
        padding: 0 14px;
        line-height: 28px;
        border-radius: 14px;
        background-color: #363636;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        color: @font-error;
        font-size: 14px;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        .vh-d-arrow-down {
          font-size: 12px;
          margin-left: 6px;
        }
      }
    }
    .private-chat-operate {
    }
  }
</style>
