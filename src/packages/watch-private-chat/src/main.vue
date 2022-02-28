<template>
  <div class="vmp-watch-private-chat">
    <!--消息区域-->
    <div class="private-chat-content" :style="{ height: 'calc(100% - ' + operatorHeight + 'px)' }">
      <overlay-scrollbars
        ref="chatContent"
        :options="overlayScrollBarsOptions"
        style="height: 100%"
      >
        <template v-for="msg in chatList">
          <msg-item :key="msg.count" :msg="msg" :role-name="roleName"></msg-item>
        </template>
      </overlay-scrollbars>
      <div class="private-chat-content__tip-box">
        <div
          v-show="unReadMessageCount !== 0 && isHasUnreadNormalMsg"
          class="private-chat-content__tip-box-content"
          @click="scrollToTarget"
        >
          {{ tipMsg }}
          <span class="vh-iconfont vh-d-arrow-down"></span>
        </div>
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
      @chatTextareaHeightChange="handleHeightChange"
      @performScroll="performScroll"
      @needLogin="handleLogin"
    ></chat-operate>
  </div>
</template>

<script>
  import defaultAvatar from '@/packages/chat/src/img/my-dark@2x.png';
  import msgItem from './components/msg-item';
  import chatOperate from './components/chat-operate';
  import { useRoomBaseServer, useChatServer, useMsgServer } from 'middle-domain';
  import { textToEmoji } from '@/packages/chat/src/js/emoji';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpWatchPrivateChat',
    components: {
      msgItem,
      chatOperate
    },
    data() {
      return {
        defaultAvatar,
        //私聊的列表 todo 假数据待移除，由domain维护
        chatList: [],
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
          placeholder: '参与聊天'
        },
        //是否是初始化私聊tab todo 预留
        isFirstPrivateChat: false,
        //最新的消息
        latestMessage: {},
        //用户角色
        roleName: '',
        //配置信息
        configList: {},
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
        roomId: ''
      };
    },
    watch: {
      chatList: {
        deep: true,
        handler() {
          // 如果当前自定义菜单显示的是私聊，return
          if (this.isFirstPrivateChat) {
            this.isFirstPrivateChat = false;
            return;
          }
          // 如果当前自定义菜单显示的非私聊，显示小红点 todo 信令发送事件给tab
        }
      },
      configList: {
        deep: true,
        handler(val, oldVal) {
          // 如果滚动条未滚动至最底部
          if (val['ui.watch_record_no_chatting'] != oldVal['ui.watch_record_no_chatting']) {
            this.initInputStatus();
          }
          if (val['ui.show_chat_without_login'] != oldVal['ui.show_chat_without_login']) {
            this.initLoginStatus();
          }
        }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.chatServer = useChatServer();
      this.msgServer = useMsgServer();
    },
    computed: {
      //是否被禁言
      isBanned() {
        return this.chatServer.state.banned;
      },
      //是否是全体禁言
      allBanned() {
        return this.chatServer.state.allBanned;
      }
    },
    mounted() {
      this.initViewData();
      this.listenEvents();
      this.initInputStatus();
      this.initLoginStatus();
      this.scrollInit();
      this.getHistoryMsg();
    },
    methods: {
      //初始化视图数据
      initViewData() {
        const { configList = {}, watchInitData = {}, embedObj = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        const { embed = false } = embedObj;
        this.roomId = interact.room_id;
        this.configList = configList;
        this.roleName = join_info.role_name;
        this.isEmbed = embed;
        this.joinInfo = join_info;
        this.webinar = webinar;
        this.watchInitData = watchInitData;
      },
      // 初始化聊天登录状态
      initLoginStatus() {
        if (this.configList['ui.show_chat_without_login'] == '0') {
          if (this.joinInfo || this.isEmbed) {
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
      //初始化输入框状态
      initInputStatus() {
        this.inputStatus.disable = this.isBanned || this.allBanned;
        if (this.isBanned) {
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        } else if (this.allBanned) {
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        } else {
          this.inputStatus.placeholder = this.$t('chat.chat_1021');
        }
        const isVod = this.webinar.type == 5 && this.watchInitData.paas_record_id;
        // 判断控制台回放禁言状态
        if (isVod && this.configList && this.configList['ui.watch_record_no_chatting'] == 1) {
          this.inputStatus.disable = true;
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        }
      },
      //处理唤起登录
      handleLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      //初始化滚动
      scrollInit() {
        this.osInstance = this.$refs.chatContent.osInstance();
        const that = this;
        this.overlayScrollBarsOptions.callbacks = {
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
        this.osInstance.options(this.overlayScrollBarsOptions);
      },
      //事件监听
      listenEvents() {
        this.chatServer.$on('receivePrivateMsg', msg => {
          if (msg.isFirstPrivateChat) {
            this.isFirstPrivateChat = true;
          }
          this.chatList.push(msg);
          if (this.osInstance.scroll().max.y > -1 && this.osInstance.scroll().ratio.y !== 1) {
            // 如果是除回复、 @之外的普通消息
            this.isHasUnreadNormalMsg = true;
            this.tipMsg = `有${++this.unReadMessageCount}条未读消息`;
          }
        });
      },
      //获取历史的私聊消息
      getHistoryMsg() {
        const params = {
          room_id: this.roomId
        };
        this.chatServer.getPrivateChatHistoryList(params).then(res => {
          console.warn(res, '历史私聊记录');
          const list = res.data.list.map(h => {
            return { ...h, content: this.emojiToText(h.content) };
          });
          this.chatList = list;
        });
      },
      //表情转换
      emojiToText(value) {
        return textToEmoji(value)
          .map(c => {
            return c.msgType == 'text'
              ? c.msgCont
              : `<img width="24" src="${c.msgImage}" border="0" />`;
          })
          .join(' ');
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
      //滚动到指定目标处
      scrollToTarget() {
        const _this = this;
        this.animationRunning = true;
        this.osInstance.scrollStop().scroll(
          {
            el: this.osInstance.getElements().content.children[
              _this.chatList.length - _this.unReadMessageCount
            ],
            block: { y: 'end' }
          },
          250,
          'linear',
          () => {
            _this.animationRunning = false;
            _this.unReadMessageCount = 0;
            _this.isHasUnreadNormalMsg = false;
          }
        );
      },
      //响应高度变化
      handleHeightChange(height) {
        this.operatorHieght = height;
        this.$refs.privateChatOperator.overlayScrollbar.update();
      },
      //执行滚动处理
      performScroll() {
        this.$nextTick(() => {
          this.animationRunning = true;
          this.osInstance.scrollStop().scroll({ y: '100%' }, 250, 'linear', () => {
            this.animationRunning = false;
          });
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-watch-private-chat {
    position: relative;
    width: 100%;
    //flex: 1;
    height: calc(100% - 20px);
    .private-chat-content {
      position: relative;
      &:last-child {
        padding-bottom: 20px;
      }
      &__tip-box {
        position: absolute;
        z-index: 1;
        bottom: 5px;
        left: 50%;
        transform: translate(-50%, 0);
      }
      &__tip-box-content {
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
