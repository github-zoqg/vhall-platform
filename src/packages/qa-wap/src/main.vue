<template>
  <div class="qa">
    <div class="qa-content-wrapper">
      <div class="qa-content">
        <virtual-list
          ref="qalist"
          style="height: 100%; overflow: auto"
          :keeps="30"
          :data-key="'id'"
          :data-sources="qaList"
          :data-component="MsgItem"
        ></virtual-list>
        <!-- <scroll :pullDownRefresh="false" ref="scroll">
          <div class="qa-item-wrapper" v-for="(msg, index) in list" :key="index">
            <template>
              <div class="question">
                <div class="user">
                  <span class="avatar-box">
                    <img
                      class="avatar"
                      :src="
                        msg.avatar !== '0'
                          ? msg.avatar || require(`./img/question.png`)
                          : require(`./img/question.png`)
                      "
                    />
                  </span>
                  <span class="nick-name">{{ msg.data ? msg.data.nick_name : msg.nick_name }}</span>
                  <span class="time">{{ msg.created_at }}</span>
                </div>
                <div class="content">
                  <span class="question-label">{{ $t('chat.chat_1040') }}：</span>
                  <span class="question-reply" v-html="msg.content"></span>
                </div>
              </div>
              <template v-if="msg.answer">
                <div class="answer">
                  <div class="user">
                    <span class="avatar-box">
                      <img
                        class="avatar"
                        :src="
                          msg.answer.avatar !== '0'
                            ? msg.answer.avatar || require(`./img/question.png`)
                            : require(`./img/question.png`)
                        "
                      />
                    </span>
                    <span :class="['role', msg.answer.role_name]">
                      {{ roleFilter(msg.answer.role_name) }}
                    </span>
                    <span class="nick-name">{{ msg.answer.nick_name }}</span>
                    <span class="time">{{ msg.answer.created_at }}</span>
                  </div>
                  <div class="content">
                    <span class="question-label">{{ $t('chat.chat_1041') }}：</span>
                    <span class="question-reply" v-html="msg.answer.content"></span>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </scroll> -->
      </div>
    </div>
    <send-box
      currentTab="qa"
      @sendQa="sendQa"
      key="qa"
      :is-banned="isBanned"
      :is-all-banned="allBanned"
    ></send-box>
  </div>
</template>
<script>
  import MsgItem from './components/msg-item.vue';
  import SendBox from '@/packages/chat-wap/src/components/send-box';
  import { useRoomBaseServer, useQaServer, useChatServer } from 'middle-domain';
  import { browserType, boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpQaWap',
    data() {
      return {
        MsgItem,
        qaList: useQaServer().state.qaList,
        listCopy: [],
        isOnlyWatchQaReply: false, // 是否点击了只看我的
        isBanned: useChatServer().state.banned, //true禁言，false未禁言
        allBanned: useChatServer().state.allBanned, //true全体禁言，false未禁言
        watchInitData: useRoomBaseServer().state.watchInitData
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
      isEmbed() {
        return this.embedObj.embed || this.embedObj.embedVideo;
      }
    },
    components: { SendBox },
    created() {
      this.getQAHistroy();
    },
    beforeDestroy() {},
    mounted() {
      this.listenEvents();
    },
    filters: {
      roleClassFilter(value) {
        return value == '1' ? 'host' : value == '3' ? 'assistant' : 'guest';
      }
    },
    methods: {
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
        qaServer.$on(qaServer.Events.QA_COMMIT, () => {
          this.scrollBottom();
        });
        //监听禁言通知
        chatServer.$on('banned', res => {
          this.isBanned = res;
        });
        //监听全体禁言通知
        chatServer.$on('allBanned', res => {
          this.allBanned = res;
        });
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
          .then(() => {});
      },
      //唤起登录弹窗
      handleLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$refs.qalist.scrollToBottom();
          this.unReadMessageCount = 0;
        });
      },
      //滚动到目标处
      scrollToTarget() {
        const index = this.qaList.length - this.unReadMessageCount;
        this.$refs.qalist.scrollToIndex(index);
        this.unReadMessageCount = 0;
      },
      //滚动条是否在最底部
      isBottom() {
        return (
          this.$refs.qalist.$el.scrollHeight -
            this.$refs.qalist.$el.scrollTop -
            this.$refs.qalist.getClientSize() <
          5
        );
      }
    }
  };
</script>
<style lang="less">
  .qa {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    .qa-content-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 120px;
      overflow: hidden;
      .qa-content {
        height: 100%;
        overflow: auto;
        .qa-item-wrapper {
          padding: 0 30px;
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
                color: #fc5659;
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
              color: #fc5659;
              float: left;
            }
            .question-reply {
              display: inline-block;
            }
          }
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
        color: #fc5659;
      }
    }
  }
</style>
