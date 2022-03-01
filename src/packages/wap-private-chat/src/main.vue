<template>
  <div class="vmp-wap-private-chat">
    <div class="vmp-wap-private-chat__wrapper">
      <div class="vmp-private-chat__content">
        <template v-if="privateChatList.length > 0">
          <msg-item v-for="(item, index) in privateChatList" :key="index" :msg="item"></msg-item>
        </template>
      </div>
    </div>
    <send-box
      currentTab="private"
      :is-banned="isMuted"
      :is-all-banned="isAllMuted"
      @sendPrivate="sendMsg"
    ></send-box>
  </div>
</template>

<script>
  import msgItem from './components/msg-item';
  import { useChatServer, useRoomBaseServer, useUserServer, useMsgServer } from 'middle-domain';
  import sendBox from '@/packages/chat-wap/src/components/send-box';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpWapPrivateChat',
    components: {
      msgItem,
      sendBox
    },
    data() {
      return {
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
        //私聊消息发送人
        privateSendId: '',
        //私聊消息主体
        privateMsg: {}
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
      privateMsg: {
        handler(val) {
          console.log('收到私聊消息', val);
          if (val && val.data) {
            this.handleMsg(val);
          }
        },
        deep: true,
        immediate: true
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
        // this.chatServer.$on('receivePrivateMsg', msg => {
        //   this.privateChatList.push(msg);
        // });
      },
      //发送消息
      sendMsg(value) {
        const curmsg = useChatServer().createCurMsg();
        const target = useRoomBaseServer().state.watchInitData.webinar.userinfo.user_id;
        curmsg.setTarget(target);
        //将文本消息加入消息体
        curmsg.setText(value);
        //发送消息
        useChatServer().sendMsg(curmsg);
        //清除发送后的消息
        useChatServer().clearCurMsg();
      },
      //滚动到顶部
      scrollTop() {
        this.$nextTick(() => {
          if (document.getElementsByClassName('vmp-wap-private-chat__wrapper').length > 0) {
            document.getElementsByClassName('vmp-wap-private-chat__wrapper')[0].scrollTop =
              document.querySelectorAll('.vmp-private-chat__content')[0].scrollHeight;
          }
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-wap-private-chat {
    height: 100%;
    .vmp-wap-private-chat__wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: calc(100% - 120px);
      bottom: 120px;
      overflow: hidden;
    }
    .vmp-private-chat__content {
      height: 100%;
      overflow-y: scroll;
      touch-action: pan-y;
    }
  }
</style>
