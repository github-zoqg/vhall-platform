<template>
  <div class="vmp-wap-private-chat">
    <div class="vmp-wap-private-chat__wrapper">
      <div class="vmp-private-chat__content">
        <virtual-list
          ref="chatlist"
          style="height: 100%; overflow: auto"
          :keeps="15"
          :data-key="'count'"
          :data-sources="privateChatList"
          :data-component="msgItem"
          :extra-props="{
            userId: userId
          }"
          @tobottom="toBottom"
        ></virtual-list>
      </div>
    </div>
    <send-box
      currentTab="private"
      :isAllBanned="allBanned && private_allBanned_status"
      :isBanned="isBanned"
      @sendPrivate="sendMsg"
    ></send-box>
  </div>
</template>

<script>
  import msgItem from './components/msg-item';
  import { useChatServer, useRoomBaseServer, useUserServer, useMsgServer } from 'middle-domain';
  import sendBox from '@/packages/chat-wap/src/components/send-box';
  import VirtualList from 'vue-virtual-scroll-list';
  import emitter from '@/packages/app-shared/mixins/emitter';
  export default {
    name: 'VmpWapPrivateChat',
    components: {
      sendBox,
      VirtualList
    },
    mixins: [emitter],
    data() {
      return {
        msgItem,
        //私聊列表
        privateChatList: useChatServer().state.privateChatList,
        //当前@的对象
        currentAtPerson: {
          hostName: '',
          hostJoinId: '' // @对象的id
        },
        //用户id
        userId: '',
        //房间id
        roomId: '',
        //true禁言，false未禁言
        isBanned: useChatServer().state.banned,
        //true全体禁言，false未禁言
        allBanned: useChatServer().state.allBanned,
        private_allBanned_status: useChatServer().state.allBannedModuleList.private_chat_status //全体禁言对问答是否生效
      };
    },
    computed: {
      //是否个人被禁言
      isMuted() {
        return this.chatServer.state.banned;
      },
      //是否是全体禁言
      isAllMuted() {
        return this.chatServer.state.allBanned;
      },
      //用户信息
      userInfo() {
        return this.userServer.state.userInfo;
      }
    },
    watch: {
      //观察私聊列表变动，如果有新消息，滚动到底部
      chatList: function () {
        // if (this.isBottom()) {
        this.scrollBottom();
        // }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
      this.chatServer = useChatServer();
      this.userServer = useUserServer();
    },
    mounted() {
      this.initViewData();
      this.listenEvents();
    },
    methods: {
      //初始化视图信息
      initViewData() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {}, interact = {} } = watchInitData;
        this.roomId = interact.room_id;
        this.userId = join_info.third_party_user_id;
      },
      //事件监听
      listenEvents() {
        this.chatServer.$on('receivePrivateMsg', msg => {
          this.unReadMessageCount++;
          this.dispatch('TabContent', 'noticeHint', 'private');
        });
        //监听禁言通知
        this.chatServer.$on('banned', res => {
          this.isBanned = res;
        });
        //监听全体禁言通知
        this.chatServer.$on('allBanned', (status, msg) => {
          this.allBanned = status;
          if (msg) {
            this.private_allBanned_status = msg.private_chat_status == 1 ? true : false;
          }
        });
      },
      //发送消息
      sendMsg(value) {
        const currentMsg = useChatServer().createCurMsg();
        const target = useChatServer().state.curPrivateTargetId;
        currentMsg.setTarget(target);
        //将文本消息加入消息体
        currentMsg.setText(value);
        //发送消息
        useChatServer().sendMsg(currentMsg);
        //清除发送后的消息
        useChatServer().clearCurMsg();
        this.scrollBottom();
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
          console.log(this.$refs.chatlist.scrollToBottom);
          this.$refs.chatlist.scrollToBottom();
          this.unReadMessageCount = 0;
          this.isHasUnreadAtMeMsg = false;
        });
      },
      //滚动到底部的回调，重置未读消息数量
      toBottom() {
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
      }
    }
  };
</script>

<style lang="less">
  .vmp-wap-private-chat {
    height: 100%;
    .vmp-wap-private-chat__wrapper {
      height: 100%;
      .vmp-private-chat__content {
        height: calc(100% - 1.6rem);
        overflow-y: scroll;
        touch-action: pan-y;
      }
    }
  }
</style>
