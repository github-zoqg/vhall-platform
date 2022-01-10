<template>
  <div class="vmp-chat-container" :class="{ assistant: assistantType }">
    <!-- 消息主体区域 -->
    <div
      class="chat-content"
      ref="chatContent"
      :style="{ height: 'calc(100% - ' + operatorHeight + 'px)' }"
    >
      <overlay-scrollbars
        ref="chatMessageAreaScroll"
        :options="overlayScrollBarsOptions"
        style="height: 100%"
      >
        <template v-for="msg in chatList">
          <msg-item
            :key="msg.msgId"
            :msg="msg"
            :roleName="roleName"
            @dispatchEvent="msgEventHandleDisPatch"
            @lotteryCheck="lotteryCheck"
            @questionnaireCheck="questionnaireCheck"
            @previewImg="previewImg"
          ></msg-item>
        </template>
        <!-- 如果开启观众手动加载聊天历史配置项，并且聊天列表为空的时候显示加载历史消息按钮 -->
        <p
          v-if="configList['ui.hide_chat_history'] === '1' && !chatList.length"
          class="chat-content__get-list-btn-container"
        >
          <span class="chat-content__get-list-btn" @click="getHistoryMsg">查看聊天历史消息</span>
        </p>
      </overlay-scrollbars>
      <div v-if="configList['ui.hide_chat_history'] !== '1'" class="chat-content__tip-box">
        <div
          v-show="
            unReadMessageCount !== 0 &&
            (isHasUnreadNormalMsg || isHasUnreadAtMeMsg || isHasUnreadReplyMsg)
          "
          class="chat-content__tip-box-content"
          @click="scrollToTarget"
        >
          {{ tipMsg }}
          <span class="iconfont iconyourennijiantou"></span>
        </div>
      </div>
    </div>
    <div class="chat-operate-bar">
      <chat-operate-bar
        ref="chatOperator"
        :chat-options="chatOptions"
        :room-id="roomId"
        :role-name="roleName"
        :input-status="inputStatus"
        :webinar-id="webinarId"
        :all-banned="allBanned"
        :chat-list="chatList"
        :chat-login-status="chatLoginStatus"
        @updateHeight="chatOperateBarHeightChange"
      ></chat-operate-bar>
      <img-preview
        ref="imgPreview"
        v-if="imgPreviewVisible"
        :images="previewImgList"
        @closeImgPreview="onClosePreviewImg"
      ></img-preview>
      <chat-user-control
        :roomId="roomId"
        :userId="userId"
        :reply="reply"
        @deleteMsg="deleteMsg"
        :atUser="atUser"
        :atList="atList"
      ></chat-user-control>
    </div>
  </div>
</template>

