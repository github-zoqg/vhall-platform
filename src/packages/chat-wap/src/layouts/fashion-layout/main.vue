<template>
  <div class="vmp-chat-wap-fashion" ref="chatWap" :class="smFix ? 'smFix' : ''">
    <!-- 礼物动画组件 -->
    <vmp-air-container :oneself="true" :cuid="childrenCom[1]"></vmp-air-container>
    <!-- 礼物动画组件-svga -->
    <vmp-air-container :oneself="true" :cuid="childrenCom[2]"></vmp-air-container>
    <div class="vmp-chat-wap-fashion__content" ref="chatContentMain">
      <!-- 如果开启观众手动加载聊天历史配置项，并且聊天列表为空的时候显示加载历史消息按钮 -->
      <!-- <p
        v-if="isShowChatHistoryBtn && !hideChatHistory && overflow"
        class="vmp-chat-wap-fashion-fashion__content__get-list-btn-container"
      >
        <span @click="getHistoryMessage" class="vmp-chat-wap-fashion__content__get-list-btn">
          {{ $t('chat.chat_1058') }}
        </span>
      </p> -->
      <div ref="chatContent" class="virtual-content">
        <virtual-list
          class="virtual-list"
          v-if="virtual.showlist"
          ref="chatlist"
          :style="{ height: chatlistHeight + 'px', overflow: allowScroll ? 'auto' : 'hidden' }"
          :keeps="50"
          :estimate-size="100"
          :data-key="'count'"
          :data-sources="renderList"
          :data-component="msgItem"
          :extra-props="{
            previewImg: previewImg.bind(this),
            emitLotteryEvent,
            emitQuestionnaireEvent,
            emitExamEvent,
            joinInfo
          }"
          @totop="onTotop"
          @tobottom="toBottom"
        >
          <div
            class="chat_loading"
            slot="header"
            v-show="overflow && isLoading"
            style="height: 20px"
          >
            <i class="el-icon-loading"></i>
          </div>
        </virtual-list>
        <div
          class="vmp-chat-wap-fashion__content__new-msg-tips"
          v-show="
            unReadMessageCount !== 0 &&
            (isHasUnreadNormalMsg || isHasUnreadAtMeMsg || isHasUnreadReplyMsg)
          "
          @click="scrollToTarget"
        >
          <span>{{ tipMsg }}</span>
          <i class="vh-iconfont vh-line-arrow-down"></i>
        </div>
      </div>
    </div>
    <div
      class="overlay"
      v-show="showSendBox"
      @touchstart="closeOverlay(true)"
      @click.stop="closeOverlay(false)"
    ></div>
    <send-box
      ref="sendBox"
      :currentTab="3"
      :isAllBanned="allBanned"
      :isBanned="isBanned"
      :isHandsUp="isHandsUp"
      :deviceType="deviceType"
      :onlineMicStatus="onlineMicStatus"
      @showUserPopup="showUserPopup"
      @login="handleLogin"
      @sendEnd="sendMsgEnd"
      @filterChat="filterChat"
    ></send-box>
  </div>
</template>

