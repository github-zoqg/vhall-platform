<template>
  <div ref="chat" class="vhsaas-chat">
    <template v-if="!assistantType">
      <div
        class="vhsaas-chat__body-wrapper"
        :style="{ height: 'calc(100% - ' + operatorHeight + 'px)' }"
      >
        <virtual-list
          ref="qalist"
          style="height: 100%; overflow: auto"
          :keeps="15"
          :estimate-size="100"
          :data-key="'msgId'"
          :data-sources="qaList"
          :data-component="MsgItem"
          :extra-props="{
            isOnlyMine,
            joinId,
            roleName
          }"
          @tobottom="tobottom"
        ></virtual-list>
        <div class="vhsaas-chat__body__bottom-tip-box">
          <div
            v-show="unReadMessageCount !== 0"
            class="vhsaas-chat__body__bottom-tip"
            @click="scrollToTarget"
          >
            {{ tipMsg }}
            <span class="iconfont iconyourennijiantou"></span>
          </div>
        </div>
      </div>
      <div v-if="roleName != 2" class="button-container">
        <p @click="openQa">问答管理</p>
      </div>
      <chat-operator
        v-else
        ref="chatQaOperator"
        :chat-list="qaList"
        :chat-login-status="chatLoginStatus"
        :input-status="inputStatus"
        @chatTextareaHeightChange="chatTextareaHeightChange"
        @onOnlyMine="onOnlyMine"
        @onInputStatus="onInputStatus"
        @needLogin="handleLogin"
      ></chat-operator>
    </template>

    <!-- 问答 -->
    <el-dialog title="问答" :visible.sync="qaVisible" width="400px" class="qa_modal" append-to-body>
      <div class="qa_content" v-if="qaVisible">
        <template>
          <div v-if="!isQAEnabled">
            <p class="qa_content_txt">
              1、开启后，右侧互动区会增加“问答”模块，可进入右下角「问答管理」处理提问。
            </p>
            <p class="qa_content_txt">
              2、支持修改「问答」的显示名称，如改成「提问」「投票」等，修改后的名称在用户观看时生效。
            </p>
            <el-form class="qa_content_form" inline>
              <el-form-item label="显示名称" class="qa_name_item">
                <el-input
                  class="form-input qa_name"
                  maxlength="8"
                  placeholder="请输入名称"
                  show-word-limit
                  v-model="QAName"
                ></el-input>
              </el-form-item>
            </el-form>
          </div>
          <p class="qa_content_txt" v-if="isQAEnabled">
            该功能已开启，是否关闭？ 当前已收集问题：{{ qaCount }} 个
          </p>
          <el-form inline class="qa_content_form" v-if="isQAEnabled">
            <el-form-item label="显示名称" class="qa_name_item">
              <el-input
                class="form-input qa_name"
                maxlength="8"
                show-word-limit
                v-model="QAName"
                :disabled="isQAEnabled"
              ></el-input>
            </el-form-item>
          </el-form>
        </template>
        <!-- <template v-else>
          <p class="qa_content_txt" v-if="!isQAEnabled">
            点击后打开“问答管理”页面，观众端显示“问答”。
          </p>
          <p class="qa_content_txt" v-if="isQAEnabled">
            问答关闭后，观众端将不能提问。 当前已收集问题：{{ qaCount }}
            个
          </p>
        </template> -->
      </div>
      <div class="enable_qa_btn" slot="footer">
        <el-button type="primary" round @click="handleQASubmit" v-if="qaVisible">
          {{ !isQAEnabled ? '开启' : '关闭' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { debounce } from 'lodash';
  import ChatOperator from './components/chat-operator';
  import MsgItem from './components/msg-item';
  // import { textToEmojiText } from ''@/packages/chat/src/common/js/emoji';
  import {
    useRoomBaseServer,
    useQaServer,
    useChatServer,
    useGroupServer,
    useMsgServer,
    useMenuServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  import { cl_openQAAdmin } from '@/app-shared/client/client-methods.js';
  import VirtualList from 'vue-virtual-scroll-list';
  import emitter from '@/app-shared/mixins/emitter';
  export default {
    name: 'VmpQa',
    components: {
      ChatOperator,
      VirtualList
    },
    mixins: [emitter],
    data() {
      return {
        MsgItem,
        isQAEnabled: useRoomBaseServer().state.interactToolStatus.question_status ? true : false,
        qaVisible: false,
        qaCount: 0,
        QAName: '问答',
        qaList: useQaServer().state.qaList,
        inputValue: '',
        inputStatus: {
          disable: false,
          placeholder: this.$t('chat.chat_1003')
        },
        //是否需要登录
        chatLoginStatus: false,

        operatorHeight: 91,
        // 滚动条状态 start
        osComponentOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        },
        doScroll: false,
        animationRunning: false,
        // 滚动条状态 end
        unReadMessageCount: 0, // 未读消息数量
        isOnlyMine: false,
        isHasUnreadNormalMsg: false,
        tipMsg: '',
        isBanned: useChatServer().state.banned, //true禁言，false未禁言
        allBanned: useChatServer().state.allBanned, //true全体禁言，false未禁言
        qa_allBanned_status: useChatServer().state.allBannedModuleList.qa_status, //全体禁言对问答是否生效
        watchInitData: useRoomBaseServer().state.watchInitData,
        //客户端嵌入参数
        assistantType: this.$route.query.assistantType
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
      userId() {
        return this.watchInitData.join_info.user_id;
      },
      roomId() {
        return this.watchInitData.interact.room_id;
      },
      webinarId() {
        return this.watchInitData.webinar.id;
      },
      isEmbed() {
        // 是不是音视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      //黄金链路配置
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      },
      noLoginKey() {
        return this.configList['ui.show_chat_without_login'];
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      //互动工具状态
      interactToolStatus() {
        const { interactToolStatus = {} } = this.$domainStore.state.roomBaseServer;
        return interactToolStatus;
      }
    },
    watch: {
      qaList: function () {
        if (this.isBottom()) {
          this.scrollBottom();
        }
      },
      // 聊天免登录的配置项更改，重新计算是否需要登录聊天
      noLoginKey() {
        this.initLoginStatus();
      }
    },
    async mounted() {
      this.listenEvents();
      this.initLoginStatus();
      this.initInputStatus();
      if (this.roleName != 2) {
        const qaServer = useQaServer();
        await this.getQaHistoryMsg();
        qaServer.setState('active', true);
      }
    },
    methods: {
      listenEvents() {
        const chatServer = useChatServer();
        const msgServer = useMsgServer();
        const menuServer = useMenuServer();
        const qaServer = useQaServer();
        //监听新建问答消息
        qaServer.$on(qaServer.Events.QA_CREATE, msg => {
          if (msg.sender_id == this.thirdPartyId) {
            this.scrollBottom();
          } else if (this.roleName != 2 && !this.isBottom()) {
            this.unReadMessageCount++;
            this.tipMsg = this.$t('chat.chat_1078');
          }
        });
        //监听问答回复消息
        qaServer.$on(qaServer.Events.QA_COMMIT, msg => {
          if (
            msg.sender_id != this.thirdPartyId &&
            ((msg.data.join_id == this.joinId && msg.data.answer.is_open == '0') ||
              msg.data.answer.is_open != '0')
          ) {
            this.unReadMessageCount++;
            this.tipMsg = this.$t('chat.chat_1078');
            this.dispatch('VmpTabContainer', 'noticeHint', 'v5');
          }
        });
        //监听撤销问答回复消息
        qaServer.$on(qaServer.Events.QA_BACKOUT, msg => {});
        //监听禁言通知
        chatServer.$on('banned', res => {
          this.isBanned = res;
          this.initInputStatus();
        });
        //监听全体禁言通知
        chatServer.$on('allBanned', (status, msg) => {
          this.allBanned = status;
          if (msg) {
            this.qa_allBanned_status = msg.qa_status == 1 ? true : false;
          }
          this.initInputStatus();
        });
        msgServer.$on('live_over', () => {
          this.isQAEnabled = false;
          this.qaVisible = false;
        });
        qaServer.$on(qaServer.Events.QA_OPEN, msg => {
          this.isQAEnabled = true;
        });
        qaServer.$on(qaServer.Events.QA_CLOSE, msg => {
          this.isQAEnabled = false;
        });
        qaServer.$on(qaServer.Events.QA_SET, msg => {
          this.QAName = msg.name;
        });
        useGroupServer().$on('ROOM_CHANNEL_CHANGE', () => {
          if (!this.isInGroup) {
            this.getQaHistoryMsg();
          }
        });
        menuServer.$on('tab-switched', async data => {
          if (
            this.cuid === data.cuid &&
            !qaServer.state.active &&
            [2, '2'].includes(this.roleName)
          ) {
            await this.getQaHistoryMsg();
            qaServer.setState('active', true);
          }
        });
      },
      initInputStatus() {
        this.inputStatus.disable = this.isBanned || (this.allBanned && this.qa_allBanned_status);
        if (this.isBanned) {
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        } else if (this.allBanned && this.qa_allBanned_status) {
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        } else {
          this.inputStatus.placeholder = this.$t('chat.chat_1003');
        }
        const isVod =
          (this.watchInitData.webinar.type == 5 || this.watchInitData.webinar.type == 4) &&
          this.configList['ui.watch_record_no_chatting'];
        // 判断控制台回放禁言状态
        if (isVod) {
          this.inputStatus.disable = true;
          this.inputStatus.placeholder = this.$t('chat.chat_1079');
        }
      },
      // 更改输入框提示语
      onInputStatus(data) {
        this.inputStatus.placeholder = data;
      },
      // 初始化聊天登录状态
      initLoginStatus() {
        if (
          [2, '2'].includes(this.roleName) &&
          !this.isEmbed &&
          (!this.userId || this.userId == 0) &&
          this.configList['ui.show_chat_without_login'] != 1
        ) {
          this.chatLoginStatus = true;
          this.inputStatus.placeholder = '';
        } else {
          // 非嵌入并或者是没有登录
          this.chatLoginStatus = false;
        }
      },
      // 获取历史消息
      getQaHistoryMsg() {
        return useQaServer().getQaHistory();
      },
      chatTextareaHeightChange(operatorHeight) {
        this.operatorHeight = operatorHeight;
        this.$refs.chatQaOperator.overlayScrollbar.update();
      },
      // 只看我的按钮 change 事件
      onOnlyMine(status) {
        this.isOnlyMine = status;
      },
      openQa() {
        const base = process.env.NODE_ENV === 'development' ? '/v3/' : '/v3/';
        const url = location.search
          ? `${base}lives/qa/${this.webinarId}`
          : `${base}lives/qa/${this.webinarId}`;
        if (this.$route.query.assistantType) {
          cl_openQAAdmin(process.env.VUE_APP_WAP_WATCH + url);
        } else {
          window.open(`${base}lives/qa/${this.webinarId}${location.search}`);
        }
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$refs.qalist && this.$refs.qalist.scrollToBottom();
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
      //处理唤起登录
      handleLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      handleQa(flag) {
        flag ? this.handleQAPopup() : this.close();
      },
      close() {
        this.qaVisible = false;
      },
      handleQAPopup() {
        window.vhallReportForProduct && window.vhallReportForProduct.report(110061);
        if (!this.qaVisible && this.isQAEnabled) {
          useQaServer()
            .getCurrentPlayQuestionNum()
            .then(res => {
              if (res.code == 200) {
                this.qaCount = res.data.num;
              } else {
                this.$message.error(res.msg);
              }
            });
        }
        this.qaVisible = !this.qaVisible;
        // 点开问答的时候，获取qaName数据
        useQaServer()
          .getQaName()
          .then(res => {
            this.QAName = res.code == 200 ? res.data.name || '问答' : '问答';
          })
          .catch(res => {
            this.QAName = '问答';
          });
      },
      handleQASubmit() {
        if (this.isQAEnabled) {
          this.closeQA();
        } else {
          this.enableQA();
        }
      },
      enableQA: debounce(function (flag) {
        useQaServer()
          .qaEnable({ name: this.QAName })
          .then(res => {
            if (res.code == 200) {
              window.vhallReportForProduct?.report(110052);
              this.isQAEnabled = true;
              this.qaVisible = false;
              if (this.$route.query.assistantType) {
                this.openQa();
              }
              this.$message({
                message: '开启问答成功',
                type: 'success'
              });
            } else {
              this.$message({
                message: '开启问答失败',
                type: 'error'
              });
            }
          });
      }, 500),
      closeQA: debounce(function (flag) {
        useQaServer()
          .qaDisable()
          .then(res => {
            if (res.code == 200) {
              this.qaVisible = false;
              this.isQAEnabled = true;
              window.vhallReportForProduct?.report(110053);
              this.$message({
                message: '关闭问答成功',
                type: 'success'
              });
            } else {
              this.$message({
                message: '关闭问答失败',
                type: 'error'
              });
            }
          });
      }, 500)
    }
  };
</script>

<style lang="less" scoped>
  .vhsaas-chat {
    width: 100%;
    height: 100%;
    position: relative;
    ::-webkit-scrollbar-thumb {
      background-color: var(--chat-scrollbar-thumb-bg) !important;
    }
  }
  .vhsaas-chat__body-wrapper {
    position: relative;
    ::v-deep .vhsaas-chat-msg-item__wrapper {
      &:last-child {
        padding-bottom: 20px;
      }
    }
  }
  .vhsaas-chat__body__bottom-tip-box {
    position: absolute;
    z-index: 1;
    bottom: 5px;
    left: 50%;
    transform: translate(-50%, 0);
  }
  .vhsaas-chat__body__bottom-tip {
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
  .button-container {
    height: 52px;
    width: 100%;
    background: #34363a;
    left: 0;
    right: 0;
    bottom: 0;
    position: absolute;
    cursor: pointer;
    & > p {
      color: #fff;
      display: block;
      margin: 0 auto;
      border-radius: 5px;
      background: #fb3a32;
      line-height: 35px;
      font-size: 12px;
      text-align: center;
      margin: 10px;
      &:hover,
      &:active {
        background: #fb3a32;
      }
    }
  }
</style>
