<template>
  <div class="vmp-send-box" :class="[className]">
    <div class="vmp-send-box__content">
      <!--用户个人信息，提现，修改头像-->
      <div class="user-avatar-wrap" v-if="!isEmbed && isShowUser">
        <div class="user-avatar-wrap__avatar" @click="showUserPopup">
          <img class="avatar-img" :src="avatar" srcset />
        </div>
      </div>
      <div class="content-input">
        <template v-if="chatShow">
          <div
            class="content-input__placeholder"
            v-if="isNeedLogin && !isLogin && !noChatLogin && !isEmbed"
            @click="login"
          >
            <span class="login-btn">{{ $t('nav.nav_1005') }}</span>
            {{ $t('chat.chat_1043') }}
          </div>
          <div
            v-else
            class="content-input__update-chat content-input__placeholder"
            @click="saySomething"
          >
            <span v-if="isBanned">
              {{ $t('chat.chat_1006') }}
            </span>
            <span v-else-if="isAllBanned">{{ $t('chat.chat_1044') }}</span>
            <span v-else-if="isvod">{{ $t('chat.chat_1079') }}</span>
            <!-- 你已被禁言  /  全体禁言中  -->
            <span v-else>{{ $t('chat.chat_1042') }}</span>
          </div>
        </template>
      </div>
      <span @click="showMyQA" :class="{ 'only-my': isShowMyQA }" v-if="currentTab == 'qa'">
        {{ $t('chat.chat_1018') }}
      </span>
      <div class="interact-wrapper" v-if="[3, '3'].includes(currentTab)">
        <!-- 上麦入口 -->
        <div class="icon-wrapper" v-show="isShowMicBtn">
          <!-- 上麦 -->
          <div
            v-if="isAllowhandup || isSpeakOn"
            style="position: relative"
            auth="{ 'ui.hide_reward': 0 }"
          >
            <i
              v-if="!handUpStatus"
              class="vh-saas-iconfont vh-saas-line-shangmai"
              @click="$refs.handup.openConnectPop()"
            ></i>
            <i
              v-else
              class="vh-saas-iconfont vh-saas-line-shangmaizhong"
              @click="$refs.handup.openConnectPop()"
            ></i>
            <span class="red-dot" v-if="handUpStatus"></span>
            <Handup
              ref="handup"
              @handupLoading="
                s => {
                  handUpStatus = s;
                }
              "
            />
          </div>
        </div>
        <div class="icon-wrapper" v-if="!groupInitData.isInGroup">
          <!-- 底部互动工具组件 comChatWap-->
          <vmp-air-container cuid="comChatWap"></vmp-air-container>
        </div>
      </div>
    </div>
    <chat-wap-input-modal
      ref="chatWapInputModal"
      @sendMsg="sendMessage"
      :showTabType="currentTab"
    ></chat-wap-input-modal>
  </div>
</template>

