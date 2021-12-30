<template>
  <div class="c-vmp-chat"
       :class="{assistant :assistantType}"
       @mouseenter="mouseenter"
       @mouseleave="mouseleave">
    <div class="chat-content"
         ref="chatContent">
      <div class="chat-content-scroll"
           ref="scroll">
        <msg-item v-for="msg in chatList"
                  :key="msg.msgId"
                  :msg="msg"
                  :roleName="roleName"
                  @lotteryCheck="lotteryCheck"
                  @questionnaireCheck="questionnaireCheck"
                  @previewImg="previewImg">
        </msg-item>
      </div>
    </div>

    <!--提示-->
    <div class='tip' v-show="showTip" @click="scrollTo">{{tipMsg}}</div>

    <div class="chat-bottom">
      <!-- 上传图片预览 -->
      <div v-show="uploadActive"
           class="chat-img-box">
        <div class="chat-img"
             v-for="(url, index) in imgUrls"
             :key="index">
          <img width="100%"
               height="100%"
               :src="url + '?x-oss-process=image/resize,m_lfit,h_34,w_34'"
               alt />
          <i class="img-close"
             @click="deleteImg(index)"></i>
        </div>
      </div>

      <!-- 表情选择 -->
      <div class="emoji-wrapper">
        <emoji ref="emoji" @emojiInput="emojiInput"></emoji>
      </div>
      <!-- 过滤 -->
      <chat-filter v-if="roleName != 2"
                   :roomId="roomId"
                   :webinarId="webinarId"
                   :allBanned="allBanned"
                   ref="chatFilter"
                   :chatFilterUrl="chatFilterUrl"
                   :isAssistant='assistantType'></chat-filter>

      <div class="chat-control-wrap">
        <span class="iconfont iconbiaoqing"
              @click.stop="toggleEmoji"></span>
        <el-upload v-if="roleName != '2'"
                   class="avatar-uploader"
                   :headers="headersVo"
                   :action="`${$baseUrl}/v3/commons/upload/index`"
                   :show-file-list="false"
                   name="resfile"
                   :before-upload="onExceed"
                   :data="{
            path: `${roomId}/img`,
            type: 'image',
            interact_token: interact_token
          }"
                   accept=".jpg, .jpeg, .png, .bmp"
                   :on-success="uploadSuccess"
                   :on-error="uploadError">
          <i :class="['iconfont', 'icontupianliaotian', uploadActive ? 'active' : '']"></i>
        </el-upload>
        <a v-if="roleName != '2' && plugin.audit.show"
           class="iconfont iconguolv"
           @click="toggleChatFilter"></a>
      </div>
      <div class="chat-input-wrap">
        <input v-if="!inputStatus.disable && !chatLoginStatus"
               ref="chatInput"
               accept="image/jpg, image/png, image/jpeg, image/bmp"
               :placeholder="inputStatus.placeholder"
               :disabled="inputStatus.disable"
               type="text"
               maxlength="140"
               v-model="inputValue"
               @keyup.enter="sendMsgThrottle"
               @keyup.delete="backspace" />
        <div v-if="(roleName != 1 && inputStatus.disable) || chatLoginStatus"
             class="input-placeholder">
          {{ inputStatus.placeholder }}
        </div>
        <div v-show="chatLoginStatus"
             class="chat-input-login">
          <span @click="clickCallLogin">登录</span>
          参与互动
        </div>
        <button :class="{assistant: assistantType}" @click="sendMsgThrottle">发送</button>
      </div>
    </div>

  </div>
</template>

