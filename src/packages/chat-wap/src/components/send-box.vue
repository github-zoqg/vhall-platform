<template>
  <div
    ref="indexUpdate"
    class="send-msg-wrapper"
    :class="[className, { 'send-msg-wrapper-top': showEmojiArr }]"
  >
    <div class="send-msg">
      <!--用户个人信息，提现，修改头像-->
      <div class="user-avatar-wrap" v-if="!isEmbed && isShowUser">
        <div class="user-avatar-wrap__avatar" @click="showUserPopup">
          <img class="avatar-img" :src="avatar" srcset />
        </div>
      </div>
      <div class="need-input">
        <template v-if="chatShow">
          <div
            class="content-input__placeholder"
            v-if="isNeedLogin && !isLogin && !noChatLogin"
            @click="login"
          >
            <span class="login-btn">{{ $t('nav.nav_1005') }}</span>
            {{ $t('chat.chat_1043') }}
          </div>
          <div v-else class="update-chat placeholder" @click="saySomething">
            <span
              v-if="
                (isBanned && !groupInitData.isInGroup) ||
                (groupInitData.isBanned && groupInitData.isInGroup)
              "
            >
              {{ $t('chat.chat_1006') }}
            </span>
            <span v-else-if="isAllBanned">{{ $t('chat.chat_1044') }}</span>
            <!-- 你已被禁言  /  全体禁言中  -->
            <span v-else>{{ $t('chat.chat_1042') }}</span>
          </div>
        </template>
      </div>
      <div class="interact-wrapper">
        <!-- 上麦入口 -->
        <div
          class="icon-wrapper"
          v-show="
            (webinar.type == 1 &&
              deviceStatus != 2 &&
              connectMicShow &&
              !disabledAll &&
              !isBanned &&
              !groupInitData.isInGroup) ||
            (onlineMicStatus && !groupInitData.isInGroup) ||
            (!groupInitData.isBanned && groupInitData.isInGroup)
          "
        ></div>
        <div class="icon-wrapper" v-if="!groupInitData.isInGroup">
          <!-- 底部互动工具组件 comChatWap-->
          <vmp-air-container cuid="comChatWap"></vmp-air-container>
        </div>
      </div>
    </div>
    <chat-wap-input-modal ref="chatWapInputModal" @sendMsg="sendMessage"></chat-wap-input-modal>
  </div>
