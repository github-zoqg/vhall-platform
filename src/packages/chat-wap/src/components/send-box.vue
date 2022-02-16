<template>
  <div
    ref="indexUpdate"
    class="send-msg-wrapper"
    :class="[className, { 'send-msg-wrapper-top': showEmojiArr }]"
  >
    <div
      class="send-msg"
      :class="{
        'v-private': currentTab == 'private',
        'v-qa': currentTab == 'qa'
      }"
    >
      <!--用户个人信息，提现，修改头像-->
      <div class="need-input">
        <template v-if="chatShow">
          <div
            class="placeholder"
            v-if="localRoomInfo.isNeedLogin && !localRoomInfo.isLogin && !noChatLogin"
            @click="login"
          >
            <span class="login-btn">登录</span>
            参与互动
          </div>
          <div v-else class="update-chat placeholder" @click="saySomething">
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
            <span v-else>
              {{ currentTab == 'private' ? '输入私聊内容' : '说点什么' }}
            </span>
          </div>
        </template>
      </div>
      <div class="interact-wrapper" v-if="currentTab == 3">
        <!-- 上麦入口 -->
        <div
          class="icon-wrapper"
          v-show="
            (webinarData.webinar.type == 1 &&
              deviceStatus != 2 &&
              connectMicShow &&
              !disabledAll &&
              !isBanned &&
              !roomBaseState.groupInitData.isInGroup) ||
            (onlineMicStatus && !roomBaseState.groupInitData.isInGroup) ||
            (!roomBaseState.groupInitData.isBanned && roomBaseState.groupInitData.isInGroup)
          "
        ></div>
        <div class="icon-wrapper" v-if="!groupInitData.isInGroup">
          <!-- 礼物 -->
          <div class="icon-wrapper liwu" v-auth="{ 'ui.hide_gifts': 0 }"></div>
          <!-- 打赏 -->
          <div
            class="icon-wrapper"
            v-if="!localRoomInfo.isEmbed"
            v-auth="{ 'ui.hide_reward': 0 }"
          ></div>
          <!-- 邀请卡 -->
          <!-- 点赞-->
          <div class="icon-wrapper" v-auth="{ 'ui.watch_hide_like': 0 }"></div>
        </div>
      </div>
      <template v-if="showInput">
        <p class="sendBox" @click="send">
          <i class="iconfont iconfasong"></i>
        </p>
      </template>
    </div>
    <div v-show="showEmojiArr" class="emoji-box">
      <div class="face-box clearfix">
        <img
          :src="item | emojiToPath"
          @click.stop="inputEmoji(index)"
          v-for="(item, index) in emojiArr"
          :key="index"
        />
      </div>
    </div>

    <div class="vh-chat-InputArea" v-show="showInput">
      <vh-chat v-model="chatValue"></vh-chat>
      <p class="sendBox" @click.stop="send"><i class="iconfont iconfasong"></i></p>
    </div>
  </div>
