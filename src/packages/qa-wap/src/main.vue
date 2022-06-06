<template>
  <div class="qa" ref="chatWapQA" :class="smFix ? 'smFix' : ''">
    <div class="qa-content-wrapper" ref="chatContentMain">
      <div class="qa-content" ref="qaContent">
        <virtual-list
          v-if="virtual.showlist"
          ref="qalist"
          :style="{ height: chatlistHeight + 'px', overflow: 'auto' }"
          :keeps="15"
          :estimate-size="100"
          :data-key="'msgId'"
          :data-sources="qaList"
          :data-component="msgItem"
          @tobottom="tobottom"
          :extra-props="{
            isOnlyMine,
            joinId,
            length: qaList.length
          }"
        ></virtual-list>
        <div class="new-msg-tips" v-show="unReadMessageCount > 0" @click="scrollToTarget">
          <span>{{ tipMsg }}</span>
          <i class="vh-iconfont vh-line-arrow-down"></i>
        </div>
      </div>
    </div>
    <div class="overlay" v-show="showSendBox" @click="closeOverlay"></div>
    <send-box
      ref="sendBox"
      currentTab="qa"
      @showMyQA="showMyQA"
      @sendQa="sendQa"
      @login="handleLogin"
      key="qa"
      refName="chatWapQA"
      :is-banned="isBanned"
      :is-all-banned="allBanned && qa_allBanned_status"
    ></send-box>
  </div>
</template>
<script>
  import VirtualList from 'vue-virtual-scroll-list';
  import msgItem from './components/msg-item';
  import SendBox from '@/packages/chat-wap/src/components/send-box';
  import {
    useRoomBaseServer,
    useQaServer,
    useChatServer,
    useMenuServer,
    useGroupServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import emitter from '@/packages/app-shared/mixins/emitter';
  import EventBus from '@/packages/chat-wap/src/js/Events.js';
  import { isMse } from './js/utils.js';
  export default {
    name: 'VmpQaWap',
    mixins: [emitter],
    data() {
      return {
        msgItem,
        qaList: useQaServer().state.qaList,
        listCopy: [],
        tipMsg: '',
        isOnlyMine: false,
        unReadMessageCount: 0, // 是否点击了只看我的
        isBanned: useChatServer().state.banned, //true禁言，false未禁言
        allBanned: useChatServer().state.allBanned, //true全体禁言，false未禁言
        qa_allBanned_status: useChatServer().state.allBannedModuleList.qa_status, //全体禁言对问答是否生效
        watchInitData: useRoomBaseServer().state.watchInitData,
        //虚拟列表配置
        virtual: {
          showlist: false,
          contentHeight: 0
        },
        //聊天内容高度
        chatlistHeight: 0,
        //android的内初始部高度
        innerHeight: 0,
        //显示输入组件
        showSendBox: false,
        //小屏适配
        smFix: false
      };
    },
    computed: {
      roleName() {
        return this.watchInitData.join_info.role_name;
      },
      thirdPartyId() {
        return this.watchInitData.join_info.third_party_user_id;
      },
      joinId() {
        return this.watchInitData.join_info.join_id;
      },
      roomId() {
        return this.watchInitData.interact.room_id;
      },
      webinarId() {
        return this.watchInitData.webinar.id;
      },
      // isEmbed() {
      //   return this.embedObj.embed || this.embedObj.embedVideo;
      // },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      }
    },
    components: {
      VirtualList,
      SendBox
    },
    // watch: {
    //   qaList: function () {
    //     this.scrollBottom();
    //   }
    // },
    created() {
      this.menuServer = useMenuServer();
      this.getQAHistroy();
    },
    beforeDestroy() {
      //移除事件
      window.removeEventListener('resize', this.resizeAndroid);
      window.removeEventListener('focusin', this.focusinIOS);
      window.removeEventListener('focusout', this.focusoutIOS);
    },
    mounted() {
      this.listenEvents();
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
      window.aaaa = this.scrollBottom;
    },
    filters: {
      roleClassFilter(value) {
        return value == '1' ? 'host' : value == '3' ? 'assistant' : 'guest';
      }
    },
    methods: {
      //初始化eventbus
      initEvent() {
        EventBus.$on('showEmoji', e => {
          this.$nextTick(() => {
            if (e) {
              this.chatlistHeight =
                this.$refs.chatContentMain.clientHeight - this.$refs.sendBox.$el.clientHeight + 60;
              this.scrollBottom();
            } else {
              this.chatlistHeight = this.virtual.contentHeight;
            }
          });
        });
      },
      resizeAndroid() {
        const newInnerHeight = window.innerHeight;
        if (this.innerHeight > newInnerHeight) {
          // 键盘弹出事件处理
          // alert('android 键盘弹窗事件');
          // this.scrollBottom();
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
      listenEvents() {
        const qaServer = useQaServer();
        const chatServer = useChatServer();
        //收到提问
        qaServer.$on(qaServer.Events.QA_CREATE, msg => {
          if (msg.sender_id == this.thirdPartyId) {
            this.scrollBottom();
          }
        });
        //收到问答回复
        qaServer.$on(qaServer.Events.QA_COMMIT, msg => {
          if (
            msg.sender_id != this.thirdPartyId &&
            ((msg.data.join_id == this.joinId && msg.data.answer.is_open == '0') ||
              msg.data.answer.is_open != '0')
          ) {
            this.scrollBottom();
            // this.unReadMessageCount++;
            // this.tipMsg = this.$t('chat.chat_1035', { n: this.unReadMessageCount });
            this.dispatch('TabContent', 'noticeHint', 'v5');
          }
        });
        //监听禁言通知
        chatServer.$on('banned', res => {
          this.isBanned = res;
        });
        //监听全体禁言通知
        chatServer.$on('allBanned', (status, msg) => {
          this.allBanned = status;
          if (msg) {
            this.qa_allBanned_status = msg.qa_status == 1 ? true : false;
          }
        });
        //监听切换到当前tab
        this.menuServer.$on('tab-switched', data => {
          this.$nextTick(() => {
            this.virtual.contentHeight = this.$refs.qaContent?.offsetHeight;
            this.virtual.showlist = data.cuid == this.cuid;
            this.chatlistHeight = this.virtual.contentHeight;
            this.scrollBottom();
          });
        });
        useGroupServer().$on('ROOM_CHANNEL_CHANGE', () => {
          if (!this.isInGroup) {
            this.getQAHistroy();
          }
        });
      },
      //切换到当前tab时
      switchToBack() {
        this.scrollBottom();
      },
      /**
       * 获取历史问答
       */
      getQAHistroy() {
        useQaServer().getQaHistory();
      },
      /**
       * 观众发送问题
       */
      sendQa(inputValue) {
        const data = {
          room_id: this.webinarId,
          content: inputValue
        };
        useQaServer()
          .sendQaMsg(data)
          .then(() => {
            this.scrollBottom();
          });
      },
      //唤起登录弹窗
      handleLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$refs && this.$refs.qalist && this.$refs.qalist.scrollToBottom();
          this.unReadMessageCount = 0;
        });
      },
      //滚动到目标处
      scrollToTarget() {
        const index = this.qaList.length - this.unReadMessageCount;
        this.$refs.qalist.scrollToIndex(index);
        this.unReadMessageCount = 0;
      },
      tobottom() {
        this.unReadMessageCount = 0;
      },
      //滚动条是否在最底部
      isBottom() {
        return (
          this.$refs.qalist &&
          this.$refs.qalist.$el.scrollHeight -
            this.$refs.qalist.$el.scrollTop -
            this.$refs.qalist.getClientSize() <
            5
        );
      },
      showMyQA(status) {
        this.isOnlyMine = status;
      },
      // eventBus监听
      eventListener() {
        //监听聊天组件是否打开
        EventBus.$on('showSendBox', e => {
          this.showSendBox = e;
        });
      },
      //关闭遮罩层
      closeOverlay() {
        EventBus.$emit('showSendBox', false);
      }
    }
  };
