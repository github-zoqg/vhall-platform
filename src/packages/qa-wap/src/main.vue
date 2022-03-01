<template>
  <div class="qa">
    <div class="qa-content-wrapper">
      <div class="qa-content">
        <scroll :pullDownRefresh="false" ref="scroll">
          <div class="qa-item-wrapper" v-for="(msg, index) in list" :key="index">
            <template
              v-if="
                msg.join_id == joinId ||
                (msg.answer && msg.answer.is_open == 1) ||
                (msg.answer && msg.answer.is_open == 0 && msg.join_id == joinId)
              "
            >
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
        </scroll>
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
  import Scroll from '@/packages/chat-wap/src/components/scroll';
  import { textToEmojiText } from '@/packages/chat/src/js/emoji';
  import SendBox from '@/packages/chat-wap/src/components/send-box';
  import { useRoomBaseServer, useQaServer, useChatServer } from 'middle-domain';
  import { browserType, boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpQaWap',
    data() {
      return {
        list: [],
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
    components: { Scroll, SendBox },
    created() {
      this.getQAHistroy();
    },
    beforeDestroy() {},
    mounted() {
      this.listenEvents();
      this.sendMsgFn = (inputValue, type) => {
        if (type == 'qa') {
          this.sendQuestion(inputValue);
        }
      };
      // 接收到回答
      this.commitQAFn = async msg => {
        // console.log(`当前头像试验查看`, msg.data)
        if (msg.data.type === 'question_answer_commit') {
          // 如果是走的消息回复接口
          msg.content = textToEmojiText(msg.data.content);
        }
        msg.data.content = textToEmojiText(msg.data.content);
        msg.data.answer.content = textToEmojiText(msg.data.answer.content);
        this.list.push(msg);

        // console.log(`转换后头像实验效果`, msg.data)
      };
      // 撤销回答
      this.backoutQAFn = async msg => {
        const index = this.list.findIndex(item => {
          if (item.answer) {
            if (item.answer.id == msg.data.question_answer_id) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        });
        console.log(9, this.list, msg, index);

        if (index > -1) {
          const qa = this.list[index];
          qa.answer = null;
          this.list.splice(index, 1, qa);
          await this.$nextTick();
          this.$refs.scroll.refresh();
        }
      };
    },
    filters: {
      roleClassFilter(value) {
        return value == '1' ? 'host' : value == '3' ? 'assistant' : 'guest';
      }
    },
    methods: {
      listenEvents() {
        const qaServer = useQaServer();
        qaServer.$on(qaServer.Events.QA_CREATE, msg => {
          msg.data.content = textToEmojiText(msg.data.content);
          this.list.push(msg.data);
        });
        qaServer.$on(qaServer.Events.QA_COMMIT, msg => {
          msg.data.content = textToEmojiText(msg.data.content);
          this.list.push(msg.data);
        });
      },
      roleFilter(value) {
        let ret = '';
        switch (value) {
          case 'host':
            ret = this.$t('chat.chat_1022');
            break;
          case 'assistant':
            ret = this.$t('chat.chat_1024');
            break;
          case 'guest':
            ret = this.$t('chat.chat_1023');
            break;
          case 'user':
            ret = this.$t('chat.chat_1063');
            break;
          default:
            ret = this.$t('chat.chat_1062');
        }
        return ret;
      },
      /**
       * 获取历史问答
       */
      async getQAHistroy() {
        const data = { room_id: this.webinarId };
        await useQaServer()
          .getHistoryQaMsg(data)
          .then(res => {
            if (res.data) {
              res.data.list.forEach(element => {
                element.content = textToEmojiText(element.content);
              });
              this.list = res.data.list;
              this.listCopy = this.list && this.list.slice(0);
            }
          });
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