</template>
<script>
  import chatWapInputModal from './chatWapInputModal';
  import EventBus from '../js/Events';
  import { emojiToPath, textToEmojiText } from '@/packages/chat/src/js/emoji';
  import {
    useGroupServer,
    useRoomBaseServer,
    useChatServer,
    useMediaCheckServer,
    useMsgServer,
    useUserServer
  } from 'middle-domain';
  import getAvatar from '@/packages/chat/src/js/get-avatar';
  import Msg from '@/packages/chat/src/js/msg-class';
  import { formatTime, handleTime } from '@/packages/chat/src/js/handle-time';

  export default {
    props: {
      noChatLogin: {
        // 是否免登陆
        type: Boolean,
        default: false
      },
      currentTab: {
        type: [String, Number],
        default: ''
      },
      className: {
        required: false,
        type: Object,
        default: () => {
          return {};
        }
      },
      chatShow: {
        type: Boolean,
        default: true
      },
      isAllBanned: {
        type: Boolean,
        default: false
      },
      isBanned: {
        type: Boolean,
        default: false
      },
      isHandsUp: {
        type: Boolean,
        default: false
      },
      onlineMicStatus: {
        type: Boolean,
        default: false
      },
      deviceType: {
        require: true,
        default: () => {
          return {
            audio: false,
            video: false
          };
        }
      }
    },
    filters: {
      //表情转换为图片地址
      emojiToPath(index) {
        return emojiToPath(index);
      }
    },
    components: {
      chatWapInputModal
    },
    data() {
      const { state: roomBaseState } = this.roomBaseServer;
      return {
        roomBaseState,
        //定时器
        timer: {},
        //是否可以发送消息，发送限频
        canSend: true,
        //限频时间
        time: 15,
        //是否发送频繁，等待中
        waitTimeFlag: true,
        waitTime: 1,
        //是否展示用户头像
        isShowUser: false,
        connectMicShow: false, // 连麦入口按钮
        disabledAll: false, // 全员禁言
        //是否是嵌入端
        isEmbed: false,
        //活动信息
        webinar: {},
        //是否已经登录
        isLogin: false,
        //配置列表
        configList: {},
        //用户头像
        avatar: require('../images/default_avatar.png')
      };
    },
    computed: {
      //分组讨论的信息
      groupInitData() {
        const { groupInitData = {} } = this.groupServer.state;
        return groupInitData;
      },
      //是否需要登录
      isNeedLogin() {
        return [0, '0'].includes(this.configList['ui.show_chat_without_login']);
      },
      //当前登录人信息
      joinInfo() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {} } = watchInitData;
        return join_info;
      }
    },
    watch: {
      isAllBanned: {
        handler() {
          this.disabledAll = this.isAllBanned;
        }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
      this.chatServer = useChatServer();
      this.mediaCheckServer = useMediaCheckServer();
      this.msgServer = useMsgServer();
      this.userServer = useUserServer();
    },
    created() {
      this.initViewData();
    },
    mounted() {
      // 初始开启允许连麦，非组内判断禁言，全员禁言
      this.connectMicShow = this.isHandsUp;
      // 初始全员禁言状态
      this.disabledAll = this.isAllBanned;
      // 判断登录
      this.checkIsLogin();
      // eventBus监听
      this.eventListener();
    },
    methods: {
      //初始化视图数据
      initViewData() {
        const { configList = {}, watchInitData = {}, embedObj = {} } = this.roomBaseServer.state;
        const { webinar = {} } = watchInitData;
        const { embed = false } = embedObj;
        console.log(this.roomBaseServer, 'roomBaseServer');
        this.webinar = webinar;
        this.isEmbed = embed;
        this.configList = configList;
      },
      // 判断登录
      checkIsLogin() {
        const { userInfo = {} } = this.userServer.state;
        // 若用户已经登录
        if (Object.keys(userInfo).length) {
          this.isLogin = true;
          // 若用户已经登录过，获取userInfo
          this.isShowUser = true;
          this.avatar = userInfo.avatar || require('../images/default_avatar.png');
        } else {
          this.isShowUser = false;
        }
        this.vantFaildPlacer =
          this.currentTab == 'private'
            ? this.$t('chat.chat_1045')
            : this.currentTab == 'qa'
            ? this.$t('chat.chat_1066')
            : this.$t('chat.chat_1042');
      },
      // eventBus监听
      eventListener() {
        // 直播结束不展示入口
        EventBus.$on('live_over', e => {
          console.log(e);
          this.connectMicShow = false;
        });
        // 接收开启连麦消息事件
        EventBus.$on('vrtc_connect_open', msg => {
          console.log(9999999, msg);
          this.connectMicShow = true;
        });
        // 全员禁言
        EventBus.$on('disable_all', val => {
          console.log(val);
          this.disabledAll = true;
        });
        // 全员取消禁言
        EventBus.$on('permit_all', val => {
          console.log(val);
          this.disabledAll = false;
        });
        // 接收关闭连麦消息事件
        EventBus.$on('vrtc_connect_close', msg => {
          console.log(msg);
          this.connectMicShow = false;
        });
        // EventBus.$on('vrtc_connect_success', (msg) => {
        //   this.connectMicShow = true;
        // });

        EventBus.$on('refreshSendBox', () => {
          this.$forceUpdate();
        });
        EventBus.$on('sendMsg', (inputValue, showTabType) => {
          if (showTabType == 'qa') {
            this.canSend = false;
            this.timmer = window.setInterval(() => {
              this.time--;
              if (this.time == 0) {
                this.time = 15;
                window.clearInterval(this.timmer);
                this.canSend = true;
              }
            }, 1000);
          } else if (showTabType == 3 || showTabType == 4) {
            // 按在线人数 计算- 发送聊天的延时
            this.waitTime = this.delayTime(this.localRoomInfo.OnlineNum, 1);
            if (this.waitTime <= 0) {
              this.waitTimeFlag = true;
            } else {
              this.waitTimeFlag = false;
            }
            this.waitTimeSet = window.setInterval(() => {
              if (this.waitTime <= 1) {
                this.waitTime = 1;
                window.clearInterval(this.waitTimeSet);
                this.waitTimeFlag = true;
              }
              this.waitTime--;
            }, 1000);
          }
        });
        EventBus.$on('blurEmojie', msg => {
          console.log(msg);
          if (this.showEmojiArr) {
            this.showEmojiArr = false;
          }
        });
        EventBus.$on('closeIcon', () => {
          if (this.showEmojiArr) {
            this.showEmojiArr = false;
          }
        });
        EventBus.$on('zIndexShowFalse', value => {
          /* 同下面  无使用祖先元素   先让其元素进行层级修改后根据真实状况再次修改 */
          this.$refs.indexUpdate.style.zIndex = '21';
          console.log(value);
        });
        EventBus.$on('zIndexShow', value => {
          if (value) {
            this.$refs.indexUpdate.style.zIndex = '21';
          } else {
            this.$refs.indexUpdate.style.zIndex = '22';
          }
        });
        // 头像更新
        EventBus.$on('CHAT_AVATAR_CHANGE', avatar => {
          this.avatar = avatar;
        });
      },
      saySomething() {
        if (
          (this.isBanned && !this.groupInitData.isInGroup) ||
          this.isAllBanned ||
          (this.groupInitData.isBanned && this.groupInitData.isInGroup)
        ) {
          return;
        }

        if (this.currentTab == 3) {
          if (this.waitTimeFlag) {
            this.$refs.chatWapInputModal.openModal();
          } else {
            this.$message(this.$t('chat.chat_1068', this.waitTime));
          }
        } else {
          this.$refs.chatWapInputModal.openModal();
        }
      },
      //计算延迟时间
      delayTime(n, o) {
        n = n || 0;
        o = o || 1;
        let result = 0;
        if (n <= 1000) {
          result = 0;
        } else if (n <= 10000) {
          // 大于1千，小于1万
          result = n / 1000;
        } else if (n <= 50000) {
          // 大于1万，小于5万
          result = 20 + (n - 10000) / 1000;
        } else if (n > 50000) {
          // 大于5万
          result = 60;
        }
        return Math.floor(o * result);
      },
      //登录 todo 发送信令唤起登录
      login() {},
      //发送消息
      sendMessage(value = '') {
        // 关键词过滤标识
        const filterStatus = this.chatServer.checkHasKeyword(true, value);
        // 发送socket消息  当关键词列表中不包含当前要发的消息时候，进行发送(主意这里仅是把消息保存到了服务器，本地并没有消息)
        if (filterStatus) {
          const chatServer = useChatServer();
          const curmsg = chatServer.createCurMsg();
          //将文本消息加入消息体
          curmsg.setText(value);
          //发送消息
          chatServer.sendMsg(curmsg);
          //清除当前消息
          chatServer.clearCurMsg();
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  .vh-chat-InputArea {
    width: 100%;
    height: 196px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    z-index: 900;
    input {
      position: absolute;
      left: 0;
      right: 100px;
    }
    p {
      position: absolute;
      right: 0;
      top: 0;
      width: 80px;
      display: inline-block;
      text-align: center;
      height: 80px;
      background: #fc5659;
      margin-left: 24px;
      border-radius: 50%;
      vertical-align: baseline;
      padding: 25px 6px 20px 0;
      color: #fff;
      overflow: hidden;
      i {
        font-size: 36px;
      }
    }
  }
  .send-msg-wrapper {
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      /* prettier-ignore */
      border-bottom: 1PX solid #e2e2e2;
      left: 0;
      top: 0;
      transform-origin: 0 bottom;
      opacity: 1;
    }

    position: absolute;
    left: 0;
    bottom: 0px;
    width: 100%;
    position: fixed;
    transition: 0.35s all;
    z-index: 22;
    .enterbase {
      height: 100%;
      width: calc(100% - 50px);
      float: left;
      padding: 0;
      background: #f5f5f5;
    }
    .send-msg {
      width: 100%;
      height: 120px;
      background-color: #ffffff;
      padding: 0 30px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      .need-input {
        flex: 1;
        display: flex;
        align-items: center;
        .emoji {
          margin-right: 10px;
          overflow: hidden;
          height: 100%;
          .iconbiaoqing {
            font-size: 40px;
            color: #a6a6a6;
          }
        }
        .placeholder {
          background-color: #f5f5f5;
          color: #444444;
          border-radius: 40px;
          width: 100%;
          height: 80px;
          line-height: 80px;
          padding: 2px 20px;
          .login-btn {
            padding-left: 10px;
            color: #007aff;
          }
        }
      }
      // add 新增
      .update-chat ::v-deep {
        height: 60px;
        line-height: 60px;
        width: 100%;
        .emoji {
          float: left;
        }
        .van-cell__value {
          padding-top: 4px;
          background: #f5f5f5;
          height: 100%;
          .van-field__body {
            height: 100%;
          }
        }
      }
      .interact-wrapper {
        margin-left: 40px;
        text-align: right;
        height: 40px;
        padding-right: 10px;
        .icon-wrapper {
          color: #666666;
          display: inline-block;
          margin-right: 36px;
          text-align: center;
          &:last-child {
            margin-right: 0;
            font-size: 43px;
          }
          .iconyaoqingka {
            font-size: 44px;
          }
        }
      }
      .sendBox {
        width: 80px;
        display: inline-block;
        text-align: center;
        height: 80px;
        background: #fc5659;
        margin-left: 24px;
        border-radius: 50%;
        vertical-align: baseline;
        padding: 25px 6px 20px 0;
        color: #fff;
        overflow: hidden;
        i {
          font-size: 36px;
        }
      }
      &.v-private {
        .need-input {
          width: 100%;
        }
      }
      &.v-qa {
        .need-input {
          width: 540px;
          margin-right: 30px;
        }
        .send-box {
          padding: 20px 30px;
          &::after {
            content: '';
            position: absolute;
            width: 100%;
            /* prettier-ignore */
            border-bottom: 1PX solid #e2e2e2;
            left: 0;
            top: 0;
            transform-origin: 0 bottom;
            opacity: 1;
          }
          display: flex;
          align-items: center;
          color: #444444;
          .input-wrapper {
            // padding: 19px 20px;
            margin-right: 30px;
            flex: 1;
            background-color: #f5f5f5;
            border-radius: 50px;
            font-size: 30px;
            line-height: 42px;
          }
        }
        .only-my {
          color: #fc5659;
        }
      }
    }
  }
  .user-advatar-panel {
    vertical-align: middle;
    display: inline-flex;
    margin-right: 12px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 100%;
    }
  }
  .user-advatar-box {
    width: 60px;
    height: 60px;
    vertical-align: middle;
    display: inline-flex;
    border-radius: 100%;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 100%;
    }
  }
  .user-advatar-popup {
    box-sizing: border-box;
    padding: 20px 30px 40px 30px;
    .user-menu-item {
      text-align: left;
      margin-top: 0;
      height: 88px;
      line-height: 88px;
      i.iconfont {
        font-size: 48px;
      }
      .user-menu-box {
        display: inline-block;
        vertical-align: middle;
        margin-right: 20px;
      }
      p {
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
  @supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
    .send-msg-wrapper {
      position: absolute;
      bottom: constant(safe-area-inset-bottom);
      bottom: env(safe-area-inset-bottom);
    }
  }
  .send-msg-wrapper-top {
    bottom: 0;
    height: 460px;
    transition: 0.5s all;
    .emoji-box {
      position: absolute;
      width: 100%;
      height: calc(100% - 119px);
      padding: 5px 0 15px 40px;
      box-sizing: border-box;
      left: 0;
      bottom: 0;
      overflow-y: scroll;
      background-color: #ffffff;
      img {
        width: 48px;
        height: 48px;
        margin: 6px;
        float: left;
      }
    }
  }
  .vc-switch ::v-deep {
    display: none !important;
  }
</style>