</script>
<style lang="less">
  .qa {
    height: 100%;
    overflow: hidden;
    position: relative;
    .qa-content-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 94px;
      overflow-x: hidden;
      overflow-y: auto;
      .qa-content {
        height: 100%;
        overflow: hidden;
        position: relative;
        .qa-item-wrapper {
          padding: 0 30px;
          &.qa-last-ios-progress {
            padding-bottom: 34px;
          }
          .question {
            padding: 20px 0;
          }
          .answer {
            padding: 20px;
            background: rgba(249, 249, 249, 1);
            border-radius: 8px;
          }
          .user {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            color: #666666;
            padding: 1px;
            .avatar-box {
              width: 70px;
              height: 70px;
              border: 2px solid #e3e3e3;
              border-radius: 50%;
              overflow: hidden;
              margin-right: 20px;
              display: inline-block;
            }
            .avatar {
              width: 100%;
              height: 100%;
              display: block;
            }
            .role {
              margin-right: 10px;
              padding: 3px 10px;
              line-height: 28px;
              border-radius: 50px;
              font-size: 20px;
              &.host {
                background-color: rgba(252, 86, 89, 0.2);
                color: #fb3a32;
              }
              &.assistant {
                background-color: rgba(166, 166, 166, 0.2);
                color: #a6a6a6;
              }
              &.guest {
                background-color: rgba(77, 161, 255, 0.2);
                color: #4da1ff;
              }
            }
            .nick-name {
              flex: 1;
              line-height: 50px;
              font-size: 26px;
              overflow: hidden;
              text-overflow: ellipsis;
              font-weight: bolder;
              white-space: nowrap;
            }
          }
          .content {
            line-height: 40px;
            color: #444444;
            // text-align: justify;
            word-break: break-word;
            .question-label {
              color: #fb3a32;
              float: left;
            }
            .question-reply {
              display: inline-block;
            }
          }
        }
      }
      .new-msg-tips {
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
        .vh-iconfont {
          font-size: 16px;
          margin-left: 19px;
        }
      }
    }
    .send-box-warpper {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
    }
    .send-box {
      padding: 20px 30px;
      @include border(top, #e2e2e2);
      display: flex;
      align-items: center;
      color: #444444;
      .input-wrapper {
        padding: 19px 20px;
        margin-right: 30px;
        flex: 1;
        background-color: #f5f5f5;
        border-radius: 50px;
        font-size: 30px;
        line-height: 42px;
      }
      .only-my {
        color: #fb3a32;
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