<script>
  import chatWapInputModal from './chatWapInputModal';
  import EventBus from '../js/Events';
  import { emojiToPath } from '@/packages/chat/src/js/emoji';
  import {
    useGroupServer,
    useRoomBaseServer,
    useChatServer,
    useMsgServer,
    useUserServer,
    useMicServer
  } from 'middle-domain';
  import Handup from './handup.vue';

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
      deviceType: {
        require: true,
        default: () => {
          return {
            audio: false,
            video: false
          };
        }
      },
      //当前登录人是否正在上麦
      onlineMicStatus: {
        type: Boolean,
        default: false
      }
    },
    filters: {
      //表情转换为图片地址
      emojiToPath(index) {
        return emojiToPath(index);
      }
    },
    components: {
      chatWapInputModal,
      Handup
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
        time: 0,
        //是否发送频繁，等待中
        waitTimeFlag: true,
        waitTime: 1,
        //是否展示用户头像
        isShowUser: false,
        connectMicShow: false, // 连麦入口按钮
        disabledAll: false, // 全员禁言
        //活动信息
        webinar: {},
        //是否已经登录
        isLogin: false,
        //配置列表
        configList: {},
        //用户头像
        avatar: require('../img/default_avatar.png'),
        handUpStatus: false,
        //只看我的问答
        isShowMyQA: false
      };
    },
    computed: {
      device_status() {
        // 设备状态  0未检测 1可以上麦 2不可以上麦
        return this.$domainStore.state.mediaCheckServer.deviceInfo.device_status;
      },
      // 是否开启举手
      isAllowhandup() {
        let status = this.$domainStore.state.roomBaseServer.interactToolStatus.is_handsup;
        return status;
      },
      // 是否是上麦状态
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      },
      //分组讨论的信息
      groupInitData() {
        const { groupInitData = {} } = this.groupServer.state;
        return groupInitData;
      },
      //是否需要登录
      isNeedLogin() {
        let needLogin = true;
        if (['', null, void 0].includes(this.configList['ui.show_chat_without_login'])) {
          return needLogin;
        }
        return [0, '0'].includes(this.configList['ui.show_chat_without_login']);
      },
      isEmbed() {
        // 是不是音视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      //当前登录人信息
      joinInfo() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {} } = watchInitData;
        return join_info;
      },
      //是否展示互动上麦按钮
      isShowMicBtn() {
        //todo 注意分组里的这个is_banned字段，并没有跟随禁言、解除禁言事件及时更新，所以在分组里，wap改用聊天的isBanned字段
        return (
          this.webinar.type == 1 &&
          this.device_status != 2 &&
          [
            this.connectMicShow &&
              !this.isAllBanned &&
              !this.isBanned &&
              !this.groupInitData.isInGroup,
            this.onlineMicStatus && !this.groupInitData.isInGroup,
            this.groupInitData.isInGroup && !this.isBanned
          ].some(val => !!val)
        );
      },
      //是否回放禁言
      isvod() {
        return this.webinar.type == 5 && this.configList['ui.watch_record_no_chatting'] == 1;
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
      this.msgServer = useMsgServer();
      this.userServer = useUserServer();
    },
    created() {
      if (this.isSpeakOn && useChatServer().state.allBanned) {
        useMicServer().speakOff();
      }
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

      useMicServer().$on('vrtc_connect_open', msg => {
        if (parseInt(this.device_status) === 1) {
          this.$toast(this.$t('interact.interact_1003'));
        }
        this.connectMicShow = true;
      });

      useMicServer().$on('vrtc_connect_close', msg => {
        if (parseInt(this.device_status) === 1) {
          this.$toast(this.$t('interact.interact_1002'));
        }
        this.connectMicShow = false;
      });
    },
    methods: {
      showMyQA() {
        this.isShowMyQA = !this.isShowMyQA;
        this.$emit('showMyQA', this.isShowMyQA);
      },
      //初始化视图数据
      initViewData() {
        const { configList = {}, watchInitData = {} } = this.roomBaseServer.state;
        const { webinar = {} } = watchInitData;
        this.webinar = webinar;
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
          this.avatar = userInfo.avatar || require('../img/default_avatar.png');
        } else {
          this.isLogin = false;
          this.isShowUser = false;
        }
      },
      // eventBus监听
      eventListener() {
        // 直播结束不展示连麦入口
        this.msgServer.$on('live_over', e => {
          console.log(e);
          this.connectMicShow = false;
        });

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
          (this.groupInitData.isBanned && this.groupInitData.isInGroup) ||
          this.isvod
        ) {
          return;
        }

        if (this.currentTab == 3) {
          if (this.waitTimeFlag) {
            this.$refs.chatWapInputModal.openModal();
          } else {
            this.$toast(this.$t('chat.chat_1068', { n: this.waitTime }));
          }
        } else if (this.currentTab == 'qa' && this.time != 0) {
          this.$toast(this.$t('chat.chat_1080', { n: this.time }));
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
      //登录
      login() {
        this.$emit('login');
      },
      //发送消息
      sendMessage(value = '') {
        //如果当前是问答tab
        if (this.currentTab == 'qa') {
          this.$emit('sendQa', value);
          this.timing();
          return;
        }
        if (this.currentTab == 'private') {
          this.$emit('sendPrivate', value);
          return;
        }
        const chatServer = useChatServer();
        const curmsg = chatServer.createCurMsg();
        //将文本消息加入消息体
        curmsg.setText(value);
        //发送消息
        console.log('msg', curmsg);
        chatServer.sendMsg(curmsg);
        //清除当前消息
        chatServer.clearCurMsg();
        this.$emit('sendEnd');
      },
      // 打开个人中心
      showUserPopup() {
        this.$emit('showUserPopup');
      },
      timing() {
        this.time = 15;
        const timer = setInterval(() => {
          --this.time;
          if (this.time == 0) {
            clearInterval(timer);
          }
        }, 1000);
      }
    }
  };
</script>
<style lang="less" scoped>
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
          .vh-saas-iconfont,
          .vh-iconfont {
            font-size: 47px;
            color: #666666;
          }

          .red-dot {
            position: absolute;
            right: 0;
            top: 0;
            width: 10px;
            height: 10px;
            background-color: #ff3030;
            border-radius: 10px;
          }
        }
      }
      .only-my {
        color: #fb3a32;
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
