<template>
  <div class="vmp-wap-private-chat">
    <div class="vmp-wap-private-chat__wrapper">
      <div class="vmp-private-chat__content">
        <template v-if="privateChatList.length > 0">
          <msg-item v-for="(item, index) in privateChatList" :key="index" :msg="item"></msg-item>
        </template>
      </div>
    </div>
    <send-box currentTab="private" :is-banned="isMuted" :is-all-banned="isAllMuted"></send-box>
  </div>
</template>

<script>
  import msgItem from './components/msg-item';
  import { useChatServer, useRoomBaseServer, useUserServer, useMsgServer } from 'middle-domain';
  import sendBox from '@/packages/chat-wap/src/components/send-box';
  import { textToEmojiText } from '@/packages/chat/src/js/emoji';
  import getAvatar from '@/packages/chat/src/js/get-avatar';
  import Msg from '@/packages/chat/src/js/msg-class';
  import { formatTime } from '@/packages/chat/src/js/handle-time';
  export default {
    name: 'VmpWapPrivateChat',
    components: {
      msgItem,
      sendBox
    },
    data() {
      return {
        //私聊列表
        privateChatList: [],
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
        this.msgServer.$on('CHAT', msg => {
          try {
            if (typeof msg !== 'object') {
              msg = JSON.parse(msg);
            }
            if (typeof msg.context !== 'object') {
              msg.context = JSON.parse(msg.context);
            }
            if (typeof msg.data !== 'object') {
              msg.data = JSON.parse(msg.data);
            }
          } catch (e) {
            console.log(e);
          }
          if (['text', 'image'].includes(msg.data.type)) {
            // 接收到私聊信息
            // 问答私聊消息，并且是自己的
            if (msg.data.target_id && msg.data.target_id == this.userId) {
              this.privateMsg = msg;
              this.privateSendId = msg.sender_id;
            }
          }
        });
      },
      //发送消息
      sendMsg(value) {
        const data = {
          type: 'text',
          text_content: value,
          target_id: this.currentAtPerson.hostJoinId || this.privateSendId
        };
        const context = {
          to: this.currentAtPerson.hostJoinId || this.privateSendId,
          nickname: this.userInfo.nickname,
          avatar: getAvatar(this.userInfo.avatar),
          role_name: 2, // 角色 1主持人2观众3助理4嘉宾
          event: JSON.stringify(data),
          source: 'mobile'
        };
        // 发送socket消息
        window.chatSDK.emit(data, context);
        // 先发送消息   然后改变自身的data里的表情属性值   不可改变顺序
        data.text_content = textToEmojiText(data.text_content);
        const tempData = new Msg({
          avatar: getAvatar(this.userInfo.avatar),
          nickName: this.userInfo.nickname,
          type: 'text',
          content: data,
          sendId: this.userId,
          sendTime: formatTime(new Date()),
          roleName: 2,
          client: 'mobile',
          self: true
          // showTime: handleTime(item.sendTime)
        });
        this.privateChatList.push(tempData);
        this.scrollTop();
      },
      //组装消息
      handleMsg(val) {
        const json = JSON.stringify(val);
        const msg = JSON.parse(json);
        if (msg.data.text_content) {
          msg.data.text_content = textToEmojiText(msg.data.text_content);
        }
        this.currentAtPerson.hostName = msg.context.nickName;
        this.currentAtPerson.hostJoinId = msg.context.user_id;
        const data = new Msg({
          avatar: getAvatar(msg.context.avatar),
          nickName: msg.context.nickname,
          type: msg.data.type,
          content: msg.data,
          sendId: msg.sender_id,
          sendTime: msg.date_time,
          roleName: msg.context.role_name,
          client: 'mobile'
        });
        this.privateChatList.push(data);
        this.scrollTop();
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
