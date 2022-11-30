<template>
  <div class="vmp-chat-wap-msg-item-concise" style="pointer-events: auto">
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
            <span class="nickname">{{ overHidden(source.nickname, 5) }}&nbsp;</span>
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
          <span class="nickname">{{ `${overHidden(source.nickname, 5)} ` }}</span>
          <span class="chat-text">{{ `${source.content.text_content} ` }}</span>
          <span class="highlight">{{ $t('chat.chat_1093') }}</span>
        </div>
      </div>
    </template>
    <!-- 送礼物 -->
    <template v-else-if="['gift_send_success', 'free_gift_send'].includes(source.type)">
      <div v-if="source.content.gift_name" class="msg-item new-gift">
        <div class="interact-gift-box">
          <span class="new-gift-name">{{ source.nickname | overHidden(5) }}&nbsp;</span>
          <span class="new-gift-content">
            {{ $t('chat.chat_1061') }} {{ $tdefault(source.content.gift_name) | overHidden(8) }}
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
      <div class="msg-item">
        <!-- 正常聊天消息 -->
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
                  <span class="nickname">
                    <span>
                      {{
                        source.replyMsg.nick_name || source.replyMsg.nickname | overHidden(8)
                      }}&nbsp;
                    </span>
                  </span>
                  <span class="chat-text" v-html="source.replyMsg.content.text_content" />
                  <template v-if="!!!source.replyMsg.content.text_content">
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
                  </template>
                </div>
                <div v-if="!!source.replyMsg.content.text_content" class="imgs">
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
                  class="textInfo"
                  :class="
                    !!!msgContent && source.content.image_urls.length != 0 ? 'existSimpleImg' : ''
                  "
                >
                  <span
                    v-if="source.roleName && source.roleName != '2'"
                    class="role"
                    :class="source.roleName | roleClassFilter"
                  >
                    <span>{{ source.roleName | roleFilter }}</span>
                  </span>
                  <span class="nickname">{{ source.nickname | overHidden(5) }}&nbsp;</span>
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
          <!-- @消息 -->
          <template v-if="source.atList && source.atList.length !== 0">
            <div class="msg-content_body">
              <div class="normal-msg">
                <div class="textInfo">
                  <span
                    v-if="source.roleName && source.roleName != '2'"
                    class="role"
                    :class="source.roleName | roleClassFilter"
                  >
                    <span>{{ source.roleName | roleFilter }}</span>
                  </span>
                  <span class="nickname">{{ source.nickname | overHidden(5) }}&nbsp;</span>
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
                  <span
                    v-if="source.roleName && source.roleName != '2'"
                    class="role"
                    :class="source.roleName | roleClassFilter"
                  >
                    <span>{{ source.roleName | roleFilter }}</span>
                  </span>
                  <span class="nickname">{{ source.nickname | overHidden(5) }}&nbsp;</span>
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
        defaultAvatar: defaultAvatar
      };
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
    computed: {},
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
                  `<span style='color:#FB2626'>${this.overHidden(userName, 8)} </span>`
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
  .vmp-chat-wap-msg-item-concise {
    pointer-events: auto;
    .msg-item {
      margin: 0 24px;
      padding: 0 0 8px;
      display: flex;
      align-items: flex-start;
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
          background: rgba(0, 0, 0, 0.25);
          border-radius: 22px;
          padding: 3px 12px;
          word-break: break-all;
          font-size: 26px;
          max-width: 520px;
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
            margin: 0 8px 5px 0;
            border-radius: 4px;
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
            &:nth-last-child(1) {
              margin-right: 0;
            }
          }
          .existSimpleImg {
            padding-top: 5px;
          }
          > .normal-msg {
            > .textInfo {
              line-height: 38px;
              // span {
              //   word-break: break-word;
              // }
              .nickname {
                color: rgba(255, 255, 255, 0.65);
              }
              .chat-text {
                color: rgba(255, 255, 255, 1);
                word-break: break-word;
              }
            }
            > .imgs {
              .img {
                display: inline-block;
                margin: 4px 8px 5px 0;
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
            > .textInfo {
              position: relative;
              line-height: 36px;
              font-size: 24px;
              .nickname {
                color: rgba(255, 255, 255, 0.45);
              }
              .chat-text {
                color: rgba(255, 255, 255, 0.65);
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
              background: rgba(255, 255, 255, 0.25);
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
                color: rgba(255, 255, 255, 0.65);
              }
              .chat-text {
                color: rgba(255, 255, 255, 1);
              }
            }

            > .imgs {
              .img {
                display: inline-block;
                margin: 4px 8px 5px 0;
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
        &.interact {
          justify-content: unset;
        }
        > div {
          background: rgba(0, 0, 0, 0.25);
          border-radius: 20px;
          position: relative;
          font-size: 26px;
          line-height: 38px;
        }
        > .interact-gift-box {
          padding: 0 56px 0 12px;
          text-align: left;
          width: 100%;
          height: 44px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: none;

          .gift-zdy {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            position: absolute;
            right: 12px;
            background-color: white;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }
          .new-gift-name {
            color: rgba(255, 255, 255, 0.65);
          }
          .new-gift-content {
            color: rgba(255, 255, 255, 1);
          }
          .new-gift-img {
            width: 36px;
            position: absolute;
            right: 12px;
          }
        }
        > .interact-msg {
          padding: 3px 12px;
          border-width: 0;
          // height: 44px;
          line-height: 38px;
          word-break: break-word;
          max-width: 6.93333rem;
          color: rgba(255, 255, 255, 1);
          &.pwd_red_envelope_ok {
            display: flex;
            align-items: center;
            padding-left: 56px;
          }
          .highlight {
            color: rgba(10, 127, 245, 1);
          }
          .new-award-img {
            width: 36px;
            position: absolute;
            left: 12px;
          }
          .nickname {
            color: rgba(255, 255, 255, 0.65);
          }
          .chat-text {
            color: rgba(255, 255, 255, 1);
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
