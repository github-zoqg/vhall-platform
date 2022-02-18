<template>
  <div class="vmp-send-box" :class="[className]">
    <div class="vmp-send-box__content">
      <!--用户个人信息，提现，修改头像-->
      <div class="user-avatar-wrap" v-if="!isEmbed && isShowUser">
        <div class="user-avatar-wrap__avatar">
          <img class="avatar-img" :src="avatar" srcset />
        </div>
      </div>
      <div class="content-input">
        <template v-if="chatShow">
          <div
            class="content-input__placeholder"
            v-if="isNeedLogin && !isLogin && !noChatLogin"
            @click="login"
          >
            <span class="login-btn">登录</span>
            参与互动
          </div>
          <div
            v-else
            class="content-input__update-chat content-input__placeholder"
            @click="saySomething"
          >
            <span
              v-if="
                (isBanned && !groupInitData.isInGroup) ||
                (groupInitData.isBanned && groupInitData.isInGroup)
              "
            >
              您已被禁言
            </span>
            <span v-else-if="isAllBanned">全体禁言中</span>
            <!-- 你已被禁言  /  全体禁言中  -->
            <span v-else>说点什么</span>
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
          <!-- 礼物 -->
          <div class="icon-wrapper liwu"></div>
          <!-- 打赏 -->
          <div class="icon-wrapper" v-if="!isEmbed"></div>
          <!-- 邀请卡 -->
          <!-- 点赞-->
          <div class="icon-wrapper"></div>
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
    useMsgServer
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
      },
      //设备状态
      deviceStatus() {
        return this.mediaCheckServer.state.isBrowserNotSupport;
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
        // 若用户已经登录
        if (window.sessionStorage.getItem('token')) {
          this.isLogin = true;
          // 若用户已经登录过，获取userInfo
          const userVo = sessionStorage.getItem('userInfo')
            ? JSON.parse(sessionStorage.getItem('userInfo'))
            : {};
          if (userVo) {
            this.isShowUser = true;
            this.avatar = userVo.avatar || require('../images/default_avatar.png');
          } else {
            this.isShowUser = false;
          }
        } else {
          this.isShowUser = false;
        }
      },
      // eventBus监听 todo 这里也需要接入domain,检查下事件是否仍然可用
      eventListener() {
        // 直播结束不展示入口
        this.msgServer.$on('live_over', e => {
          console.log(e);
          this.connectMicShow = false;
        });
        // 接收开启连麦消息事件
        this.msgServer.$on('vrtc_connect_open', msg => {
          console.log(msg);
          this.connectMicShow = true;
        });
        // 接收关闭连麦消息事件
        this.msgServer.$on('vrtc_connect_close', msg => {
          console.log(msg);
          this.connectMicShow = false;
        });

        //todo 这个事件应该由chatServer监听的事件的相关回调抛出
        EventBus.$on('refreshSendBox', () => {
          this.$forceUpdate();
        });
        // 头像更新
        this.msgServer.$on('CHAT_AVATAR_CHANGE', avatar => {
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
            this.$message(`当前活动火爆，请您在${this.waitTime}秒后再次发言`);
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
        // 按在线人数 计算- 发送聊天的延时
        this.waitTime = this.delayTime(0, 1);
        this.waitTimeFlag = this.waitTime <= 0;
        this.waitTimeSet = window.setInterval(() => {
          if (this.waitTime <= 1) {
            this.waitTime = 1;
            window.clearInterval(this.waitTimeSet);
            this.waitTimeFlag = true;
          }
          this.waitTime--;
        }, 1000);
        // 要发送的数据
        const data = { type: 'text', text_content: value };
        const context = {
          nickname: this.joinInfo.nickname, // 昵称
          avatar: this.isEmbed ? '' : this.joinInfo.avatar, // 头像 微信登录  有时会被服务端获取个人信息 先兼容
          role_name: 2, // 角色 1主持人2观众3助理4嘉宾
          event: JSON.stringify(data),
          source: 'mobile'
        };

        // 关键词过滤标识
        const filterStatus = this.chatServer.checkHasKeyword(true, value);

        // 发送socket消息  当关键词列表中不包含当前要发的消息时候，进行发送(主意这里仅是把消息保存到了服务器，本地并没有消息)
        if (filterStatus) {
          this.chatServer.sendMsg({ data, context });
        }
        // 观众端会显示回显，会过滤掉socket中自己的信息
        let chatContext = sessionStorage.getItem('vhall_chat_context');
        chatContext = chatContext ? JSON.parse(chatContext) : {};
        let item = {};
        if (this.chatList.length) {
          item = this.chatList[this.chatList.length - 1];
        }
        data.text_content = textToEmojiText(data.text_content);
        const tempData = new Msg({
          avatar: getAvatar(chatContext.avatar),
          nickName: chatContext.nickname,
          type: 'text',
          content: data,
          sendId: this.joinInfo.third_party_user_id,
          sendTime: formatTime(new Date()),
          roleName: 2,
          client: chatContext.device_type == 2 ? 'pc' : 'mobile',
          showTime: handleTime(item.sendTime)
        });
        filterStatus && this.chatList.push(tempData);
      }
    }
  };
</script>
<style lang="less">
  .vmp-send-box {
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
    bottom: 0;
    width: 100%;
    position: fixed;
    transition: 0.35s all;
    z-index: 22;
    &__content {
      width: 100%;
      height: 120px;
      background-color: #ffffff;
      padding: 0 30px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      .content-input {
        flex: 1;
        display: flex;
        align-items: center;
        .content-input__placeholder {
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
      .content-input__update-chat ::v-deep {
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
    }
  }
  .user-avatar-wrap {
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
  .user-avatar-wrap__avatar {
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