<script>
  import VirtualList from 'vue-virtual-scroll-list';
  import msgItem from './components/msg-item';
  import sendBox from '../../common/components/send-box';
  import {
    useChatServer,
    useRoomBaseServer,
    useGroupServer,
    useMicServer,
    useMenuServer,
    useMsgServer
  } from 'middle-domain';
  import { ImagePreview } from 'vh5-ui';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  import emitter from '@/app-shared/mixins/emitter';
  import EventBus from '../../common/js/Events.js';
  import { isMse } from '@/app-shared/utils/isMse';

  export default {
    name: 'VmpChatWapFashion',
    components: {
      VirtualList,
      // msgItem,
      sendBox
    },
    mixins: [emitter],
    data() {
      return {
        msgItem,
        //新消息信息集合体
        messageType: {
          atList: false,
          reply: false,
          normal: false,
          id: '',
          noNormal: false
        },
        //消息提示
        tipMsg: '',
        //是否有常规未读消息
        isHasUnreadNormalMsg: false,
        //是否有@我的未读消息
        isHasUnreadAtMeMsg: false,
        //是否有未读的回复消息
        isHasUnreadReplyMsg: false,
        //新消息数量
        unReadMessageCount: 0,
        //活动信息
        webinar: {},
        //关键词列表
        keywordList: [],
        //房间号
        roomId: '',
        //是否是嵌入端
        isEmbed: false,
        //true禁言，false未禁言
        isBanned: useChatServer().state.banned,
        //true全体禁言，false未禁言
        allBanned: useChatServer().state.allBanned,
        //虚拟列表配置
        virtual: {
          showlist: false,
          contentHeight: 0
        },
        //聊天消息是否有滚动条
        overflow: false,
        //每次加载的消息条数
        pageSize: 50,
        isLoading: false,
        //聊天内容高度
        chatlistHeight: 0,
        //android的内初始部高度
        innerHeight: 0,
        //显示输入组件
        showSendBox: false,
        childrenCom: [],
        //小屏适配
        smFix: false,
        //隐藏拉取历史聊天按钮
        hideChatHistory: false,
        //回复或@消息id
        targetId: '',
        isFirstPageReady: false,
        renderList: [],
        isShieldingEffects: sessionStorage.getItem('isShieldingEffects') == 'true',
        allowScroll: true
      };
    },
    watch: {
      chatList: function () {
        this.filterChat(false);
        if (this.isBottom()) {
          this.scrollBottom();
          this.checkOverflow();
        }
      },
      isWapBodyDocSwitch() {
        this.changeChatHeight();
      }
    },
    computed: {
      //是否开启手动加载聊天历史记录
      isShowChatHistoryBtn() {
        return [1, '1'].includes(this.configList['ui.hide_chat_history']);
      },
      //当前登录人信息
      joinInfo() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {} } = watchInitData;
        return join_info;
      },
      //是否允许举手
      isHandsUp() {
        const { interactToolStatus = {} } = this.roomBaseServer.state;
        return interactToolStatus && !!interactToolStatus['is_handsup'];
      },
      // 设备状态
      deviceType() {
        const { interactToolStatus = {} } = this.roomBaseServer.state;
        let muteType = {};
        const { groupInitData = {} } = this.groupServer.state;
        if (this.webinar.mode == 6 && groupInitData.speaker_list && groupInitData.isInGroup) {
          muteType = groupInitData.speaker_list.find(
            ele => ele.account_id === this.joinInfo.third_party_user_id
          );
        } else {
          muteType =
            interactToolStatus &&
            Array.isArray(interactToolStatus.speaker_list) &&
            interactToolStatus.speaker_list.find(
              ele => ele.account_id === this.joinInfo.third_party_user_id
            );
        }
        if (muteType) {
          return {
            audio:
              (muteType.audio != 1 && !groupInitData.isInGroup) ||
              (muteType.audio != 1 && groupInitData.isInGroup && groupInitData.join_role == 2),
            video: muteType.video != 1
          };
        } else {
          return {
            // 开启自动上麦需要静音
            audio:
              (this.webinar.mode == 6 &&
                interactToolStatus.auto_speak == 1 &&
                !groupInitData.isInGroup) ||
              (groupInitData.join_role == 2 && groupInitData.isInGroup),
            video: false
          };
        }
      },
      //是否已上麦
      onlineMicStatus() {
        return (useMicServer().state.speakerList || []).some(item => {
          return (
            item.account_id == this.joinInfo.third_party_user_id ||
            item.accountId == this.joinInfo.third_party_user_id
          );
        });
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
      //黄金链路配置
      configList() {
        return this.roomBaseServer.state.configList;
      },
      chatList() {
        return this.$domainStore.state.chatServer.chatList;
      },
      pos() {
        return this.$domainStore.state.chatServer.pos;
      },
      isSmallPlayer() {
        return this.$domainStore.state.playerServer.isSmallPlayer;
      },
      // wap-body和文档是否切换位置
      isWapBodyDocSwitch() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitch;
      }
    },
    beforeCreate() {
      this.chatServer = useChatServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
      this.menuServer = useMenuServer();
      this.chatServer.init();
    },
    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      this.initViewData();
      // 给聊天服务保存一份关键词
      // this.chatServer.setKeywordList(this.keywordList);
    },
    mounted() {
      this.listenChatServer();
      this.showWelcomeTxt();
      if (!this.isShowChatHistoryBtn) {
        this.getHistoryMessage(true);
      }
      const IsMse = isMse();
      if (IsMse.os === 'android') {
        this.innerHeight = window.innerHeight;
        window.addEventListener('resize', this.resizeAndroid);
      } else if (IsMse.os === 'ios') {
        window.addEventListener('focusin', this.focusinIOS);
        window.addEventListener('focusout', this.focusoutIOS);
      }
      // this.initEvent();
      this.eventListener();
    },
    beforeDestroy() {
      //移除事件
      window.removeEventListener('resize', this.resizeAndroid);
      window.removeEventListener('focusin', this.focusinIOS);
      window.removeEventListener('focusout', this.focusoutIOS);
    },
    methods: {
      //初始化eventbus
      initEvent() {
        EventBus.$on('showEmoji', e => {
          this.$nextTick(() => {
            if (e) {
              this.chatlistHeight =
                this.$refs.chatContentMain.clientHeight - this.$refs.sendBox.$el.clientHeight + 60;
              // this.scrollBottom();
            } else {
              this.chatlistHeight = this.virtual.contentHeight;
            }
          });
        });
      },
      checkOverflow() {
        this.$nextTick(() => {
          const vsl = this.$refs.chatlist;
          if (vsl) {
            this.overflow = vsl.getScrollSize() > vsl.getClientSize();
          }
        });
      },
      resizeAndroid() {
        const newInnerHeight = window.innerHeight;
        if (this.innerHeight > newInnerHeight) {
          // 键盘弹出事件处理
          // alert('android 键盘弹窗事件');
          //this.scrollBottom();
        } else {
          // 键盘收起事件处理
          // alert('android 键盘收起事件处理');
        }
      },
      focusoutIOS() {
        // 键盘收起事件处理
        // alert('iphone 键盘收起事件处理');
      },
      focusinIOS() {
        // 键盘弹出事件处理
        // alert('iphone 键盘弹出事件处理');
        // this.scrollBottom();
      },
      showWelcomeTxt() {
        // 注意： 欢迎语不能跟弹框重合，需要有点距离，此处进行了特殊处理
        this.welcomeText &&
          this.$toast({
            message: `${this.joinInfo.nickname}${this.welcomeText}`,
            position: 'bottom'
          });
      },
      //初始化视图数据
      initViewData() {
        const { watchInitData = {}, embedObj = {} } = this.roomBaseServer.state;
        const { webinar = {}, interact = {} } = watchInitData;
        const { embed = false } = embedObj;
        this.webinar = webinar;
        this.roomId = interact.room_id;
        this.isEmbed = embed;
      },
      listenChatServer() {
        const chatServer = useChatServer();
        const msgServer = useMsgServer();
        // const giftsServer = useGiftsServer();
        //监听到新消息过来
        chatServer.$on('receiveMsg', () => {
          if (!this.isBottom()) {
            this.targetId = '';
            this.isHasUnreadNormalMsg = true;
            this.isHasUnreadAtMeMsg = false;
            this.isHasUnreadReplyMsg = false;
            this.unReadMessageCount++;
            this.tipMsg = this.$t('chat.chat_1035', { n: this.unReadMessageCount });
          }
          this.dispatch('TabContent', 'noticeHint', 3);
        });
        //监听@我的消息
        chatServer.$on('atMe', msg => {
          if (!this.isBottom()) {
            this.targetId = msg.msg_id;
            this.isHasUnreadNormalMsg = false;
            this.isHasUnreadReplyMsg = false;
            this.isHasUnreadAtMeMsg = true;
            this.tipMsg = this.$t('chat.chat_1075');
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
          }
        });
        //监听禁言通知
        chatServer.$on('banned', res => {
          this.isBanned = res;
        });
        //监听全体禁言通知
        chatServer.$on('allBanned', res => {
          this.allBanned = res;
        });
        //监听分组房间变更通知
        // chatServer.$on('changeChannel', () => {
        //   this.handleChannelChange();
        // });
        this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
          this.handleChannelChange();
        });
        //监听被提出房间消息
        chatServer.$on('roomKickout', () => {
          this.$toast(this.$t('chat.chat_1007'));
        });
        //监听切换到当前tab
        this.menuServer.$on('tab-switched', data => {
          this.$nextTick(() => {
            this.virtual.contentHeight = this.$refs.chatContent?.offsetHeight;
            this.virtual.showlist = data.cuid == this.cuid;
            this.chatlistHeight = this.virtual.contentHeight;
            this.scrollBottom();
          });
        });
        msgServer.$onMsg('ROOM_MSG', msg => {
          if (msg.data.type == 'live_start') {
            chatServer.clearChatMsg();
            this.getHistoryMessage();
          }
        });
      },
      //处理分组讨论频道变更
      handleChannelChange() {
        useChatServer().clearChatMsg();
        this.getHistoryMessage();
      },
      // 获取历史消息
      async getHistoryMessage(isfirst) {
        this.isLoading = true;
        const data = {
          isfirst,
          room_id: this.roomId,
          msg_id: this.getFirstMsg()?.msgId,
          limit: this.pageSize,
          is_role: 0,
          anchor_path: this.chatList[0]?.msgId ? 'down' : undefined //up 拉新,down拉旧
        };
        // eslint-disable-next-line no-void
        if (['', void 0, null].includes(this.chatServer.state.defaultAvatar)) {
          this.chatServer.setState('defaultAvatar', defaultAvatar);
        }
        const res = await this.chatServer.getHistoryMsg(data, 'h5');
        this.hideChatHistory = true;
        this.$nextTick(() => {
          this.isLoading = false;
        });
        return res;
      },
      //获取第一条有msgid的消息
      getFirstMsg() {
        return this.chatList.find(item => {
          return item.msgId;
        });
      },
      //图片预览
      previewImg(img, index = 0, list = []) {
        if ((Array.isArray(list) && !list.length) || index < 0) {
          return;
        }
        const newList = JSON.parse(JSON.stringify(list));
        const clientW = document.body.clientWidth;
        const clientH = document.body.clientHeight;
        const ratio = 2;
        for (let i = 0; i < newList.length; i++) {
          if (newList[i].indexOf('?x-oss-process=image/resize') < 0) {
            newList[i] += `?x-oss-process=image/resize,w_${clientW * ratio},h_${
              clientH * ratio
            },m_lfit`;
          }
        }
        console.log('preview', newList);
        ImagePreview({
          images: newList,
          startPosition: index,
          lazyLoad: true,
          loop: false
        });
      },
      //获取目标消息索引
      getTargetIndex(id) {
        return this.chatList.findIndex(item => {
          return item.msgId == id;
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
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$refs && this.$refs.chatlist && this.$refs.chatlist.scrollToBottom();
          this.unReadMessageCount = 0;
          this.isHasUnreadNormalMsg = false;
          this.isHasUnreadAtMeMsg = false;
          this.isHasUnreadReplyMsg = false;
        });
      },
      //监听滚动条滚动到底部
      toBottom() {
        this.unReadMessageCount = 0;
        this.isHasUnreadNormalMsg = false;
        this.isHasUnreadAtMeMsg = false;
        this.isHasUnreadReplyMsg = false;
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
      showUserPopup() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenUserCenterWap'));
      },
      //唤起登录弹窗
      handleLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      //自己发送消息后的回调
      sendMsgEnd() {
        this.scrollBottom();
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
          // 推送-快问快答
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickExamChatItem', [vo.examId, 'answer'])
          );
        }
      },
      // 音频模式播放器大小变动 高度重新计算
      changeChatHeight(data) {
        console.log(data, 'data1313');
        let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
        // postcss 换算基数为75 头部+播放器区域高为 522px 120为聊天区域高度
        let playerHeight = this.isSmallPlayer == true && !this.isWapBodyDocSwitch ? 130 : 422;
        let baseHeight = playerHeight + 71 + 94 + 90;
        if (this.isEmbed) {
          baseHeight = playerHeight + 94 + 90;
        }
        this.chatlistHeight = this.virtual.contentHeight =
          document.body.clientHeight - (baseHeight / 75) * parseFloat(htmlFontSize);
      },
      async onTotop() {
        if (this.isLoading) {
          return;
        }
        this.allowScroll = false;
        const { list } = await this.getHistoryMessage();
        const IdList = list.map(item => {
          return item.count.toString();
        });
        const vsl = this.$refs.chatlist;
        console.log(IdList);
        this.$nextTick(() => {
          if (IdList.length != 0) {
            const offset = IdList.reduce((previousValue, currentSid) => {
              const previousSize =
                typeof previousValue === 'string'
                  ? vsl.getSize(Number(previousValue))
                  : previousValue;
              console.log(previousValue);
              console.log(vsl.getSize(Number(currentSid)));
              return previousSize + vsl.getSize(Number(currentSid));
            });
            vsl.scrollToOffset(offset);
          }
        });
        setTimeout(() => {
          this.allowScroll = true;
        });
      },
      // eventBus监听
      eventListener() {
        //监听聊天组件是否打开
        EventBus.$on('showSendBox', e => {
          this.showSendBox = e;
        });
      },
      //关闭遮罩层
      closeOverlay(isDelay) {
        if (isDelay) {
          setTimeout(() => {
            EventBus.$emit('showSendBox', false);
          }, 400);
        } else {
          EventBus.$emit('showSendBox', false);
        }
      },
      // 聊天过滤
      filterChat(data) {
        console.log(this.chatList, 'this.chatList');
        if (data) {
          this.scrollBottom();
        }
        // 过滤特效
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitSetHideEffect', [
            sessionStorage.getItem('isShieldingEffects') == 'true'
          ])
        );
        // 实现主看主办方效果
        if (
          sessionStorage.getItem('onlyShowSponsor') == 'true' &&
          sessionStorage.getItem('only_isChat') != 'true'
        ) {
          console.log('onlyShowSponsor');
          return (this.renderList = this.chatList.filter(
            item => ![2, '2'].includes(item.roleName)
          ));
        }
        // 实现主看主办方效果&&仅查看聊天内容
        if (
          sessionStorage.getItem('onlyShowSponsor') == 'true' &&
          sessionStorage.getItem('only_isChat') == 'true'
        ) {
          console.log('onlyShowSponsor');
          return (this.renderList = this.chatList.filter(
            item => ![2, '2'].includes(item.roleName) && ['text', 'image'].includes(item.type)
          ));
        }
        // 实现仅查看聊天消息
        if (
          sessionStorage.getItem('only_isChat') == 'true' &&
          sessionStorage.getItem('onlyShowSponsor') != 'true'
        ) {
          console.log('only_isChat');
          // undefined为历史聊天消息
          return (this.renderList = this.chatList.filter(item =>
            ['text', 'image'].includes(item.type)
          ));
        }
        return (this.renderList = this.chatList);
      }
    }
  };
