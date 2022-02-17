<template>
  <div class="vmp-chat-wap">
    <div class="vmp-chat-wap__content">
      <!-- 如果开启观众手动加载聊天历史配置项，并且聊天列表为空的时候显示加载历史消息按钮 -->
      <p
        v-if="hideChatHistory && !chatList.length"
        class="vmp-chat-wap__content__get-list-btn-container"
      >
        <span @click="getHistoryMessage" class="vmp-chat-wap__content__get-list-btn">
          查看聊天历史消息
        </span>
      </p>
      <scroll ref="scroll" @pullingDown="handlePullingDown">
        <msg-item
          v-for="msg in chatList"
          :key="msg.count"
          :msg="msg"
          @preview="handlePreview"
        ></msg-item>
      </scroll>
      <div
        class="vmp-chat-wap__content__new-msg-tips"
        v-show="messageType.atList || messageType.reply || messageType.normal"
        @click="scrollBottom"
      >
        <span
          v-if="
            (messageType.normal && !messageType.atList && !messageType.reply) ||
            newMsgNum > 1 ||
            !((messageType.atList || messageType.reply) && newMsgNum <= 1 && messageType.noNormal)
          "
        >
          有{{ newMsgNum }}条未读消息
        </span>
        <span
          v-if="(messageType.atList || messageType.reply) && newMsgNum <= 1 && messageType.noNormal"
        >
          有人{{ messageType.atList ? '@' : '' }}{{ messageType.reply ? '回复' : '' }} 你
        </span>
        <i class="iconfont iconxiangxia"></i>
      </div>
    </div>
    <send-box
      :joinInfoInGift="joinInfoInGift"
      :totalLike="totalLike"
      :currentTab="3"
      :webinarData="webinar"
      :isAllBanned="isAllBanned"
      :isBanned="isBanned"
      :isHandsUp="isHandsUp"
      :noChatLogin="noChatLogin"
      :showInviteCard="showInviteCard"
      :deviceType="deviceType"
      :onlineMicStatus="onlineMicStatus"
    ></send-box>
    <!--    <div class="vmp-chat-wap__bottom-area">-->

    <!--    </div>-->
  </div>
</template>

<script>
  import scroll from './components/scroll';
  import msgItem from './components/msg-item';
  import sendBox from './components/send-box';
  import { useChatServer, useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import { ImagePreview } from 'vant';
  import defaultAvatar from './images/default_avatar.png';
  export default {
    name: 'VmpChatWap',
    components: {
      scroll,
      msgItem,
      sendBox
    },
    data() {
      const { chatList } = this.chatServer.state;
      return {
        //todo 聊天列表,接入domain
        chatList: chatList,
        //新消息信息集合体
        messageType: {
          atList: false,
          reply: false,
          normal: false,
          id: '',
          noNormal: false
        },
        //新消息数量
        newMsgNum: 0,
        //活动信息
        webinar: {},
        //是否隐藏聊天历史加载记录
        configList: {},
        //是否是全体禁言
        isAllBanned: false,
        //是否是禁言
        isBanned: false,
        //是否是举手
        isHandsUp: false,
        //是否不需要登录也可以参与聊天
        noChatLogin: false,
        //是否显示邀请卡
        showInviteCard: false,
        //设备类型
        deviceType: {
          audio: false,
          video: false
        },
        //在线的上麦状态
        onlineMicStatus: false,
        //总点赞数
        totalLike: 0,
        //当前页数 todo
        page: 1,
        //是否已经下拉刷新
        isPullingDown: false,
        //关键词列表
        keywordList: [],
        //房间号
        roomId: ''
      };
    },
    computed: {
      //是否开启手动加载聊天历史记录
      hideChatHistory() {
        return [1, '1'].includes(this.configList['ui.hide_chat_history']);
      },
      //礼物的参与信息 todo 待移除
      joinInfoInGift() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {} } = watchInitData;
        return {
          avatar: join_info.avatar,
          nickname: join_info.nickname,
          hideChatHistory: this.hideChatHistory
        };
      }
    },
    beforeCreate() {
      this.chatServer = useChatServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.initViewData();
      this.page = 0;
      if (!this.hideChatHistory) {
        this.getHistoryMessage();
      }

      this.imgUrls = [];
      // 给聊天服务保存一份关键词
      this.chatServer.setKeywordList(this.keywordList);
    },
    mounted() {},
    methods: {
      //初始化视图数据
      initViewData() {
        const { configList = {}, watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        console.log(join_info);
        this.webinar = webinar;
        this.configList = configList;
        this.roomId = interact.room_id;
      },
      // 获取历史消息
      async getHistoryMessage() {
        const data = {
          room_id: this.roomId,
          pos: this.page * 10,
          limit: 10 // 所有端统一显示50条
        };

        // eslint-disable-next-line no-void
        if (['', void 0, null].includes(this.chatServer.state.defaultAvatar)) {
          this.chatServer.setState('defaultAvatar', defaultAvatar);
        }

        const { chatList = [], imgUrls = [] } = await this.chatServer.getHistoryMsg(data, 'h5');
        if (chatList.length > 0) {
          this.imgUrls = imgUrls;
        } else {
          this.$refs.scroll.finishPullDown();
          this.isPullingDown = false;
        }
      },
      handlePreview(img) {
        const index = this.imgUrls.findIndex(item => item === img);
        ImagePreview({
          images: this.imgUrls,
          startPosition: index,
          lazyLoad: true
        });
      },
      //todo 下拉加载
      handlePullingDown() {
        this.page++;
        this.isPullingDown = true;
        this.getHistoryMessage();
      },
      //滚动到底部
      scrollBottom() {
        this.$refs.scroll.scrollBottom();
        this.messageType = {
          atList: false,
          reply: false,
          normal: false,
          id: '',
          noNormal: false
        };
        this.newMsgNum = 0;
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-wap {
    height: 100%;
    overflow: hidden;
    position: relative;
    &__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 120px;
      overflow: hidden;
      &__get-list-btn-container {
        width: 100%;
        text-align: center;
        color: #666666;
        font-size: 28px;
        padding-top: 20px;
      }
      &__get-list-btn {
      }
      &__new-msg-tips {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 60px;
        background-color: rgba(255, 233, 233, 0.9);
        border: 1px solid rgba(254, 129, 148, 1);
        color: #333333;
        font-size: 26px;
        display: flex;
        justify-content: center;
        align-items: center;
        .iconfont {
          font-size: 16px;
          margin-left: 19px;
        }
      }
    }
  }
</style>