<script>
  import MsgItem from './components/msg-item.vue';
  import ImgPreview from './components/img-preview';
  import ChatUserControl from './components/chat-user-control';
  import ChatOperateBar from './components/chat-operate-bar';

  import EventBus from './js/Events.js';
  import eventMixin from './mixin/event-mixin';

  import { sessionOrLocal } from './js/utils';
  import { useChatServer, useRoomBaseServer } from 'middleDomain';
  import dataReportMixin from '@/packages/chat/src/mixin/data-report-mixin';

  export default {
    name: 'VmpChat',
    mixins: [eventMixin, dataReportMixin],
    components: {
      MsgItem,
      ImgPreview,
      ChatUserControl,
      ChatOperateBar
    },
    data() {
      this.chatServer = useChatServer();
      const { chatList } = this.chatServer.state;
      const roomBaseState = useRoomBaseServer().state;
      return {
        roomBaseState,
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
        //todo 待替换
        configList: {
          'ui.hide_chat_history': '2'
        },
        //未读消息数量
        unReadMessageCount: 0,
        //是否有常规未读消息
        isHasUnreadNormalMsg: false,
        //是否有@我的未读消息
        isHasUnreadAtMeMsg: false,
        //是否有未读的回复消息
        isHasUnreadReplyMsg: false,
        //是否正在执行动画
        animationRunning: false,
        //是否是助理
        assistantType: this.$route.query.assistantType,
        //聊天消息列表
        chatList: chatList,
        // @用户
        atList: [],
        // 预览图片列表
        previewImgList: [],
        // 提示开关
        showTip: false,
        // 提示文字
        tipMsg: '',
        // 输入框的值
        inputValue: '',
        // 输入框状态
        inputStatus: {
          placeholder: '参与聊天',
          disable: false
        },
        // 聊天是否需要登录
        chatLoginStatus: false,
        //欢迎信息
        welcomeInfo: {
          required: false
        },
        //参会角色身份
        join_name: {
          type: String
        },
        //活动id 打开手动过滤地址需要
        webinarId: '',
        // 是否全体禁言
        allBanned: false,
        // 是否被禁言
        isBanned: false,
        //频道id
        channelId: '',
        //todo 测试用，后续删掉 房间号
        roomId: 'lss_8434acc2',
        //用户角色
        roleName: '',
        //用户id
        userId: '',
        // 聊天过滤的跳转url
        chatFilterUrl: '',
        //插件
        plugin: {
          image: false,
          emoji: false,
          audit: {
            show: true,
            src: 'javascript:;'
          }
        },
        //是否为嵌入页
        isEmbed: false,
        //分页配置
        pageConfig: {
          page: 0
        },
        //图片预览弹窗是否可见
        imgPreviewVisible: false,
        //聊天配置
        chatOptions: {},
        //底部操作栏高度
        operatorHeight: 91
      };
    },
    computed: {},
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
      chatList: {
        deep: true,
        handler() {
          // 如果滚动条未滚动至最底部
          if (this.osInstance.scroll().ratio.y !== 1) {
            this.unReadMessageCount++;
          }
        }
      },
      allBanned: {
        handler() {},
        immediate: true
      },
      isBanned: {
        handler() {
          this.inputStatus = {
            placeholder:
              this.roleName == '1'
                ? '参与聊天'
                : this.roleName != '2'
                ? this.isBanned
                  ? '您已被禁言'
                  : '参与聊天'
                : this.allBanned
                ? '全员禁言中'
                : this.isBanned
                ? '您已被禁言'
                : '参与聊天',
            disable:
              this.roleName == '1'
                ? false
                : this.roleName != '2'
                ? this.isBanned
                : this.isBanned || this.allBanned
          };
        }
      },
      replyMsg() {
        if (Object.keys(this.replyMsg || {}).length === 0) {
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
    mounted() {
      //初始化配置
      this.initConfig();
      this.init();
      // 1--是需要登录才能参与互动   0--不登录也能参与互动
      this.initChatLoginStatus();
      // 口令登录显示  自身显示消息
      this.initCodeLoginMessage();
      //初始化聊天区域滚动组件
      this.initScroll();
    },
    destroyed() {},
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.chatOptions = widget.options;
        }
      },
      init() {
        this.$nextTick(() => {
          this.pageConfig.page = 0;
          this.getHistoryMsg();
        });

        EventBus.$on('group_channel-change', msg => {
          console.log('开始接受消息-------------------------', msg);
          this.getHistoryMsg();
        });
        setTimeout(() => {
          this.chatSDK = window.chatSDK;
          //todo 替换掉EventBus，拆为全局信令以及父子组件通信事件
          this.listenEvents();
        }, 1000);
      },
      //初始化聊天输入框数据
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
          disable = true;
        }

        if ([1, '1'].includes(this.roleName)) {
          placeholder = '参与聊天';
          disable = false;
        }

        this.inputStatus.placeholder = placeholder;
        this.inputStatus.disable = disable;
      },
      //初始检查是否要登录才可以参与互动
      initChatLoginStatus() {
        if (sessionStorage.getItem('watch')) {
          if (JSON.parse(sessionStorage.getItem('moduleShow')).modules.chat_login.show == 0) {
            if (sessionStorage.getItem('userInfo') || this.isEmbed) {
              // 登录状态
              this.chatLoginStatus = false;
            } else {
              // 非登录状态
              this.chatLoginStatus = true;
              this.inputStatus.placeholder = '登录后参与互动';
            }
          } else {
            this.chatLoginStatus = false;
          }
        }
      },
      //todo 信令完成这个或者domain 初始化口令登录自身显示的消息
      initCodeLoginMessage() {
        EventBus.$on('codeText', msg => {
          // 口令登录显示  自身显示消息
          this.chatList.push(msg);
        });
      },
      //处理分组讨论频道变更
      handleChannelChange() {
        this.pageConfig.page = 0;
        this.chatServer.clearHistoryMsg();
        this.getHistoryMsg();
      },
      // 获取历史消息
      getHistoryMsg() {
        const params = {
          room_id: this.roomId,
          pos: Number(this.pageConfig.page) * 50,
          limit: 50
        };

        this.chatServer.getHistoryMsg(params, '发起端').then(result => {
          this.pageConfig.page = Number(this.pageConfig.page) + 1;
          console.log(result);
        });
      },
      //todo domain负责 抽奖情况检查
      lotteryCheck() {},
      //todo domain负责 问卷情况检查
      questionnaireCheck() {},
      /**
       * 聊天图片预览
       * */
      // 预览聊天图片
      previewImg(index, images) {
        //处理掉图片携带的查询参数，只保留主要链接
        this.previewImgList = images.map(item => item.split('?')[0]);
        this.imgPreviewVisible = true;
        this.$nextTick(() => {
          this.$refs.imgPreview.jumpToTargetImg(index);
        });
      },
      //关闭预览图片弹窗之后的处理
      onClosePreviewImg() {
        this.imgPreviewVisible = false;
      },
      /**
       * 聊天图片预览结束
       * */
      /** 消息区域滚动处理 */
      initScroll() {
        this.osInstance = this.$refs.chatMessageAreaScroll.osInstance();
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
          const delayTime = this.configList['ui.hide_chat_history'] === '1' ? 0 : 250;
          this.osInstance.scrollStop().scroll({ y: '100%' }, delayTime, 'linear', () => {
            this.animationRunning = false;
          });
        });
      },
      //滚动到底部
      handleScrollStop() {
        if (this.osInstance.scroll().ratio.y === 1) {
          this.unReadMessageCount = 0;
          this.isHasUnreadNormalMsg = false;
          this.isHasUnreadAtMeMsg = false;
          this.isHasUnreadReplyMsg = false;
        }
      },
      //滚动到目标处
      scrollToTarget() {
        this.animationRunning = true;
        const delayTime = this.configList['ui.hide_chat_history'] === '1' ? 0 : 250;
        this.osInstance.scrollStop().scroll(
          {
            el: this.osInstance.getElements().content.children[
              this.chatList.length - this.badgeNumber
            ],
            block: { y: 'end' }
          },
          delayTime,
          'linear',
          () => {
            this.animationRunning = false;
            this.badgeNumber = 0;
            this.isHasUnreadNormalMsg = false;
            this.isHasUnreadAtMeMsg = false;
            this.isHasUnreadReplyMsg = false;
          }
        );
      },
      /** 消息区域滚动处理结束 */
      //todo domain负责 获取菜单列表
      getMenuList(val) {
        const vo = val;
        if (this.roleName === 2) {
          // 嵌入会调用 watchEmbedInit —— 房间初始化；
          // 用户若已登录，获取userInfo中nick_name；若未登录，获取init房间初始化接口中join
          const userInfo = sessionOrLocal.get('userInfo')
            ? JSON.parse(sessionOrLocal.get('userInfo'))
            : {};
          const rmJoin = sessionOrLocal.get('v3_rm_join')
            ? JSON.parse(sessionOrLocal.get('v3_rm_join'))
            : {};
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
      //todo domain负责组装 发送消息
      sendMsg(callback) {
        window.clearTimeout(this.sendTimeOut);

        const { checkHasKeyword } = this.chatServer;
        const joinDefaultName = JSON.parse(sessionStorage.getItem('moduleShow'))
          ? JSON.parse(sessionStorage.getItem('moduleShow')).auth.nick_name
          : '';
        //子组件里上传的图片
        const imgUrls = this.getUploadImg();

        this.sendTimeOut = setTimeout(() => {
          const inputValue = this.trimPlaceHolder('reply');
          if (this.inputStatus.disable) {
            return;
          }
          if ((!inputValue || (inputValue && !inputValue.trim())) && !imgUrls.length) {
            return this.$message.warning('内容不能为空');
          }
          const data = {};
          if (inputValue) {
            data.type = 'text';
            data.barrageTxt = inputValue
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\n/g, '<br/>');
            data.text_content = inputValue;
          }
          //如果有聊天图片
          if (imgUrls.length) {
            data.image_urls = imgUrls;
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
          if (this.roleName === 2 && this.join_name) {
            name = this.join_name;
          }
          const context = {
            nickname: name, // 昵称
            avatar: userInfo && userInfo.avatar ? userInfo.avatar : '', // 头像
            role_name: this.roleName, // 角色 1主持人2观众3助理4嘉宾
            replyMsg: this.replyMsg, // 回复消息
            atList: this.atList // @用户列表
          };
          let filterStatus = true;
          if (sessionStorage.getItem('watch')) {
            filterStatus = checkHasKeyword(inputValue);
          }

          if (this.roleName !== 2 || (this.roleName === 2 && filterStatus)) {
            if (this.atList.length && data.text_content) {
              this.atList.forEach(a => {
                data.text_content = data.text_content.replace(`@${a.nickName}`, `***${a.nickName}`);
              });
            }

            this.chatServer.sendMsg({ data, context });
          }
          //清空一下子组件里上传的图片
          this.clearUploadImg();
          this.inputValue = '';
          this.replyMsg = {};
          this.$refs.emoji.isShow = false;

          this.atList = [];
          callback && callback();
        }, 300);
      },
      // 发送聊天节流
      sendMsgThrottle() {
        if (this.roleName !== 2) {
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
      backspace() {
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
            this.atList = this.atList.filter(a => {
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
            this.inputValue.indexOf(`回复${this.replyMsg.nickName}: `) == -1 &&
              (this.replyMsg = {});
          }
        }
      },
      //处理聊天内容
      trimPlaceHolder() {
        return this.inputValue.replace(/^[回复].+[:]\s/, '');
      },
      //回复消息
      reply(count) {
        this.buriedPointReport(110119, {
          business_uid: this.userId,
          webinar_id: this.$route.params.il_id
        });
        this.$refs.chatOperator.handleReply(count);
      },
      //todo domain负责 删除消息（主持人，助理）
      deleteMsg(count) {
        const msgToDelete =
          this.chatList.find(chatMsg => {
            return chatMsg.count === count;
          }) || {};

        setTimeout(() => {
          const params = {
            channel_id: msgToDelete.channel,
            msg_id: msgToDelete.msgId,
            room_id: this.roomId
          };
          this.chatServer.deleteMessage(params).then(res => {
            this.buriedPointReport(110121, {
              business_uid: this.userId,
              webinar_id: this.$route.params.il_id
            });
            const _index = this.chatList.findIndex(chatMsg => {
              return chatMsg.count === count;
            });
            _index !== -1 && this.chatList.splice(_index, 1);
            return res;
          });
        }, 3000); // 优化 17532
      },
      //todo domain负责 @用户
      atUser(accountId) {
        //数据上报
        this.buriedPointReport(110120, {
          business_uid: this.userId,
          webinar_id: this.$route.params.il_id
        });
        this.$refs.chatOperator.handleAtUser(accountId);
      },
      /**
       * 事件处理分发
       * */
      msgEventHandleDisPatch(params = {}) {
        let { type = '', el = null, msg = '' } = params;
        console.log(msg);
        switch (type) {
          case 'scrollElement':
            this.onScrollElementHandle(el);
            break;
          case 'closeTip':
            this.onCloseTipHandle();
            break;
          case 'replyMsg':
            this.onReplyMsg(el);
            break;
        }
      },
      //滚动到@本用户的msgItem元素
      onScrollElementHandle(el) {
        this.showTip = true;
        this.elements.push(el);
        this.tipMsg = this.replyElement ? '有多条未读消息' : '有人@你';
      },
      //关闭提示
      onCloseTipHandle() {
        this.showTip = false;
        this.tipMsg = '';
      },
      //有人回复本用户
      onReplyMsg(e) {
        if (this.userId !== e.msg.sendId) return;
        this.showTip = true;
        this.tipMsg = this.elements.length ? '有多条未读消息' : '有人回复你';
        this.replyElement = e.el;
      },
      //todo 聊天区域高度变化
      chatOperateBarHeightChange(operatorHeight) {
        this.operatorHeight = operatorHeight;
        this.$refs.chatOperator.updateOverlayScrollbar();
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-container {
    @active-color: #fc5659;
    @font-error: #fb3a32;
    width: 100%;
    height: 100%;
    position: relative;

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
      position: relative;
      ::v-deep .vmp-chat-msg-item {
        &:last-child {
          padding-bottom: 20px;
        }
      }
      &__get-list-btn-container {
        display: block;
        text-align: center;
        padding-top: 10px;
      }
      &__get-list-btn {
        cursor: pointer;
        color: #3562fa;
        font-size: 14px;
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
        .iconyourennijiantou {
          font-size: 12px;
          margin-left: 6px;
        }
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
  }
</style>