</script>

<style lang="less">
  .van-image-preview__overlay {
    background-color: rgb(0, 0, 0) !important;
  }
  .vmp-chat-wap-fashion {
    height: 100%;
    overflow: hidden;
    position: relative;

    ::-webkit-scrollbar-thumb {
      background-color: var(--chat-scrollbar-thumb-bg) !important;
    }

    .virtual-content {
      height: 100%;
      overflow: hidden;
      position: relative;

      .virtual-list {
        height: 100%;
        overflow: auto;
      }

      > div:first-of-type {
        padding-top: 24px;
      }
    }
    &__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 94px;
      overflow-x: hidden;
      overflow-y: auto;
      &__get-list-btn-container {
        width: 100%;
        text-align: center;
        color: #666;
        font-size: 28px;
        padding-top: 20px;
      }
      &__new-msg-tips {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 16px;
        width: fit-content;
        height: 60px;
        background: #ffffff;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08), 0px 4px 12px rgba(0, 0, 0, 0.1);
        border-radius: 30px;
        color: #0a7ff5;
        font-size: 28px;
        padding: 10px 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        .vh-iconfont {
          font-size: 16px;
          margin-left: 11px;
        }
      }
    }
    > .overlay {
      width: 100vw;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      background: transparent;
    }
  }
</style>
