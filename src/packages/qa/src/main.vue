<template>
  <div ref="chat" class="vhsaas-chat">
    <div
      class="vhsaas-chat__body-wrapper"
      :style="{ height: 'calc(100% - ' + operatorHieght + 'px)' }"
    >
      <overlay-scrollbars ref="osComponentRef" :options="osComponentOptions" style="height: 100%">
        <template v-for="msg in chatList">
          <msg-item
            v-show="
              !isOnlyMine || msg.join_id == joinId || (msg.answer && msg.answer.join_id == joinId)
            "
            :key="msg.count"
            :msg="msg"
            :role-name="roleName"
          ></msg-item>
        </template>
      </overlay-scrollbars>
      <div class="vhsaas-chat__body__bottom-tip-box">
        <div
          v-show="badgeNumber !== 0 && isHasUnreadNormalMsg"
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
      :chat-list="chatList"
      :chat-login-status="chatLoginStatus"
      :input-status="inputStatus"
      @chatTextareaHeightChange="chatTextareaHeightChange"
      @performScroll="performScroll"
      @onOnlyMine="onOnlyMine"
      @onInputStatus="onInputStatus"
    ></chat-operator>
  </div>
</template>

<script>
  import ChatOperator from './components/chat-operator';
  import MsgItem from './components/msg-item';
  import { textToEmoji } from '@/packages/chat/src/js/emoji';
  import { useRoomBaseServer, useQaServer, useChatServer } from 'middle-domain';
  export default {
    name: 'VmpQa',
    components: {
      ChatOperator,
      MsgItem
    },
    data() {
      return {
        chatList: [],
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
        osInstance: null,
        // 滚动条状态 end
        badgeNumber: 0, // 未读消息数量
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
      roomId() {
        return this.watchInitData.interact.room_id;
      },
      webinarId() {
        return this.watchInitData.webinar.id;
      },
      isEmbed() {
        return this.embedObj.embed || this.embedObj.embedVideo;
      }
    },
    watch: {},
    mounted() {
      this.scrollInit();
      this.listenEvents();
      this.getQaHistoryMsg();
      // const userInfo = this.$VhallStorage.get('userInfo', 'local')
      // this.logedIn = (userInfo && userInfo.length == undefined) || this.isEmbed
    },
    filters: {},
    methods: {
      listenEvents() {
        const qaServer = useQaServer();
        qaServer.$on(qaServer.Events.QA_CREATE, msg => {
          msg.data.content = this.emojiToText(msg.data.content);
          this.chatList.push(msg.data);
        });
        qaServer.$on(qaServer.Events.QA_COMMIT, msg => {
          msg.data.content = this.emojiToText(msg.data.content);
          this.chatList.push(msg.data);
        });
      },
      initInputStatus() {
        this.inputStatus.disable = this.isBanned || this.allBanned;
        if (this.isBanned) {
          // TODO待翻译
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
        if (this.configList['ui.show_chat_without_login'] == '0') {
          if (this.$VhallStorage.get('userInfo', 'local') || this.isEmbed) {
            // 嵌入或者未登录并且需要登录
            this.chatLoginStatus = false;
          } else {
            // 非嵌入并或者是没有登录
            this.chatLoginStatus = true;
            this.inputStatus.placeholder = '';
          }
        } else {
          // 不需要登录
          this.chatLoginStatus = false;
        }
      },
      // 获取历史消息
      getQaHistoryMsg() {
        const params = {
          room_id: this.roomId
        };
        // 如果是回放，需要传回放id
        if (this.watchInitData.webinar.type == 5 && this.watchInitData.switch.switch_id) {
          params.webinar_switch_id = this.watchInitData.switch.switch_id;
        }
        useQaServer()
          .getHistoryQaMsg(params)
          .then(res => {
            console.warn(res, '历史问答记录');
            const list = res.data.list.map(h => {
              return { ...h, content: this.emojiToText(h.content) };
            });
            this.chatList = list;
            setTimeout(() => {
              this.isInitEnd = true;
            }, 500);
          });
      },
      emojiToText(content) {
        return textToEmoji(content)
          .map(c => {
            return c.msgType == 'text'
              ? c.msgCont
              : `<img width="24" src="${c.msgImage}" border="0" />`;
          })
          .join(' ');
      },
      chatTextareaHeightChange(operatorHieght) {
        this.operatorHieght = operatorHieght;
        this.$refs.chatQaOperator.overlayScrollbar.update();
      },
      scrollInit() {
        this.osInstance = this.$refs.osComponentRef.osInstance();
        const that = this;
        this.osComponentOptions.callbacks = {
          onHostSizeChanged: function () {
            if (that.doScroll) {
              that.performScroll();
            }
          },
          onContentSizeChanged: function () {
            if (that.doScroll) {
              that.performScroll();
            }
          },
          onScroll: that.setDoScroll,
          onInitialized: that.setDoScroll,
          onOverflowChanged: function (e) {
            if (e.y) {
              that.performScroll();
            }
          },
          onScrollStop: this.handleScrollStop
        };
        this.osInstance.options(this.osComponentOptions);
      },
      setDoScroll() {
        this.$nextTick(() => {
          if (!this.animationRunning) {
            this.doScroll = this.osInstance.scroll().ratio.y === 1;
          } else {
            this.doScroll = true;
          }
        });
      },
      performScroll() {
        this.$nextTick(() => {
          this.animationRunning = true;
          this.osInstance.scrollStop().scroll({ y: '100%' }, 250, 'linear', () => {
            this.animationRunning = false;
          });
        });
      },
      scrollToTarget() {
        this.animationRunning = true;
        this.osInstance.scrollStop().scroll(
          {
            el: this.osInstance.getElements().content.children[
              this.chatList.length - this.badgeNumber
            ],
            block: { y: 'end' }
          },
          250,
          'linear',
          () => {
            this.animationRunning = false;
            this.badgeNumber = 0;
            this.isHasUnreadNormalMsg = false;
          }
        );
      },
      handleScrollStop() {
        if (this.osInstance.scroll().ratio.y === 1) {
          this.badgeNumber = 0;
          this.isHasUnreadNormalMsg = false;
        }
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