</template>
<script>
  import vhChat from './wapModalInput';
  import Vue from 'vue';
  const EventBus = new Vue();
  import { faceArr, emojiToPath } from '@/packages/chat/src/js/emoji';
  import { useGroupServer, useRoomBaseServer } from 'middle-domain';


  export default {
    inject: {
      localRoomInfo: {
        from: 'localRoomInfo',
        default: () => ({})
      },
      tabState: {
        from: 'tabState',
        default: () => ({})
      }
    },
    props: {
      joinInfoInGift: {
        required: false
      },
      showInviteCard: {
        default: false
      },
      noChatLogin: {
        // 是否免登陆
        type: Boolean,
        default: false
      },
      totalLike: {
        default: 0,
        required: false
      },
      // 是否需要登录
      needLogin: {
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
      webinarData: {
        type: Object,
        default: () => {}
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
      emojiToPath(val) {
        return emojiToPath(val);
      }
    },
    components: {
      vhChat
    },
    data() {
      const { state: roomBaseState } = this.roomBaseServer;
      return {
        roomBaseState,
        $inputTimer: null,
        isShowMyQA: false,
        timmer: {},
        canSend: true,
        time: 15,
        waitTimeFlag: true,
        waitTime: 1,
        chatValue: '', // 输入框的值
        showEmojiIcon: false, // 打开表情icon
        showEmojiArr: false, // 表情集合
        // needInput: false, // 是否需要输入功能
        // needEmoji: false, // 是否需要表情功能
        // // tab的类型  分类1自定义,2文档,3聊天,4简介,5商品,6推荐
        // type: 3,
        showInput: false, // 展示聊天
        emojiArr: faceArr,
        isReadonly: false, // 是否进行只读操作
        vantFaildPlacer: '说点什么',
        location:
          window.location.protocol + process.env.VUE_APP_WATCH_URL + process.env.VUE_APP_WEB_KEY,
        avaImgShow: false, // 是否展示 选择个人资料 or 提现管理内容
        userState: false, // 是否展示个人资料面板
        cashState: false, // 是否展示提现面板
        isShowUser: false,
        connectMicShow: false, // 连麦入口按钮
        disabledAll: false, // 全员禁言
        deviceStatus: false // 是否支持上麦
      };
    },
    computed: {
      //分组讨论的信息
      groupInitData() {
        const { groupInitData = {} } = this.groupServer.state;
        return groupInitData;
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
      // 判断登录
      checkIsLogin() {
        // 若用户已经登录
        if (window.sessionStorage.getItem('token')) {
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
          this.connectMicShow = false;
        });
        // 接收开启连麦消息事件
        EventBus.$on('vrtc_connect_open', msg => {
          // console.log(9999999, msg);
          this.connectMicShow = true;
        });
        // 全员禁言
        EventBus.$on('disable_all', val => {
          this.disabledAll = true;
        });
        // 全员取消禁言
        EventBus.$on('permit_all', val => {
          this.disabledAll = false;
        });
        // 接收关闭连麦消息事件
        EventBus.$on('vrtc_connect_close', msg => {
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
      changeCashState() {
        this.cashState = !this.cashState;
      },
      changeUserState() {
        this.userState = !this.userState;
      },
      closeUserBox() {
        this.userState = false;
        this.avaImgShow = false;
      },
      closeCashBox() {
        this.cashState = false;
        this.avaImgShow = false;
      },
      saySomething() {
        const { groupInitData } = this.roomBaseState;
        if (
          (this.isBanned && !groupInitData.isInGroup) ||
          this.isAllBanned ||
          (groupInitData.isBanned && groupInitData.isInGroup)
        ) {
          return;
        }

        if (this.currentTab == 'qa') {
          if (this.canSend) {
            EventBus.$emit('showSendBox');
          } else {
            this.$toast(
              `${this.$t('chat.chat_1025')} ${this.$t('chat.chat_1067', { n: this.time })}`
            );
          }
        } else if (this.currentTab == 3) {
          if (this.waitTimeFlag) {
            EventBus.$emit('showSendBox');
          } else {
            this.$toast(this.$t('chat.chat_1068'));
            // this.$toast(`当前活动火爆，请您在${this.waitTime}秒后再次发言`);
          }
        } else {
          EventBus.$emit('showSendBox');
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
      showMyQA() {
        this.isShowMyQA = !this.isShowMyQA;
        this.localRoomInfo.isShowOnselfMdess = this.isShowMyQA;
        EventBus.$emit('showMyQA', this.isShowMyQA);
      },
      login() {
        EventBus.$emit('showChatLogin');
      },
      /* 表情 */
      showEmojiClick() {
        // 展示的是图片表情
        this.showEmojiArr = !this.showEmojiArr;
        setTimeout(() => {
          this.showInput = true;
          this.showEmojiIcon = true;
        }, 10);
      },
      inputEmoji(index) {
        console.log(index, '选中图的下标');
        for (const key in this.emojiArr[index]) {
          this.chatValue += key;
        }
      },
      // 失去焦点
      textBlur() {
        if (this.vantFaildPlacer.indexOf(', 最多140字') > -1) {
          this.vantFaildPlacer =
            this.currentTab == 'private'
              ? this.$t('chat.chat_1045')
              : this.currentTab == 'qa'
              ? this.$t('chat.chat_166')
              : this.$t('chat.chat_1042');
        }
        this.$inputTimer = setTimeout(() => {
          this.showEmojiIcon = false;
          this.showInput = false;
        }, 400);
      },
      textFocus() {
        try {
          clearTimeout(this.$inputTimer);
        } catch (e) {}

        if (this.vantFaildPlacer.indexOf(', 最多140字') == -1) {
          this.vantFaildPlacer = this.vantFaildPlacer + ',' + this.$t('chat.chat_1069');
        }
        setTimeout(() => {
          this.showEmojiIcon = true;
          if (this.showEmojiArr) {
            this.showEmojiArr = false;
          }
        }, 100);
      },
      send() {
        const inputValue = this.chatValue.trim();
        if (!inputValue) {
          this.$toast(this.$t('chat.chat_1057'));
          return;
        }
        EventBus.$emit('sendMsg', inputValue, this.currentTab);

        this.chatValue = '';
        this.showEmojiArr = false;
        this.showEmojiIcon = false;

        if (this.currentTab == 'qa') {
          this.isReadonly = true;
        }

        this.showInput = false;
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
