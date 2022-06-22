<template>
  <div class="vmp-wap-private-chat" ref="chatWapPrivate" :class="smFix ? 'smFix' : ''">
    <div class="vmp-wap-private-chat__wrapper" ref="chatContentMain">
      <div class="vmp-private-chat__content" ref="chatContent">
        <virtual-list
          v-if="virtual.showlist"
          ref="chatlist"
          :style="{ height: chatlistHeight + 'px', overflow: 'auto' }"
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
    <div
      class="overlay"
      v-show="showSendBox"
      @touchstart="closeOverlay"
      @click="closeOverlay"
    ></div>
    <send-box
      ref="sendBox"
      currentTab="private"
      :isAllBanned="allBanned && private_allBanned_status"
      :isBanned="isBanned"
      refName="chatWapPrivate"
      @sendPrivate="sendMsg"
    ></send-box>
  </div>
</template>

<script>
  import msgItem from './components/msg-item';
  import {
    useChatServer,
    useRoomBaseServer,
    useUserServer,
    useMsgServer,
    useMenuServer
  } from 'middle-domain';
  import sendBox from '@/packages/chat-wap/src/components/send-box';
  import VirtualList from 'vue-virtual-scroll-list';
  import emitter from '@/app-shared/mixins/emitter';
  import EventBus from '@/packages/chat-wap/src/js/Events.js';
  import { isMse } from './js/utils.js';
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
        private_allBanned_status: useChatServer().state.allBannedModuleList.private_chat_status, //全体禁言对问答是否生效
        //小屏适配
        smFix: false
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
      },
      isSmallPlayer() {
        return this.$domainStore.state.playerServer.isSmallPlayer;
      },
      // wap-body和文档是否切换位置
      isWapBodyDocSwitch() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitch;
      }
    },
    watch: {
      //观察私聊列表变动，如果有新消息，滚动到底部
      chatList: function () {
        // if (this.isBottom()) {
        this.scrollBottom();
        // }
      },
      isSmallPlayer() {
        this.changeChatHeight();
      },
      isWapBodyDocSwitch() {
        this.changeChatHeight();
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
      this.chatServer = useChatServer();
      this.userServer = useUserServer();
      this.menuServer = useMenuServer();
    },
    mounted() {
      this.initViewData();
      this.listenEvents();
      const IsMse = isMse();
      if (IsMse.os === 'android') {
        this.innerHeight = window.innerHeight;
        window.addEventListener('resize', this.resizeAndroid);
      } else if (IsMse.os === 'ios') {
        window.addEventListener('focusin', this.focusinIOS);
        window.addEventListener('focusout', this.focusoutIOS);
      }
      // this.initEvent();
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
          // this.scrollBottom();
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
        // this.scrollBottom();
      },
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
        //监听切换到当前tab
        this.menuServer.$on('tab-switched', data => {
          this.$nextTick(() => {
            this.virtual.contentHeight = this.$refs.chatContent?.offsetHeight;
            this.virtual.showlist = data.cuid == this.cuid;
            this.chatlistHeight = this.virtual.contentHeight;
            this.scrollBottom();
          });
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
          // console.log(this.$refs.chatlist.scrollToBottom);
          this.$refs && this.$refs.chatlist && this.$refs.chatlist.scrollToBottom();
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
      },
      // 音频模式播放器大小变动 高度重新计算
      changeChatHeight() {
        let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
        // postcss 换算基数为75 头部+播放器区域高为 522px 120为聊天区域高度
        let playerHeight = this.isSmallPlayer == true && !this.isWapBodyDocSwitch ? 130 : 422;
        let baseHeight = playerHeight + 71 + 94 + 90;
        if (this.isEmbed) {
          baseHeight = playerHeight + 94 + 90;
        }
        this.chatlistHeight = this.virtual.contentHeight =
          document.body.clientHeight - (baseHeight / 75) * parseFloat(htmlFontSize);
      }
    }
  };
</script>

<style lang="less">
  .vmp-wap-private-chat {
    height: 100%;
    overflow: hidden;
    position: relative;
    .vmp-wap-private-chat__wrapper {
      height: 100%;
      overflow: hidden;
      position: relative;
      .vmp-private-chat__content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 94px;
        overflow-x: hidden;
        overflow-y: auto;
      }
    }
    > .overlay {
      width: 100vw;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      background: transparent;
    }
  }
</style>