<script>
  import MsgItem from './components/msg-item.vue';
  import Emoji from './components/emoji.vue';
  import ImgPreview from './components/img-preview';
  import ChatFilter from './components/chat-filter';
  import ChatUserControl from './components/chat-user-control';

  import EventBus from './js/Events.js';
  import eventMixin from './mixin/event-mixin';
  import uploadMixin from './mixin/upload-mixin';

  import { sessionOrLocal, uuid } from './js/utils';
  import { useChatServer } from 'vhall-sass-domain';

  export default {
    name: 'VmpChat',
    mixins: [eventMixin, uploadMixin],
    components: {
      MsgItem,
      Emoji,
      ImgPreview,
      ChatFilter,
      ChatUserControl
    },
    props: {
      welcomeInfo: {
        required: false
      },
      join_name: {
        type: String
      },
      // 是否分屏
      splited: {
        required: false,
        default: false
      },

      playerType: {
        required: false
      },
      token: {
        required: false
      },
      appId: {
        required: true
      },
      // 打开手动过滤地址需要
      webinarId: {
        required: false
      },
      // 是否全体禁言
      allBanned: {
        required: true
      },
      // 是否被禁言
      isBanned: {
        required: true
      },
      channelId: {
        type: [Number, String],
        default: ''
      },
      roomId: {
        type: [Number, String],
        default: -1
      },
      roleName: {
        required: true
      },
      // 图片上传需要
      vssToken: {
        type: [Boolean, String],
        default: ''
      },
      userId: {
        type: [Number, String],
        default: ''
      },
      chatFilterData: {
        required: false // 聊天过滤的数组
      },
      chatFilterUrl: {
        required: true // 聊天过滤的跳转url
      },
      showControl: {
        type: Boolean,
        default: true
      },
      plugin: {
        type: Object,
        // eslint-disable-next-line vue/require-valid-default-prop
        default: {
          image: false,
          emoji: false,
          audit: {
            show: true,
            src: 'javascript:;'
          }
        }
      },
      isEmbed: {
        required: false // 是否为潜入页
      }
    },
    data() {
      this.chatServer = useChatServer();
      const { chatList } = this.chatServer.state;
      return {
        // 助理的时候进行使用
        interact_token: sessionOrLocal.get('interact_token') || '',
        // 请求token
        headToken: sessionOrLocal.get('token', 'localStorage') || '',
        assistantType: this.$route.query.assistantType,
        //聊天消息列表
        chatList:chatList,
        // @用户
        atList: [],
        //角色名
        roleName:'',

        // 提示开关
        showTip: false,
        // 提示文字
        tipMsg: '',

        // 输入框的值
        inputValue: '',
        // 输入框状态
        inputStatus: {
          placeholder:'参与聊天',
          disable: false
        },
        //是否被禁言
        isBanned:false,
        //是否全体禁言
        allBanned:false,
        // 聊天是否需要登录
        chatLoginStatus: false,
      };
    },
    computed: {
      headersVo: function() {
        const vo = { token: this.headToken, platform: 7, 'request-id': uuid() };
        // 获取参数
        const wIdIndex0 = window.location.href.lastIndexOf('/');
        const wIdIndex1 = window.location.href.lastIndexOf('?');
        const wId = window.location.href.substring(wIdIndex0 + 1, wIdIndex1 > 0 ? wIdIndex1 : window.location.href.length);
        if (window.sessionStorage.getItem(`V3_WAP_US_${wId}`)) {
          vo['gray-id'] = window.sessionStorage.getItem(`V3_WAP_US_${wId}`);
        }
        return vo;
      }
    },
    watch: {
      welcomeInfo: {
        handler(val) {
          if (val) {
            this.getMenuList(val);
          }
        },
        immediate: true,
        deep: true
      },
      'chatList.length'(newval) {
        setTimeout(() => {
          if (newval) {
            this.resizeScroll();
            this.$emit('chatUpdata');
          }
        }, 50);
      },
      allBanned: {
        handler(val) {
        },
        immediate: true
      },
      isBanned: {
        handler() {
          this.inputStatus = {
            placeholder:
              this.roleName == '1'
                ? '参与聊天'
                : this.roleName != '2'
                  ? (this.isBanned ? '您已被禁言' : '参与聊天')
                  : this.allBanned
                    ? '全员禁言中'
                    : this.isBanned
                      ? '您已被禁言'
                      : '参与聊天',
            disable: this.roleName == '1' ? false : (this.roleName != '2' ? this.isBanned : this.isBanned || this.allBanned)
          };
        }
      },
      replyMsg() {
        if (Object.keys(this.replyMsg || {}).length == 0) {
          this.inputValue = this.trimPlaceHolder('reply');
        } else {
          this.inputValue = this.inputValue
            ? `回复${this.replyMsg.nickName}: ${this.trimPlaceHolder('reply')}`
            : `回复${this.replyMsg.nickName}: `;
        }
      },
      inputValue(newValue) {
        if (!newValue) {
          this.replyMsg = {};
        }
      }
    },
    beforeCreate() {},
    created() {
      this.initInputStatus();
    },
    destroyed() {},
    methods: {
      //初始化数据
      initInputStatus() {

        let placeholder = '参与聊天';
        let disable = false;

        //如果是单人被禁言
        if (this.isBanned) {
          placeholder = '您已被禁言';
          disable = true;
        }
        //如果是全体禁言
        if (this.allBanned) {
          placeholder = '全员禁言中';
          disable = true
        }

        if ([1, '1'].includes(this.roleName)) {
          placeholder = '参与聊天';
          disable = false;
        }

        this.inputStatus.placeholder = placeholder;
        this.inputStatus.disable = disable;
      },
      //鼠标移入的时候的响应
      mouseenter(){

      },
      //鼠标移出的时候的响应
      mouseleave(){

      },
      //抽奖情况检查
      lotteryCheck(){

      },
      //问卷情况检查
      questionnaireCheck(){

      },
      //图片预览处理
      previewImg(){

      },
      resizeScroll() {
        const chatDom = document.querySelector('.chat-content-scroll');
        const scrollHeight = chatDom.scrollHeight + 100;
        chatDom.scrollTop = scrollHeight;
      },
      scrollTo() {
        this.resizeScroll();
        EventBus.$emit('clearElements');
      },
      // 切换表情显示
      toggleEmoji() {
        if (this.chatLoginStatus) {
          this.$message.warning('未登录');
          return;
        }

        if (this.inputStatus.disable) {
          this.$message.warning('您已被禁言');
          return;
        }
        this.$refs.emoji.toggleShow();
      },
      // 子组件输入表情
      emojiInput(value) {
        if (this.inputStatus.disable) {
          return;
        }
        this.inputValue += value;
      },
      //切换聊天过滤显示
      toggleChatFilter() {
        this.$refs.chatFilter.toggleShow();
      },
      // 获取菜单列表
      getMenuList(val) {
        const vo = val;
        if (this.roleName == 2) {
          // 嵌入会调用 watchEmbedInit —— 房间初始化；
          // 用户若已登录，获取userInfo中nick_name；若未登录，获取init房间初始化接口中join
          const userInfo = sessionOrLocal.get('userInfo') ? JSON.parse(sessionOrLocal.get('userInfo')) : {};
          const rmJoin = sessionOrLocal.get('v3_rm_join') ? JSON.parse(sessionOrLocal.get('v3_rm_join')) : {};
          console.log('用户信息userInfo', userInfo);
          console.log('参会房间信息join_info', rmJoin);
          if (userInfo && userInfo.nick_name) {
            vo.nick_name = userInfo.nick_name;
          }
          if (rmJoin && rmJoin.nickname) {
            vo.nick_name = rmJoin.nickname;
          }
          this.welcome_vo = vo;
          console.log('自定义菜单...', this.welcome_vo);
        }
      },
      // 发送消息
      sendMsg(callback) {
        window.clearTimeout(this.sendTimeOut);

        const { checkHasKeyword, sendMsg } = this.chatServer;
        const joinDefaultName = JSON.parse(sessionStorage.getItem('moduleShow')) ? JSON.parse(sessionStorage.getItem('moduleShow')).auth.nick_name : '';
        this.sendTimeOut = setTimeout(() => {
          const inputValue = this.trimPlaceHolder('reply');
          if (this.inputStatus.disable) {
            return;
          }
          if ((!inputValue || (inputValue && !inputValue.trim())) && !this.uploadActive) {
            return this.$message.warning('内容不能为空');
          }
          const data = {};
          if (inputValue) {
            data.type = 'text';
            data.barrageTxt = inputValue.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
            data.text_content = inputValue;
          }
          if (this.uploadActive) {
            data.image_urls = this.imgUrls;
            data.type = 'image';
          }
          const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
          console.warn('获取当前的本地用户信息', userInfo);
          let name = '';
          if (userInfo) {
            if (userInfo.nickname) {
              name = userInfo.nickname;
            } else {
              name = userInfo.nick_name;
            }
          } else {
            name = joinDefaultName;
          }
          if (this.roleName == 2 && this.join_name) {
            name = this.join_name;
          }
          const context = {
            nickname: name, // 昵称
            avatar: (userInfo && userInfo.avatar) ? userInfo.avatar : '', // 头像
            role_name: this.roleName, // 角色 1主持人2观众3助理4嘉宾
            replyMsg: this.replyMsg, // 回复消息
            atList: this.atList // @用户列表
          };
          console.log('获取当前的本地用户信息 -context', context);
          // data.role_name = this.roleName
          let filterStatus = true;
          if (sessionStorage.getItem('watch')) {
            // if (this.chatFilterData && this.chatFilterData.length > 0) {
            //   this.chatFilterData.map(item => {
            //     if (inputValue.includes(item.name)) {
            //       filterStatus = false;
            //     }
            //   });
            // }

            filterStatus = checkHasKeyword(inputValue);
          }
          if (this.roleName != 2 || (this.roleName == 2 && filterStatus)) {
            if (this.atList.length && data.text_content) {
              this.atList.forEach((a) => {
                data.text_content = data.text_content.replace(`@${a.nickName}`, `***${a.nickName}`);
              });
            }

            sendMsg({ data, context });
            // this.chatSDK.emit(data, context);

            window.vhallReport && window.vhallReport.report('CHAT', {
              event: JSON.stringify(data),
              market_tools_id: this.roleName
            });
          }
          this.imgUrls = [];
          this.inputValue = '';
          this.replyMsg = {};
          this.$refs.emoji.isShow = false;

          this.atList = [];
          callback && callback();
        }, 300);
      },
      // 发送聊天节流
      sendMsgThrottle() {

        if (this.roleName != 2) {
          this.sendMsg();
          return;
        }
        if (this.chatGap > 0) {
          this.lock = sessionStorage.getItem('chatLock');
          if (this.lock && this.lock == 'true') {
            this.$message.warning(`当前活动火爆，请您在${this.chatGap}秒后再次发言`);
          }
        } else {
          this.sendMsg(() => {
            window.clearInterval(this.chatGapInterval);
            this.lock = sessionStorage.getItem('chatLock');
            this.chatGap = this.delayTime(this.onlineUsers);
            this.chatGapInterval = window.setInterval(() => {
              if (this.chatGap > 0) {
                if (!this.lock || this.lock == 'false') {
                  sessionStorage.setItem('chatLock', true);
                } else {
                  this.$message.warning(`太频繁啦，还有${this.chatGap}秒后才能发送`);
                }
                this.chatGap = this.chatGap - 1;
              } else {
                window.clearInterval(this.chatGapInterval);
                sessionStorage.setItem('chatLock', false);
              }
            }, 1000);
          });
        }
      },
      backspace(e) {
        if (!this.inputValue) {
          this.atList = [];
          return;
        }
        const currentIndex = this.$refs.chatInput.selectionStart;
        const firstPart = this.inputValue.substring(0, currentIndex);
        const lastIndex = firstPart.lastIndexOf('@');
        if (lastIndex != -1) {
          const userName = this.inputValue.substring(lastIndex, currentIndex);
          const nickName = userName.replace('@', '');
          // 删除整个@过的用户名逻辑
          if (this.atList.find(u => u.nickName == nickName)) {
            this.atList = this.atList.filter(n => n.nickName != nickName);
            this.inputValue = this.inputValue.replace(userName, '');
          } else {
            this.atList = this.atList.filter((a) => {
              const atIndex = this.inputValue.indexOf(`@${a.nickName} `);
              return atIndex != -1;
            });
          }
        }
        // 删除要回复的用户名逻辑
        const lastReplyIndex = firstPart.lastIndexOf('回复');
        if (lastReplyIndex != -1) {
          const replyUserName = this.inputValue.substring(lastReplyIndex, currentIndex);
          console.log(`回复${this.replyMsg.nickName}:` == replyUserName);
          if (`回复${this.replyMsg.nickName}:` == replyUserName) {
            this.inputValue = this.inputValue.replace(replyUserName, '');
            this.replyMsg = {};
          } else {
            (this.inputValue.indexOf(`回复${this.replyMsg.nickName}: `) == -1) && (this.replyMsg = {});
          }
        }
      },
      //唤起登录
      clickCallLogin() {
        this.$parent.NoLogin();
      },
      trimPlaceHolder(type) {
        return this.inputValue.replace(/^[回复].+[:]\s/, '');
      },
    }
  };
