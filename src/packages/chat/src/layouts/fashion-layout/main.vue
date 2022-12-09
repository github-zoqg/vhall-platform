<template>
  <div class="vmp-chat-container-fashion" :class="{ assistant: assistantType }">
    <transition name="el-fade-in-linear">
      <div v-if="isWatch && nickName && welcomeText && isShowWelcome" class="vmp-chat-welcome">
        <!-- 欢迎语显示 -->
        <div class="vmp-chat-welcome__greeting">
          <span class="vmp-chat-welcome__nickname">{{ nickName }}</span>
          &nbsp;{{ welcomeText }}
        </div>
      </div>
    </transition>
    <!-- 消息主体区域 -->
    <div
      class="chat-content"
      ref="chatContent"
      :style="{ height: 'calc(100% - ' + operatorHeight + 'px)' }"
    >
      <!-- {{ configList['ui.hide_chat_history'] }} -->
      <p
        v-if="isShowChatHistoryBtn && !hideChatHistory && overflow"
        class="chat-content__get-list-btn-container"
      >
        <span class="chat-content__get-list-btn" @click="getHistoryMsg">查看聊天历史消息</span>
      </p>

      <virtual-list
        ref="chatlist"
        style="height: 100%; overflow: auto"
        :keeps="20"
        :estimate-size="100"
        :data-key="'count'"
        :data-sources="renderList"
        :data-component="MsgItem"
        :extra-props="{
          chatOptions,
          joinInfo,
          isOnlyShowSponsor,
          previewImg: previewImg.bind(this),
          isWatch: isWatch,
          emitLotteryEvent,
          emitQuestionnaireEvent,
          emitExamEvent
        }"
        @tobottom="toBottom"
        @totop="onTotop"
      >
        <div class="chat_loading" slot="header" v-show="overflow && isLoading">
          {{ $t('common.common_1001') }}
        </div>
      </virtual-list>
      <div class="chat-content__tip-box">
        <div
          v-show="
            unReadMessageCount !== 0 &&
            (isHasUnreadNormalMsg || isHasUnreadAtMeMsg || isHasUnreadReplyMsg)
          "
          class="chat-content__tip-box-content"
          @click="scrollToTarget"
        >
          {{ tipMsg }}
          <span class="vh-iconfont vh-line-arrow-down"></span>
        </div>
      </div>
      <!-- <div class="chat-content__tip-mask"></div> -->
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
        :allBannedModuleList="allBannedModuleList"
        :chat-list="chatList"
        :at-list="atList"
        :chat-login-status="chatLoginStatus"
        @changeAllBanned="handleChangeAllBanned"
        @openPrivateChatModal="openPrivateChatModal"
        @onSwitchShowSpecialEffects="onSwitchShowSpecialEffects"
        @onSwitchShowSponsor="onSwitchShowSponsor"
        @updateHeight="chatOperateBarHeightChange"
        @needLogin="handleLogin"
        @sendEnd="sendMsgEnd"
      ></chat-operate-bar>
      <img-preview
        ref="imgPreview"
        v-if="imgPreviewVisible"
        :images="previewImgList"
        @closeImgPreview="onClosePreviewImg"
      ></img-preview>
      <chat-user-control
        :roomId="roomId"
        :userId="accountId"
        :reply="reply"
        @deleteMsg="deleteMsg"
        :atUser="atUser"
        :atList="atList"
      ></chat-user-control>
    </div>
  </div>
</template>

