<template>
  <div ref="chat" class="vhsaas-chat">
    <div
      class="vhsaas-chat__body-wrapper"
      :style="{ height: 'calc(100% - ' + operatorHieght + 'px)' }"
    >
      <virtual-list
        ref="qalist"
        style="height: 100%; overflow: auto"
        :keeps="30"
        :data-key="'id'"
        :data-sources="qaList"
        :data-component="MsgItem"
        @tobottom="tobottom"
      ></virtual-list>
      <div class="vhsaas-chat__body__bottom-tip-box">
        <div
          v-show="unReadMessageCount !== 0"
          class="vhsaas-chat__body__bottom-tip"
          @click="scrollToTarget"
        >
          {{ tipMsg }}
          <span class="iconfont iconyourennijiantou"></span>
        </div>
      </div>
    </div>
    <div v-if="roleName == 1" class="button-container">
      <p @click="openQa">问答管理</p>
    </div>
    <chat-operator
      v-else
      ref="chatQaOperator"
      :chat-list="qaList"
      :chat-login-status="chatLoginStatus"
      :input-status="inputStatus"
      @chatTextareaHeightChange="chatTextareaHeightChange"
      @onOnlyMine="onOnlyMine"
      @onInputStatus="onInputStatus"
      @needLogin="handleLogin"
    ></chat-operator>
  </div>
</template>