</script>

<style scoped lang="less">
  .c-vmp-chat {
    width: 100%;
    height: 100%;
    position: relative;
    //background: @bg-dark-section;

    &.assistant {
      background: #323232;
    }

    .pic-control {
      position: absolute;
      background: #36383f;
      border: 1px solid #505061;
      border-radius: 4px;
      color: #b8bbca;
      font-size: 12px;
      width: 118px;
      padding: 6px 0;
      text-align: center;
      top: 30px;
      z-index: 1;
      // left:0;
      p {
        line-height: 34px;
        cursor: pointer;
      }
    }
    .chat-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 91px;
      padding-top: 10px;
      ::-webkit-scrollbar {
        width: 6px;
        height: 10px;
        background-color: #434343;
      }
      ::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: #434343;
        // border: 1px solid #434343;
      }
      ::-webkit-scrollbar-thumb {
        border: 1px solid #fff;
      }
      ::-webkit-scrollbar-track {
        border-radius: 5px;
        background-color: #434343;
      }
      .chat-content-scroll {
        height: 100%;
        position: relative;
        overflow-y: auto;
        transform: all 0.3s;
      }
    }
    .tip {
      display: flex;
      flex-direction: column;
      text-align: center;
      height: 32px;
      line-height: 32px;
      background: rgba(255, 241, 232, 1);
      color: #ff9446;
      font-size: 12px;
      position: absolute;
      box-sizing: border-box;
      left: 0;
      right: 0;
      bottom: 84px;
      cursor: pointer;
    }
    .chat-bottom {
      display: flex;
      /*height: 81px;*/
      flex-direction: column;
      padding: 10px;
      border-top: 1px solid #3a3a48;
      background-color: #2d2d2d;
      position: absolute;
      box-sizing: border-box;
      left: 0;
      right: 0;
      bottom: 0;
      .chat-control-wrap {
        display: flex;
        align-items: center;
        /*height: 20px;*/
        margin-bottom: 7px;
        & > * {
          margin-left: 10px;
        }
        .iconfont {
          color: #999999;
          font-size: 19px;
          cursor: pointer;
          &.active {
            color: #fc5659;
          }
          &:hover {
            color: #fc5659;
            cursor: pointer;
          }
          &.pic-disabled {
            pointer-events: none;
          }
          &.icontupianliaotian {
            font-size: 18px;
          }
        }
        .icon-common {
          width: 24px;
          color: #999999;
          height: 24px;
          font-size: 18px;
          background-size: 100%;
          background-repeat: no-repeat;
          background-position: center;
        }

        .iconbiaoqing {
          font-size: 19px;
          color: #999;
          margin-left: 0;
          margin-bottom: 1px;
          &:hover {
            color: #fc5659;
            cursor: pointer;
          }
        }
        .chat-audit {
          background-image: url("./images/auditing.png");
          &:hover {
            background-size: 95%;
            background-image: url("./images/auditing-hover.png");
          }
        }
        .avatar-uploader {
          flex: 1;
        }
        // .iconbiaoqing {
        //   color: #999;
        //   &:hover {
        //     color: #fc5659;
        //     cursor: pointer;
        //   }
        // }
      }
      .chat-input-wrap {
        display: flex;
        height: 34px;
        position: relative;
        input {
          flex: 1;
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
          border: none;
          background: rgba(84, 84, 84, 1);
          outline: none;
          padding-left: 12px;
          color: #b8bbca;
          &:focus + button {
            background: #999999;
          }
        }
        .input-placeholder {
          flex: 1;
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
          border: none;
          background: rgba(84, 84, 84, 1);
          outline: none;
          padding-left: 12px;
          color: #b8bbca;
          font-size: 14px;
          line-height: 34px;
        }
        .chat-input-login {
          position: absolute;
          // width: 100%;
          height: 34px;
          line-height: 34px;
          top: 0;
          left: 9px;
          z-index: 2;
          color: #aaa;
          font-size: 12px;
          background: #545454;
          span {
            font-size: 12px !important;
            color: #aaa;
          }
          span:first-of-type {
            color: #fc5659;
            cursor: pointer;
            font-size: 12px !important;
          }
        }
        button {
          &.assistant {
            width: 58px;
            flex-basis: initial;
          }
          flex-basis: 20%;
          width: 20%;
          text-align: center;
          line-height: 34px;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          background: rgba(153, 153, 153, 1);
          cursor: pointer;
          color: #fff;
          border: none;
          outline: none;
          /* &:active {
            background: #999999;
          } */
          &:hover {
            background: #fc5659;
          }
        }
      }
      .chat-img-box {
        padding: 8px;
        background: #3f3f3f;
        position: absolute;
        top: -50px;
        left: 7%;
        box-sizing: border-box;
        .chat-img {
          float: left;
          width: 34px;
          height: 34px;
          margin-right: 8px;
          position: relative;
          box-sizing: border-box;
          cursor: pointer;
          .img-close {
            position: absolute;
            width: 15px;
            height: 15px;
            background: url("./images/img-del.png") no-repeat;
            background-size: contain;
            top: 0px;
            right: 0px;
            display: none;
          }
          & > img {
            display: block;
          }
          &:last-child {
            margin-right: 0;
          }
          &:hover {
            border: 1px solid #fc5659;
            .img-close {
              display: block;
            }
          }
        }
      }
      .emoji-wrapper {
        width: 294px;
        position: absolute;
        top: 0;
        transform: translateY(-100%);
        left: 0;
      }
    }

  }
</style>
