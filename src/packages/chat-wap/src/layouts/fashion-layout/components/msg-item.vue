<template>
  <div class="vmp-chat-wap-msg-item-fashion" style="pointer-events: auto">
    <!-- 发起抽奖/问答 -->
    <template
      v-if="
        [
          'lottery_push',
          'question_answer_open',
          'question_answer_close',
          'sign_in_push',
          'pwd_red_envelope_ok'
        ].includes(source.type)
      "
    >
      <div class="msg-item interact">
        <div class="interact-msg" :class="source.type">
          <template
            v-if="
              ['question_answer_open', 'question_answer_close', 'sign_in_push'].includes(
                source.type
              )
            "
          >
            <span class="role" :class="source.roleName | roleClassFilter">
              <span>{{ source.roleName | roleFilter }}</span>
            </span>
            <span class="nickname">{{ overHidden(source.nickname, 8) }}&nbsp;</span>
          </template>
          <template v-if="source.type == 'pwd_red_envelope_ok'">
            <img
              class="new-award-img"
              :src="require('@/app-shared/assets/img/wap/chat/reward.png')"
            />
          </template>
          <span class="chat-text">{{ source.content.text_content }}</span>
        </div>
      </div>
    </template>
    <!-- 抽奖结果 -->
    <template v-else-if="source.type == 'lottery_result_notice'">
      <div class="msg-item interact">
        <div
          class="interact-msg"
          @tap="checkLotteryDetail($event, source)"
          @click="checkLotteryDetail($event, source)"
        >
          {{ source.content.text_content }}
          <template v-if="source.content.Show">
            <!-- {{ $t('common.common_1030') }} -->
            <span class="highlight">{{ $t('chat.chat_1031') }}</span>
          </template>
        </div>
      </div>
    </template>
    <!-- 收到问卷 -->
    <template v-else-if="source.type == 'questionnaire_push'">
      <div class="msg-item interact">
        <div
          class="interact-msg question_msg_bg"
          @tap="checkQuestionDetail(source.content.questionnaire_id)"
          @click="checkQuestionDetail(source.content.questionnaire_id)"
        >
          <span class="role" :class="source.roleName | roleClassFilter">
            <span>{{ source.roleName | roleFilter }}</span>
          </span>
          <span class="nickname">{{ overHidden(source.nickname, 8) }}&nbsp;</span>
          <span class="chat-text">{{ source.content.text_content }}&nbsp;</span>
          <span class="highlight">{{ $t('chat.chat_1093') }}</span>
        </div>
      </div>
    </template>
    <!--
      收到快问快答 paper_send
      公布-快问快答-成绩 paper_send_rank
      快问快答-收卷 paper_end
      快问快答-自动收卷 paper_auto_end
      快问快答-自动公布成绩 paper_auto_send_rank
    -->
    <template
      v-else-if="
        [
          'paper_send',
          'paper_send_rank',
          'paper_end',
          'paper_auto_end',
          'paper_auto_send_rank'
        ].includes(source.type)
      "
    >
      <exam-msg-item :source="source" @checkExamDetail="checkExamDetail"></exam-msg-item>
    </template>
    <!-- 送礼物 -->
    <template v-else-if="['gift_send_success', 'free_gift_send'].includes(source.type)">
      <div v-if="source.content.gift_name" class="msg-item new-gift">
        <div class="interact-gift-box">
          <span class="new-gift-name">{{ source.nickname | overHidden(8) }}&nbsp;</span>
          <span class="new-gift-content">
            {{ $t('chat.chat_1061') }} {{ $tdefault(source.content.gift_name) | overHidden(10) }}
          </span>
          <div
            v-if="source.content.source_status == 1"
            class="gift-zdy"
            :style="{
              backgroundImage: 'url(' + source.content.gift_url + ')'
            }"
          ></div>
          <img
            v-else
            class="new-gift-img"
            :src="require('@/app-shared/assets/img/wap/chat/assetsMap')(source.content.gift_name)"
          />
        </div>
      </div>
    </template>
    <!-- 聊天消息 -->
    <template v-else>
      <div class="msg-item" v-if="showTime">
        <div class="msg-content timeline">
          <!-- 事件消息 -->
          <div class="msg-content_body">
            <div class="normal-msg">
              <div class="textInfo">
                <span class="msg-showtime">{{ showTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="msg-item">
        <div class="msg-content">
          <!-- 回复消息 -->
          <template
            v-if="
              source.replyMsg &&
              source.replyMsg.content &&
              source.atList &&
              source.atList.length == 0
            "
          >
            <div class="msg-content_body">
              <div class="reply-msg">
                <div
                  class="textInfo"
                  :class="
                    !!!source.replyMsg.content.text_content &&
                    source.replyMsg.content.image_urls.length != 0
                      ? 'existSimpleImg'
                      : ''
                  "
                >
                  <img class="chat-avatar" :src="source.replyMsg.avatar || defaultAvatar" alt />
                  <span
                    class="nickname"
                    v-html="
                      overHidden(source.replyMsg.nick_name || source.replyMsg.nickname, 8) + ' '
                    "
                  />
                  <span>&nbsp;</span>
                  <span class="chat-text" v-html="source.replyMsg.content.text_content" />
                  <!-- <template v-if="!!!source.replyMsg.content.text_content">
                    <div
                      @click="previewImg(img, index, source.replyMsg.content.image_urls)"
                      class="msg-content_chat-img"
                      v-for="(img, index) in source.replyMsg.content.image_urls"
                      :key="index"
                      :style="`backgroundImage: url('${
                        img + '?x-oss-process=image/resize,m_lfit,h_56,w_56'
                      }')`"
                      :alt="$t('chat.chat_1065')"
                    ></div>
                  </template> -->
                </div>
                <div class="imgs">
                  <div
                    @click="previewImg(img, index, source.replyMsg.content.image_urls)"
                    class="img"
                    v-for="(img, index) in source.replyMsg.content.image_urls"
                    :key="index"
                    :style="`backgroundImage: url('${
                      img + '?x-oss-process=image/resize,m_lfit,h_56,w_56'
                    }')`"
                    :alt="$t('chat.chat_1065')"
                  ></div>
                </div>
              </div>
              <div class="reply-msg-content">
                <div
                  class="textInfo clearfix"
                  :class="
                    !!!msgContent && source.content.image_urls.length != 0 ? 'existSimpleImg' : ''
                  "
                >
                  <img class="chat-avatar" :src="source.avatar || defaultAvatar" alt />
                  <span
                    v-if="source.roleName && source.roleName != '2'"
                    class="role"
                    :class="source.roleName | roleClassFilter"
                  >
                    <span>{{ source.roleName | roleFilter }}</span>
                  </span>
                  <span class="nickname">{{ source.nickname | overHidden(8) }}&nbsp;</span>
                  <span v-html="msgContent" class="chat-text"></span>
                  <!-- <template v-if="!!!msgContent">
                    <div
                      @click="previewImg(img, index, source.content.image_urls)"
                      class="msg-content_chat-img"
                      v-for="(img, index) in source.content.image_urls"
                      :key="index"
                      :style="`backgroundImage: url('${
                        img + '?x-oss-process=image/resize,m_lfit,h_56,w_56'
                      }')`"
                      :alt="$t('chat.chat_1065')"
                    ></div>
                  </template> -->
                </div>
                <div class="imgs">
                  <div
                    @click="previewImg(img, index, source.content.image_urls)"
                    class="img"
                    v-for="(img, index) in source.content.image_urls"
                    :key="index"
                    :style="`backgroundImage: url('${
                      img + '?x-oss-process=image/resize,m_lfit,h_56,w_56'
                    }')`"
                    :alt="$t('chat.chat_1065')"
                  ></div>
                </div>
              </div>
            </div>
          </template>
          <!-- @消息 -->
          <template v-if="source.atList && source.atList.length !== 0">
            <div class="msg-content_body">
              <div class="normal-msg">
                <div class="textInfo">
                  <img class="chat-avatar" :src="source.avatar || defaultAvatar" alt />
                  <span
                    v-if="source.roleName && source.roleName != '2'"
                    class="role"
                    :class="source.roleName | roleClassFilter"
                  >
                    <span>{{ source.roleName | roleFilter }}</span>
                  </span>
                  <span class="nickname">{{ source.nickname | overHidden(8) }}&nbsp;</span>
                  <span v-html="msgContent" class="chat-text"></span>
                </div>
                <div class="imgs">
                  <div
                    @click="previewImg(img, index, source.content.image_urls)"
                    class="img"
                    v-for="(img, index) in source.content.image_urls"
                    :key="index"
                    :style="`backgroundImage: url('${
                      img + '?x-oss-process=image/resize,m_lfit,h_56,w_56'
                    }')`"
                    :alt="$t('chat.chat_1065')"
                  ></div>
                </div>
              </div>
            </div>
          </template>
          <!-- 正常消息 -->
          <template
            v-if="
              !Object.keys(source.replyMsg || {}).length &&
              (!source.atList || !source.atList.length)
            "
          >
            <div class="msg-content_body">
              <div class="normal-msg">
                <div
                  class="textInfo"
                  :class="
                    !!!msgContent && source.content.image_urls.length != 0 ? 'existSimpleImg' : ''
                  "
                >
                  <img class="chat-avatar" :src="source.avatar || defaultAvatar" alt />
                  <span
                    v-if="source.roleName && source.roleName != '2'"
                    class="role"
                    :class="source.roleName | roleClassFilter"
                  >
                    <span>{{ source.roleName | roleFilter }}</span>
                  </span>
                  <span class="nickname">{{ source.nickname | overHidden(8) }}&nbsp;</span>
                  <span v-html="msgContent" class="chat-text"></span>
                  <template v-if="!!!msgContent">
                    <div
                      @click="previewImg(img, index, source.content.image_urls)"
                      class="msg-content_chat-img"
                      v-for="(img, index) in source.content.image_urls"
                      :key="index"
                      :style="`backgroundImage: url('${
                        img + '?x-oss-process=image/resize,m_lfit,h_56,w_56'
                      }')`"
                      :alt="$t('chat.chat_1065')"
                    ></div>
                  </template>
                </div>
                <div v-if="!!msgContent" class="imgs">
                  <div
                    @click="previewImg(img, index, source.content.image_urls)"
                    class="img"
                    v-for="(img, index) in source.content.image_urls"
                    :key="index"
                    :style="`backgroundImage: url('${
                      img + '?x-oss-process=image/resize,m_lfit,h_56,w_56'
                    }')`"
                    :alt="$t('chat.chat_1065')"
                  ></div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import { handleChatShowTime } from '@/app-shared/utils/handle-time.js';
  import ExamMsgItem from './exam-msg-item.vue';
  export default {
    props: {
      source: {
        required: true,
        default: () => ({})
      },
      // 预览图片
      previewImg: {
        type: Function,
        default: function () {}
      },
      emitLotteryEvent: {
        type: Function,
        default: function () {}
      },
      emitQuestionnaireEvent: {
        type: Function,
        default: function () {}
      },
      emitExamEvent: {
        type: Function,
        default: function () {}
      },
      //当前登录人的信息
      joinInfo: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data() {
      return {
        msgContent: '',
        defaultAvatar: defaultAvatar,
        jiantou: require('../../../common/img/jiantou.png')
      };
    },
    components: {
      ExamMsgItem
    },
    filters: {
      //角色标签样式
      roleClassFilter(value) {
        //主持人
        if ([1, '1'].includes(value)) {
          return 'host';
        }
        //助理
        if ([3, '3'].includes(value)) {
          return 'assistant';
        }
        //游客
        return 'guest';
      },
      //消息里的角色样式
      roleClassFilterForMsg(value) {
        //主持人
        if ([1, '1'].includes(value)) {
          return 'host';
        }
        //助理
        if ([3, '3'].includes(value)) {
          return 'assistant';
        }
        //游客
        if ([4, '4'].includes(value)) {
          return 'guest';
        }
        return '';
      }
    },
    computed: {
      // multi() {
      //   if (this.msgContent.indexOf('<br/>') == -1) {
      //     return false;
      //   } else {
      //     return true;
      //   }
      // },
      showTime() {
        if (this.source.showTime || this.source.isHistoryMsg) {
          return this.source.showTime;
        }
        if (!this.source.sendTime) {
          return '';
        }
        if (!this.source.prevTime) {
          return handleChatShowTime('', this.source.sendTime);
        }
        return handleChatShowTime(this.source.prevTime, this.source.sendTime);
      }
    },
    mounted() {
      this.handleAt();
    },
    methods: {
      overHidden(value = '', len = 0) {
        if (value === null || value === undefined) return '';
        if (value.length > len) {
          return value.substring(0, len) + '...';
        }
        return value;
      },
      // 点击查看抽奖信息
      checkLotteryDetail(e, msgData) {
        this.emitLotteryEvent(msgData?.content?.msg?.data);
      },
      // 点击查看问卷
      checkQuestionDetail(questionnaire_id) {
        this.emitQuestionnaireEvent(questionnaire_id);
      },
      // 点击查看问答相关
      checkExamDetail(vo) {
        this.emitExamEvent(vo);
      },
      //处理@消息
      handleAt() {
        //@用户
        //todo 可以考虑domaint提供统一的处理 实现@用户
        this.msgContent = this.urlToLink(this.source.content.text_content);
        this.source.atList &&
          this.source.atList.forEach(a => {
            // TODO历史列表aList与直播中格式不一致作
            const userName = `@${a.nick_name || a.nickName} `;
            const match =
              this.source.content &&
              this.source.content.text_content &&
              this.source.content.text_content.indexOf(userName) != -1;
            if (match) {
              this.msgContent = this.urlToLink(
                this.source.content.text_content.replace(
                  userName,
                  `<span style='color:#3562fa'>${this.overHidden(userName, 8)} </span>`
                )
              );
            }
          });
        if (
          (this.source.atList || []).find(u => this.joinInfo.third_party_user_id == u.accountId) &&
          !this.source.isHistoryMsg
        ) {
          this.$emit('dispatchEvent', { type: 'scrollElement', el: this.$el });
          this.tipTimer && clearTimeout(this.tipTimer);
          this.tipTimer = setTimeout(() => {
            this.$emit('dispatchEvent', { type: 'closeTip' });
          }, 10000);
        }
        if (this.source.replyMsg && this.source.replyMsg.content && !this.source.isHistoryMsg) {
          this.$emit('dispatchEvent', {
            type: 'replyMsg',
            el: this.$el,
            msg: this.source.replyMsg
          });
          this.tipTimer && clearTimeout(this.tipTimer);
          this.tipTimer = setTimeout(() => {
            this.$emit('dispatchEvent', { type: 'closeTip' });
          }, 10000);
        }
      },
      // 将聊天消息中的链接用 a 标签包裹
      urlToLink(str) {
        if (!str) return '';

        // 提取聊天内容中的 img 标签
        const regImg = /<img.*?(?:>|\/>)/g;
        const imgArr = str.match(regImg);

        // 提取聊天内容中除去 img 标签以外的部分
        const strArr = str.split(regImg);
        // eslint-disable-next-line no-useless-escape
        const regUrl =
          /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/g;

        // 将聊天内容中除去 img 标签以外的聊天内容中的链接用 a 标签包裹
        strArr.forEach((item, index) => {
          const tempStr = item.replace(regUrl, function (match) {
            return `<a class='msg-item__content-body__content-link' href='${match}' target='_blank'>${match}</a>`;
          });
          strArr[index] = tempStr;
        });

        // 遍历 img 标签数组，将聊天内容中的 img 标签插回原来的位置
        if (imgArr) {
          const imgArrLength = imgArr.length;
          let imgIndex = 0;
          for (let strIndex = 0; strIndex < imgArrLength; ++strIndex) {
            strArr.splice(strIndex + imgIndex + 1, 0, imgArr[imgIndex]);
            imgIndex++;
          }
        }
        return strArr.join('');
      }
    }
  };
</script>
<style lang="less">
  .vmp-chat-wap-msg-item-fashion {
    pointer-events: auto;

    .msg-item {
      margin: 0 24px;
      padding: 0 0 24px;
      display: flex;
      align-items: flex-start;
      .chat-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        vertical-align: bottom;
        margin-right: 8px;
      }
      .existSimpleImg {
        .chat-avatar {
          vertical-align: text-bottom;
        }
      }
      .nickname {
        font-size: 26px;
      }
      .role {
        width: fit-content;
        height: 30px;
        max-height: 30px;
        text-align: center;
        line-height: 30px;
        margin-right: 8px;
        padding: 0 8px;
        border-radius: 16px;
        font-size: 20px;
        &.host {
          color: rgba(251, 38, 38, 1);
          background-color: rgba(251, 38, 38, 0.15);
        }
        &.assistant {
          color: rgba(10, 127, 245, 1);
          background-color: rgba(10, 127, 245, 0.15);
        }
        &.guest {
          color: rgba(10, 127, 245, 1);
          background-color: rgba(10, 127, 245, 0.15);
        }
      }
      .msg-content {
        position: relative;
        .msg-content_body {
          position: relative;
          background: var(--theme-chat-msg-bg);
          border-radius: 30px;
          padding: 10px 12px;
          word-break: break-all;
          color: var(--theme-chat-msg-font);
          font-size: 28px;
          max-width: 634px;
          .chat-text {
            img {
              width: 34px;
              height: 34px;
            }
          }
          .msg-content_chat-img {
            vertical-align: text-top;
            width: 56px;
            height: 56px;
            display: inline-block;
            margin: 0 8px 0 0;
            border-radius: 4px;
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
            &:nth-last-child(1) {
              margin-right: 0;
            }
          }
          > .normal-msg {
            > .textInfo {
              line-height: 38px;
              // span {
              //   word-break: break-word;
              // }
              .nickname {
                color: var(--theme-chat-msg-name-font);
              }
              .chat-text {
                color: var(--theme-chat-msg-font);
                word-break: break-word;
              }
            }
            > .imgs {
              .img {
                display: inline-block;
                margin: 4px 8px 0 0;
                width: 56px;
                height: 56px;
                border-radius: 4px;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                &:nth-last-child(1) {
                  margin-right: 0;
                }
              }
            }
          }
          > .reply-msg {
            padding-left: 18px;
            margin-bottom: 8px;
            position: relative;
            .chat-avatar {
              opacity: 0.65;
            }
            > .textInfo {
              position: relative;
              line-height: 36px;
              font-size: 24px;
              .nickname {
                color: var(--theme-chat-msg-reply-name-font);
              }
              .chat-text {
                color: var(--theme-chat-msg-reply-font);
              }
              .role {
                opacity: 0.65;
              }
            }

            > .imgs {
              .img {
                opacity: 0.65;
                display: inline-block;
                margin: 4px 8px 0 0;
                width: 56px;
                height: 56px;
                border-radius: 4px;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                &:nth-last-child(1) {
                  margin-right: 0;
                }
              }
            }

            &::after {
              content: ' ';
              width: 6px;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
              background: var(--theme-chat-msg-reply-after);
              border-radius: 3px;
            }
            .existSimpleImg .msg-content_chat-img {
              margin-bottom: 0;
              opacity: 0.65;
            }
          }
          > .reply-msg-content {
            position: relative;
            > .textInfo {
              line-height: 38px;
              .nickname {
                color: var(--theme-chat-msg-name-font);
              }
              .chat-text {
                color: var(--theme-chat-msg-reply-content);
              }
            }

            > .imgs {
              .img {
                display: inline-block;
                margin: 4px 8px 0 0;
                width: 56px;
                height: 56px;
                border-radius: 4px;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                &:nth-last-child(1) {
                  margin-right: 0;
                }
              }
            }
            .existSimpleImg {
              padding-top: 0;
            }
          }
        }
        &.timeline {
          margin: 0 auto;
          .msg-content_body {
            background: none !important;
            padding: 0 !important;
            .msg-showtime {
              font-size: 28px;
              color: var(--theme-chat-msg-timeline);
              text-align: center;
            }
          }
        }
      }
      &.interact {
        justify-content: center;
      }
      &.new-gift,
      &.interact {
        width: fit-content;
        padding-left: 0;
        position: relative;
        display: block;
        color: var(--theme-chat-msg-font);
        &.interact {
          justify-content: unset;
        }
        > div {
          background: var(--theme-chat-msg-bg);
          border-radius: 30px;
          position: relative;
          font-size: 26px;
          line-height: 38px;
        }
        > .interact-gift-box {
          padding: 0 64px 0 12px;
          text-align: left;
          width: 100%;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: none;

          .new-gift-name {
            color: var(--theme-chat-msg-name-font);
          }
          .new-gift-content {
            color: var(--theme-chat-msg-font);
          }
          .gift-zdy {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            position: absolute;
            right: 16px;
            background-color: white;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }
          .new-gift-img {
            width: 40px;
            position: absolute;
            right: 16px;
          }
        }
        > .interact-msg {
          padding: 11px 12px;
          border-width: 0;
          min-height: 60px;
          height: auto;
          line-height: 38px;
          &.pwd_red_envelope_ok {
            display: flex;
            align-items: center;
            padding-left: 60px;
          }
          .highlight {
            color: rgba(10, 127, 245, 1);
          }
          .new-award-img {
            width: 40px;
            position: absolute;
            left: 12px;
          }
          .nickname {
            color: var(--theme-chat-msg-name-font);
          }
          .chat-text {
            color: var(--theme-chat-msg-font);
          }
        }
      }
    }
    .msg-item__content-body__content-link {
      color: #3562fa;
      text-decoration: underline #3562fa !important;
      word-break: break-all;
    }
  }
</style>