<script>
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import MsgItem from './components/msg-item.vue';
  import ImgPreview from '../../common/components/img-preview';
  import ChatUserControl from './components/chat-user-control';
  import ChatOperateBar from './components/chat-operate-bar';
  import { useChatServer, useRoomBaseServer, useMsgServer, useGroupServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  import VirtualList from 'vue-virtual-scroll-list';
  import emitter from '@/app-shared/mixins/emitter';
  //消息提示定时器
  let tipMsgTimer;
  export default {
    name: 'VmpFashionChat',
    mixins: [emitter],
    components: {
      ImgPreview,
      ChatUserControl,
      ChatOperateBar,
      VirtualList
    },
    data() {
      return {
        MsgItem,
        chatServerState: useChatServer().state,
        //默认兜底头像
        defaultAvatar,
        /** domain中读取的数据 */
        //活动id 打开手动过滤地址需要
        webinarId: '',
        //直播的类型，直播，回放
        playerType: '',
        //房间号
        roomId: '',
        //用户角色
        roleName: '',
        //登录后用户id
        userId: '',
        //游客或用户id
        accountId: '',

        /** domain中读取的数据结束 */
        /** 消息提示 */
        //未读消息数量
        unReadMessageCount: 0,
        //是否有常规未读消息
        isHasUnreadNormalMsg: false,
        //是否有@我的未读消息
        isHasUnreadAtMeMsg: false,
        //是否有未读的回复消息
        isHasUnreadReplyMsg: false,
        /** 消息提示结束 */
        //是否正在执行动画
        animationRunning: false,
        //是否是助理
        assistantType: this.$route.query.assistantType,
        //@用户
        atList: [],
        // 预览图片列表
        previewImgList: [],
        // 提示开关
        showTip: false,
        // 提示文字
        tipMsg: '',
        // 输入框状态
        inputStatus: {
          placeholder: this.$t('chat.chat_1021'),
          disable: false
        },
        isBanned: useChatServer().state.banned, //true禁言，false未禁言
        allBanned: useChatServer().state.allBanned, //true全体禁言，false未禁言
        allBannedModuleList: useChatServer().state.allBannedModuleList,
        // 聊天是否需要登录
        chatLoginStatus: false,

        //插件
        plugin: {
          image: false,
          emoji: false,
          audit: {
            show: true,
            src: 'javascript:;'
          }
        },
        //图片预览弹窗是否可见
        imgPreviewVisible: false,
        //聊天配置
        chatOptions: {},
        //底部操作栏高度
        operatorHeight: 89,
        //是否展示礼物特效
        showSpecialEffects: true,
        //礼物特效数组
        specialEffectsList: [],
        //只看主办方
        isOnlyShowSponsor: false,
        //特效样式map
        effectsMap: {
          鲜花: 'bg-flower',
          咖啡: 'bg-coffee',
          赞: 'bg-praise',
          鼓掌: 'bg-applause',
          666: 'bg-666',
          'bg-custom': 'bg-custom'
        },
        //当前登录人信息
        joinInfo: {},

        // 是否展示欢迎语
        isShowWelcome: false,
        //聊天消息是否有滚动条
        overflow: false,
        //每次加载的消息条数
        pageSize: 50,
        isLoading: false,
        //隐藏拉取历史聊天按钮
        hideChatHistory: false,
        //回复或@消息id
        targetId: ''
      };
    },
    computed: {
      isEmbed() {
        // 是不是音视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      //是否开启手动加载聊天历史记录
      isShowChatHistoryBtn() {
        return [1, '1'].includes(this.configList['ui.hide_chat_history']);
      },

      //视图中渲染的消息,为了实现主看主办方效果
      renderList() {
        return this.isOnlyShowSponsor
          ? this.chatList.filter(item => ![2, '2'].includes(item.roleName))
          : this.chatList;
      },
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(this.roomBaseServer.state.clientType);
      },
      // 用户昵称
      nickName() {
        return this.roomBaseServer.state.watchInitData.join_info.nickname;
      },
      // 聊天区欢迎语
      welcomeText() {
        if (Array.isArray(this.roomBaseServer.state.customMenu?.list)) {
          // 获取聊天菜单内容
          const chatItem = this.roomBaseServer.state.customMenu.list.find(item => {
            return item.type == 3;
          });
          // 返回欢迎语
          return chatItem?.welcome_content || '';
        }
        return '';
      },
      configList() {
        return this.roomBaseServer.state.configList;
      },
      noLoginKey() {
        return this.configList['ui.show_chat_without_login'];
      },
      //当前直播状态
      liveStatus() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
      },
      chatList() {
        return this.$domainStore.state.chatServer.chatList;
      },
      pos() {
        return this.$domainStore.state.chatServer.pos;
      }
    },
    watch: {
      liveStatus: function () {
        this.initInputStatus();
      },
      chatList: function () {
        if (this.isBottom()) {
          this.scrollBottom();
          this.checkOverflow();
        }
      },
      // 聊天免登录的配置项更改，重新计算是否需要登录聊天
      noLoginKey() {
        this.initChatLoginStatus();
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      useChatServer().init();
    },
    mounted() {
      //初始化配置
      this.initConfig();
      //初始化视图数据，domain里取
      this.initViewData();
      this.initInputStatus();
      // 1--是需要登录才能参与互动   0--不登录也能参与互动
      this.initChatLoginStatus();
      //拉取聊天历史
      if (!this.isShowChatHistoryBtn) {
        this.getHistoryMsg(true);
      }
      //监听domain层chatServer通知
      this.listenChatServer();

      // 展示欢迎语
      this.showWelcome();
      // TODO:开发调试代码，提测之后删除
      [
        {
          nickname: '很长de昵称很长d昵称很长de昵称很长de昵称很长de昵称',
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: '推送了问卷',
            questionnaire_id: '687607'
          },
          roleName: '1',
          type: 'questionnaire_push',
          interactStatus: true,
          isCheck: true,
          count: 37
        },
        {
          content: {
            text_content: '正在进行抽奖环节'
          },
          type: 'lottery_push',
          interactStatus: true,
          count: 38
        },
        {
          roleName: 1,
          nickname: '很长de昵称很长d昵称很长de昵称很长de昵称很长de昵称',
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: '发起了签到'
          },
          type: 'sign_in_push',
          interactStatus: true,
          count: 39
        },
        {
          content: {
            text_content: '开启了问答'
          },
          roleName: 1,
          nickname: '很长de昵称很长d昵称很长de昵称很长de昵称很长de昵称',
          type: 'question_answer_open',
          interactStatus: true,
          count: 40
        },
        {
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: '红包派发中'
          },
          type: 'pwd_red_envelope_ok',
          interactStatus: true,
          Show: true,
          count: 41
        }
      ].forEach(item => {
        setTimeout(() => {
          // this.chatList.push(item);
        }, 500);
      });
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
      //初始化视图数据
      initViewData() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        this.joinInfo = join_info;
        this.webinarId = webinar.id;
        this.playerType = webinar.type;
        this.roomId = interact.room_id;
        this.roleName = join_info.role_name;
        this.userId = join_info.user_id;
        this.accountId = join_info.third_party_user_id;
      },
      //处理唤起登录
      handleLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      listenChatServer() {
        const chatServer = useChatServer();
        const msgServer = useMsgServer();
        //监听到新消息过来
        chatServer.$on('receiveMsg', msg => {
          if (!this.isBottom()) {
            if (!this.isOnlyShowSponsor || (this.isOnlyShowSponsor && msg.context.role_name != 2)) {
              this.targetId = '';
              tipMsgTimer && clearTimeout(tipMsgTimer);
              this.isHasUnreadNormalMsg = true;
              this.isHasUnreadAtMeMsg = false;
              this.isHasUnreadReplyMsg = false;
              this.unReadMessageCount++;
              this.tipMsg = this.$t('chat.chat_1035', { n: this.unReadMessageCount });
            }
          }
          this.dispatch('VmpTabContainer', 'noticeHint', 3);
        });
        //监听@我的消息
        chatServer.$on('atMe', msg => {
          if (!this.isBottom()) {
            this.targetId = msg.msg_id;
            this.isHasUnreadNormalMsg = false;
            this.isHasUnreadReplyMsg = false;
            this.isHasUnreadAtMeMsg = true;
            this.tipMsg = this.$t('chat.chat_1075');
            tipMsgTimer && clearTimeout(tipMsgTimer);
            tipMsgTimer = setTimeout(() => {
              this.isHasUnreadAtMeMsg = false;
            }, 10000);
          }
        });
        //监听回复我的消息
        chatServer.$on('replyMe', msg => {
          if (!this.isBottom()) {
            this.targetId = msg.msg_id;
            this.isHasUnreadNormalMsg = false;
            this.isHasUnreadAtMeMsg = false;
            this.isHasUnreadReplyMsg = true;
            this.tipMsg = this.$t('chat.chat_1076');
            tipMsgTimer && clearTimeout(tipMsgTimer);
            tipMsgTimer = setTimeout(() => {
              this.isHasUnreadReplyMsg = false;
            }, 10000);
          }
        });
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
        useGroupServer().$on('ROOM_CHANNEL_CHANGE', () => {
          this.handleChannelChange();
        });
        //监听被提出房间消息
        chatServer.$on('roomKickout', () => {
          this.$message(this.$t('chat.chat_1007'));
        });
        msgServer.$onMsg('ROOM_MSG', msg => {
          // live_over 结束直播
          if (msg.data.type == 'live_over') {
            this.allBanned = false;
            // this.onSwitchShowSponsor(false);
          } else if (msg.data.type == 'live_start') {
            chatServer.clearChatMsg();
            this.getHistoryMsg();
          }
        });
      },
      //初始化聊天输入框数据
      initInputStatus() {
        let placeholder = this.$t('chat.chat_1021');
        let disable = false;
        // 控制台配置回放禁言状态
        if (
          (this.playerType == 5 || this.playerType == 4) &&
          this.configList['ui.watch_record_no_chatting']
        ) {
          placeholder = this.$t('chat.chat_1079');
          disable = true;
        } else {
          //如果是单人被禁言
          if (this.isBanned && this.roleName != 1) {
            placeholder = this.$t('chat.chat_1079');
            disable = true;
          }
          //如果是全体禁言
          if (this.allBanned && ![1, '1', 3, '3', 4, '4'].includes(this.roleName)) {
            placeholder = this.$t('chat.chat_1079');
            disable = true;
          }
        }
        if (this.liveStatus == 3 && this.roleName == 2) {
          placeholder = this.$t('chat.chat_1092');
          disable = true;
        }
        this.inputStatus.placeholder = placeholder;
        this.inputStatus.disable = disable;
      },
      //初始检查是否要登录才可以参与互动
      initChatLoginStatus() {
        if ([0, '0'].includes(this.configList['ui.show_chat_without_login'])) {
          //主持人，这时候在发起端
          if ([1, '1'].includes(this.roleName) || this.isEmbed) {
            // 不需要登录
            this.chatLoginStatus = false;
            return;
          }
          if (![1, '1'].includes(this.roleName) && ['', null, 0].includes(this.userId)) {
            // 需要登录
            this.chatLoginStatus = true;
          }
        } else {
          // 不需要登录
          this.chatLoginStatus = false;
        }
      },
      //处理分组讨论频道变更
      handleChannelChange() {
        useChatServer().clearChatMsg();
        this.getHistoryMsg();
      },
      // 获取历史消息
      async getHistoryMsg(isfirst) {
        this.isLoading = true;
        const params = {
          isfirst,
          room_id: this.roomId,
          msg_id: this.getFirstMsg()?.msgId,
          limit: this.pageSize,
          // is_role: this.isOnlyShowSponsor ? 1 : 0,
          anchor_path: this.chatList[0]?.msgId ? 'down' : undefined //up 拉新,down拉旧
        };
        const res = await useChatServer().getHistoryMsg(params);
        this.hideChatHistory = true;
        this.isLoading = false;
        return res;
      },
      //获取第一条有msgid的消息
      getFirstMsg() {
        return this.chatList.find(item => {
          return item.msgId;
        });
      },
      //抽奖情况检查
      emitLotteryEvent(msg) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickLotteryChatItem', [msg])
        );
      },
      //问卷情况检查
      emitQuestionnaireEvent(questionnaireId) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickQuestionnaireChatItem', [questionnaireId])
        );
      },
      //快问快答情况检查
      emitExamEvent(vo) {
        if (['paper_auto_send_rank', 'paper_send_rank'].includes(vo.sourceType)) {
          // 发起端-公布成绩 or 自动推送成绩
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickExamRankChatItem', [vo.examId, vo.examTitle])
          );
        } else if ('paper_send' == vo.sourceType) {
          // 发起端-推送快问快答
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickExamChatItem', [vo.examId, 'answer'])
          );
        }
      },
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
      /** 消息区域滚动处理结束 */
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
          const nickname = userName.replace('@', '');
          // 删除整个@过的用户名逻辑
          if (this.atList.find(u => u.nickname == nickname)) {
            this.atList = this.atList.filter(n => n.nickname != nickname);
            this.inputValue = this.inputValue.replace(userName, '');
          } else {
            this.atList = this.atList.filter(a => {
              const atIndex = this.inputValue.indexOf(`@${a.nickname} `);
              return atIndex != -1;
            });
          }
        }
        // 删除要回复的用户名逻辑
        const replyText = this.$t('chat.chat_1036');
        const lastReplyIndex = firstPart.lastIndexOf(replyText);
        if (lastReplyIndex != -1) {
          const replyUserName = this.inputValue.substring(lastReplyIndex, currentIndex);
          console.log(`${replyText}${this.replyMsg.nickname}:` == replyUserName);
          if (`${replyText}${this.replyMsg.nickname}:` == replyUserName) {
            this.inputValue = this.inputValue.replace(replyUserName, '');
            this.replyMsg = {};
          } else {
            this.inputValue.indexOf(`${replyText}${this.replyMsg.nickname}: `) == -1 &&
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
        window.vhallReportForProduct?.report(110119);
        this.$refs.chatOperator.handleReply(count);
      },
      //删除消息（主持人，助理）
      deleteMsg(count) {
        const msgToDelete =
          this.chatList.find(chatMsg => {
            return chatMsg.count === count;
          }) || {};
        const params = {
          channel_id: msgToDelete.channel,
          msg_id: msgToDelete.msgId,
          room_id: this.roomId
        };
        useChatServer()
          .deleteMessage(params)
          .then(res => {
            window.vhallReportForProduct?.report(110121);
            return res;
          });
      },
      //@用户处理
      atUser(accountId) {
        this.$refs.chatOperator.handleAtUser(accountId);
        window.vhallReportForProduct?.report(110120);
      },
      //聊天区域高度动态改变处理
      chatOperateBarHeightChange(operatorHeight) {
        this.operatorHeight = operatorHeight;
        this.$refs.chatOperator.updateOverlayScrollbar();
      },
      //处理开启/屏蔽特效
      onSwitchShowSpecialEffects(status) {
        this.showSpecialEffects = !status;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitHideEffect', [status]));
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitHideEffectFullScreen', [status])
        );
      },
      //处理只看主办方
      async onSwitchShowSponsor(status) {
        this.isOnlyShowSponsor = status;
        // useChatServer().clearChatMsg();
        // await this.getHistoryMsg();
        // this.$nextTick(() => {
        //   this.scrollBottom();
        // });
      },
      //处理全体禁言切换
      handleChangeAllBanned(data) {
        let params = {
          room_id: this.roomId,
          status: data.status ? 1 : 0,
          chat_status: data.chat_status ? 1 : 0,
          qa_status: data.qa_status ? 1 : 0,
          private_chat_status: data.private_chat_status ? 1 : 0
        };
        useChatServer()
          .setAllBanned(params)
          .then(res => {
            this.allBanned = data.status;
            //数据上报埋点--全体禁言切换
            window.vhallReportForProduct?.report(data.status ? 110116 : 110117);
            return res;
          })
          .catch(error => {
            this.$message.error(error.msg);
          });
      },
      //打开私聊模态窗
      openPrivateChatModal() {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitOpenLivePrivateChatModal')
        );
      },
      //获取目标消息索引
      getTargetIndex(id) {
        return this.chatList.findIndex(item => {
          return item.msgId == id;
        });
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$refs.chatlist.scrollToBottom();
          this.isHasUnreadNormalMsg = false;
          this.isHasUnreadAtMeMsg = false;
          this.isHasUnreadReplyMsg = false;
          this.unReadMessageCount = 0;
        });
      },
      //滚动到目标处
      scrollToTarget() {
        const index = this.getTargetIndex(this.targetId);
        if (index > -1) {
          this.$refs.chatlist.scrollToIndex(index);
        } else {
          this.scrollBottom();
        }
        this.isHasUnreadNormalMsg = false;
        this.isHasUnreadAtMeMsg = false;
        this.isHasUnreadReplyMsg = false;
        this.unReadMessageCount = 0;
      },
      toBottom() {
        this.isHasUnreadNormalMsg = false;
        this.isHasUnreadAtMeMsg = false;
        this.isHasUnreadReplyMsg = false;
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
      //自己发送消息后的回调
      sendMsgEnd() {
        this.scrollBottom();
      },
      // 展示欢迎语
      showWelcome() {
        if (this.isWatch && this.nickName && this.welcomeText) {
          // 延时显示欢迎语
          setTimeout(() => {
            this.isShowWelcome = true;
            setTimeout(() => {
              // 3s后隐藏
              this.isShowWelcome = false;
            }, 3000);
          }, 1000);
        }
      },
      async onTotop() {
        if (this.isLoading) {
          return;
        }
        const offsetPos = this.pos;
        const { list } = await this.getHistoryMsg();
        const vsl = this.$refs.chatlist;
        this.$nextTick(() => {
          this.$refs.chatlist.scrollToIndex(list.length);
        });
      },
      checkOverflow() {
        this.$nextTick(() => {
          const vsl = this.$refs.chatlist;
          if (vsl) {
            this.overflow = vsl.getScrollSize() > vsl.getClientSize();
          }
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-container-fashion {
    @active-color: #fb3a32;
    @font-error: #fb3a32;
    width: 100%;
    height: 100%;
    position: relative;

    ::-webkit-scrollbar-thumb {
      background-color: var(--chat-scrollbar-thumb-bg) !important;
    }

    .vmp-chat-welcome {
      width: 100%;
      display: flex;
      justify-content: center;
      position: absolute;
      top: 5px;
      z-index: 1;

      &__greeting {
        max-width: 312px;
        background: linear-gradient(90deg, #fb3a32 0%, rgba(255, 172, 44, 0.8) 100%);
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        border-radius: 100px;
        color: #ffffff;
        font-size: 14px;
        line-height: 20px;
        padding: 6px 16px;
        text-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
        text-align: center;
      }

      &__nickname {
        display: inline-block;
        max-width: 126px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
        vertical-align: top;
      }
    }

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
      .chat_loading {
        text-align: center;
        font-size: 14px;
        line-height: 22px;
        color: rgba(255, 255, 255, 0.65);
      }
      &__get-list-btn-container {
        display: block;
        text-align: center;
        padding-top: 10px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
      }
      &__get-list-btn {
        cursor: pointer;
        color: #3562fa;
        font-size: 14px;
      }
      &__tip-box {
        position: absolute;
        z-index: 1;
        bottom: 4px;
        left: 50%;
        transform: translate(-50%, 0);
      }
      &__tip-mask {
        position: absolute;
        z-index: 0;
        bottom: 0;
        width: 100%;
        height: 10px;
        background: linear-gradient(0deg, rgba(0, 0, 0, 0.35) 3.39%, rgba(0, 0, 0, 0) 100%);
      }
      &__tip-box-content {
        background: rgba(255, 255, 255, 0.85);
        border-radius: 30px;
        padding: 4px 8px;
        font-size: 14px;
        line-height: 22px;
        color: #fb2626;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        .vh-line-arrow-down {
          font-size: 12px;
          margin-left: 7px;
        }
      }
    }
    .chat-special-effect {
      position: absolute;
      left: 0;
      top: 10px;
      &__item {
        width: 232px;
        height: 40px;
        background: linear-gradient(90deg, #fb3a32 0%, rgba(255, 172, 44, 0.8) 100%);
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        border-radius: 26px;
        position: absolute;
        left: 0;
        top: 10px;
        padding: 4px;
        padding-top: 11px;
        transition: all 200ms;
        background-image: url(../../common/img/red-package-bg.png);
        background-size: 100%;
        &.bg-applause {
          background-image: url(../../common/img/applause-bg.png);
        }
        &.bg-coffee {
          background-image: url(../../common/img/coffee-bg.png);
        }
        &.bg-custom {
          background-image: url(../../common/img/custom-bg.png);
        }
        &.bg-flower {
          background-image: url(../../common/img/flower-bg.png);
        }
        &.bg-praise {
          background-image: url(../../common/img/praise-bg.png);
        }
        &.bg-666 {
          background-image: url(../../common/img/666-bg.png);
        }
        &:first-child {
          animation: added 180ms;
        }
        &.opacity0 {
          opacity: 0;
        }
        .special-effect__img-box {
          width: 42px;
          height: 42px;
          border-radius: 21px;
          background-color: #fff;
          position: absolute;
          right: 16px;
          top: -1px;
          overflow: hidden;
        }
        .sepcial-effect__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sepcial-effect__img-bg-flower {
          width: 62px;
          position: absolute;
          right: 6px;
          top: -16px;
        }
        .sepcial-effect__img-bg-coffee {
          width: 62px;
          position: absolute;
          right: 6px;
          top: -16px;
        }
        .sepcial-effect__img-bg-applause {
          width: 62px;
          position: absolute;
          right: 6px;
          top: -16px;
        }
        .sepcial-effect__img-bg-praise {
          width: 62px;
          position: absolute;
          right: 6px;
          top: -16px;
        }
        .sepcial-effect__img-reward {
          width: 32px;
          position: absolute;
          right: 18px;
          top: -1px;
        }
        .sepcial-effect__img-bg-666 {
          width: 70px;
          position: absolute;
          right: -2px;
          top: -11px;
        }
      }
      @keyframes added {
        from {
          margin-left: -160px;
        }
        to {
          margin-left: 0;
        }
      }
      .special-effect__avatar-box {
        float: left;
        width: 40px;
        height: 40px;
        border-radius: 20px;
        .special-effect__avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 100%;
        }
      }
      .special-effect__middle-content {
        float: left;
        margin-left: 6px;
        font-size: 14px;
        color: #fff;
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