<script>
  import ChatOperator from './components/chat-operator';
  import MsgItem from './components/msg-item';
  // import { textToEmojiText } from '@/packages/chat/src/js/emoji';
  import { useRoomBaseServer, useQaServer, useChatServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import VirtualList from 'vue-virtual-scroll-list';
  import emitter from '@/packages/app-shared/mixins/emitter';
  export default {
    name: 'VmpQa',
    components: {
      ChatOperator,
      VirtualList
    },
    mixins: [emitter],
    data() {
      return {
        MsgItem,
        qaList: useQaServer().state.qaList,
        inputValue: '',
        inputStatus: {
          disable: false,
          placeholder: this.$t('chat.chat_1003')
        },
        chatLoginStatus: false,

        operatorHieght: 91,
        // 滚动条状态 start
        osComponentOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        },
        doScroll: false,
        animationRunning: false,
        // 滚动条状态 end
        unReadMessageCount: 0, // 未读消息数量
        isOnlyMine: false,
        isHasUnreadNormalMsg: false,
        tipMsg: '',
        isBanned: useChatServer().state.banned, //true禁言，false未禁言
        allBanned: useChatServer().state.allBanned, //true全体禁言，false未禁言
        watchInitData: useRoomBaseServer().state.watchInitData
      };
    },
    computed: {
      roleName() {
        return this.watchInitData.join_info.role_name;
      },
      thirdPartyId() {
        return this.watchInitData.join_info.third_party_user_id;
      },
      joinId() {
        return this.watchInitData.join_info.join_id;
      },
      userId() {
        return this.watchInitData.join_info.user_id;
      },
      roomId() {
        return this.watchInitData.interact.room_id;
      },
      webinarId() {
        return this.watchInitData.webinar.id;
      },
      isEmbed() {
        // 是不是音视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    watch: {
      qaList: function () {
        if (this.isBottom()) {
          this.scrollBottom();
        }
      }
    },
    mounted() {
      this.listenEvents();
      this.getQaHistoryMsg();
      this.initLoginStatus();
    },
    filters: {},
    methods: {
      listenEvents() {
        const qaServer = useQaServer();
        const chatServer = useChatServer();
        //监听新建问答消息
        qaServer.$on(qaServer.Events.QA_CREATE, msg => {
          if (msg.sender_id == this.thirdPartyId) {
            this.scrollBottom();
          } else {
            this.unReadMessageCount++;
            this.tipMsg = this.$t('chat.chat_1035', { n: this.unReadMessageCount });
          }
        });
        //监听问答回复消息
        qaServer.$on(qaServer.Events.QA_COMMIT, msg => {
          if (msg.sender_id != this.thirdPartyId) {
            this.unReadMessageCount++;
            this.tipMsg = this.$t('chat.chat_1035', { n: this.unReadMessageCount });
            this.dispatch('VmpTabContainer', 'noticeHint', 'v5');
          }
        });
        //监听撤销问答回复消息
        qaServer.$on(qaServer.Events.QA_BACKOUT, msg => {});
        //监听禁言通知
        chatServer.$on('banned', res => {
          this.isBanned = res;
          this.initInputStatus();
        });
        //监听全体禁言通知
        chatServer.$on('allBanned', res => {
          this.allBanned = res;
          this.initInputStatus();
        });
      },
      initInputStatus() {
        this.inputStatus.disable = this.isBanned || this.allBanned;
        if (this.isBanned) {
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        } else if (this.allBanned) {
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        } else {
          this.inputStatus.placeholder = this.$t('chat.chat_1003');
        }
        const isVod = this.watchInitData.webinar.type == 5 && this.watchInitData.paas_record_id;
        // 判断控制台回放禁言状态
        if (isVod) {
          this.inputStatus.disable = true;
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        }
      },
      // 更改输入框提示语
      onInputStatus(data) {
        this.inputStatus.placeholder = data;
      },
      // 初始化聊天登录状态
      initLoginStatus() {
        const { configList = {} } = useRoomBaseServer().state;
        if (
          ![1, '1'].includes(this.roleName) &&
          ['', null, 0].includes(
            this.userId || this.Embed || configList['ui.show_chat_without_login'] == 1
          )
        ) {
          this.chatLoginStatus = true;
          this.inputStatus.placeholder = '';
        } else {
          // 非嵌入并或者是没有登录
          this.chatLoginStatus = false;
        }
      },
      // 获取历史消息
      getQaHistoryMsg() {
        useQaServer().getQaHistory();
      },
      chatTextareaHeightChange(operatorHieght) {
        this.operatorHieght = operatorHieght;
        this.$refs.chatQaOperator.overlayScrollbar.update();
      },
      // 只看我的按钮 change 事件
      onOnlyMine(status) {
        this.isOnlyMine = status;
      },
      openQa() {
        const base = process.env.NODE_ENV === 'development' ? '/' : '/v3/';
        if (location.search == '') {
          window.open(`${base}lives/qa/${this.webinarId}`);
        } else {
          window.open(`${base}lives/qa/${this.webinarId}${location.search}`);
        }
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$refs.qalist && this.$refs.qalist.scrollToBottom();
          this.unReadMessageCount = 0;
        });
      },
      //滚动到目标处
      scrollToTarget() {
        const index = this.qaList.length - this.unReadMessageCount;
        this.$refs.qalist.scrollToIndex(index);
        this.unReadMessageCount = 0;
      },
      tobottom() {
        this.unReadMessageCount = 0;
      },
      //滚动条是否在最底部
      isBottom() {
        return (
          this.$refs.qalist.$el.scrollHeight -
            this.$refs.qalist.$el.scrollTop -
            this.$refs.qalist.getClientSize() <
          5
        );
      },
      //处理唤起登录
      handleLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      }
    }
  };
</script>

<style lang="less" scoped>
  .vhsaas-chat {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .vhsaas-chat__body-wrapper {
    position: relative;
    ::v-deep .vhsaas-chat-msg-item__wrapper {
      &:last-child {
        padding-bottom: 20px;
      }
    }
  }
  .vhsaas-chat__body__bottom-tip-box {
    position: absolute;
    z-index: 1;
    bottom: 5px;
    left: 50%;
    transform: translate(-50%, 0);
  }
  .vhsaas-chat__body__bottom-tip {
    padding: 0 14px;
    line-height: 28px;
    border-radius: 14px;
    background-color: #363636;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
    color: @font-error;
    font-size: 14px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    .iconyourennijiantou {
      font-size: 12px;
      margin-left: 6px;
    }
  }
  .button-container {
    height: 52px;
    width: 100%;
    background: #34363a;
    left: 0;
    right: 0;
    bottom: 0;
    position: absolute;
    cursor: pointer;
    & > p {
      color: #fff;
      display: block;
      margin: 0 auto;
      border-radius: 5px;
      background: #fc5659;
      line-height: 35px;
      font-size: 12px;
      text-align: center;
      margin: 10px;
      &:hover,
      &:active {
        background: #fc5659;
      }
    }
  }
</style>
