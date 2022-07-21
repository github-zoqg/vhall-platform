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
            {{ source.roleName != 1 ? overHidden(source.nickname, 6) : '' }}
          </template>
          <template v-if="source.type == 'pwd_red_envelope_ok'">
            <img
              class="new-award-img"
              :src="require('@/app-shared/assets/img/wap/chat/reward.png')"
            />
          </template>
          {{ source.content.text_content }}
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
            {{ $t('common.common_1030') }}
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
          {{ source.roleName != 1 ? overHidden(source.nickname, 6) : '' }}
          &nbsp;
          {{ source.content.text_content }}
          <span class="highlight">{{ $t('chat.chat_1093') }}</span>
        </div>
      </div>
    </template>
    <!-- 送礼物 -->
    <template v-else-if="['gift_send_success', 'free_gift_send'].includes(source.type)">
      <div v-if="source.content.gift_name" class="msg-item new-gift">
        <div class="interact-gift-box" :class="source.content.source_status == 1 ? 'zdy' : ''">
          <span class="new-gift-name">
            {{ source.nickname | overHidden(6) }}
          </span>
          &nbsp;
          <span class="new-gift-content">
            {{ $t('chat.chat_1061') }} {{ source.content.gift_name | overHidden(10) }}
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
            :src="require('@/app-shared/assets/img/wap/chat/' + source.content.gift_name + '.png')"
          />
        </div>
      </div>
    </template>
    <!-- 聊天消息 -->
    <template v-else>
      <div class="msg-item">
        <!-- 正常聊天消息 -->
        <div class="msg-content">
          <!-- 图文消息 -->
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
                <div class="textInfo">
                  <span v-html="source.replyMsg.nick_name || source.replyMsg.nickname" />
                  ：
                  <span v-html="source.replyMsg.content.text_content" />
                </div>
                <div class="imgs">
                  <div
                    @click="previewImg(img, index, source.content.image_urls)"
                    class="img"
                    v-for="(img, index) in source.replyMsg.content.image_urls"
                    :key="index"
                    :style="`backgroundImage: url('${
                      img + '?x-oss-process=image/resize,m_lfit,h_60,w_60'
                    }')`"
                    :alt="$t('chat.chat_1065')"
                  ></div>
                </div>
              </div>
              <div class="reply-msg-content">
                <div class="textInfo">
                  <span
                    v-if="source.roleName && source.roleName != '2'"
                    class="role"
                    :class="source.roleName | roleClassFilter"
                  >
                    {{ source.roleName | roleFilter }}
                  </span>
                  <span class="nickname">{{ source.nickname | overHidden(6) }}：</span>
                  <span v-html="msgContent" class="chat-text"></span>
                </div>
                <div class="imgs">
                  <div
                    @click="previewImg(img, index, source.content.image_urls)"
                    class="img"
                    v-for="(img, index) in source.content.image_urls"
                    :key="index"
                    :style="`backgroundImage: url('${
                      img + '?x-oss-process=image/resize,m_lfit,h_60,w_60'
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
                    {{ source.roleName | roleFilter }}
                  </span>
                  <span class="nickname">{{ source.nickname | overHidden(6) }}：</span>
                  <span v-html="msgContent" class="chat-text"></span>
                </div>
                <div class="imgs">
                  <div
                    @click="previewImg(img, index, source.content.image_urls)"
                    class="img"
                    v-for="(img, index) in source.content.image_urls"
                    :key="index"
                    :style="`backgroundImage: url('${
                      img + '?x-oss-process=image/resize,m_lfit,h_60,w_60'
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
                  <span class="nickname">{{ source.nickname | overHidden(6) }}：</span>
                  <span v-html="msgContent" class="chat-text"></span>
                  <template v-if="!!!msgContent">
                    <div
                      @click="previewImg(img, index, source.content.image_urls)"
                      class="msg-content_chat-img"
                      v-for="(img, index) in source.content.image_urls"
                      :key="index"
                      :style="`backgroundImage: url('${
                        img + '?x-oss-process=image/resize,m_lfit,h_60,w_60'
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
                      img + '?x-oss-process=image/resize,m_lfit,h_60,w_60'
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
  import defaultAvatar from '@/app-shared/assets/img/default_avatar.png';
  import { handleChatShowTime } from '../js/handle-time.js';
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
    computed: {
      // multi() {
      //   if (this.msgContent.indexOf('<br/>') == -1) {
      //     return false;
      //   } else {
      //     return true;
      //   }
      // },
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
      //处理@消息
      handleAt() {
        //@用户
        //todo 可以考虑domaint提供统一的处理 实现@用户
        this.msgContent = this.urlToLink(this.source.content.text_content);
        // this.source.atList &&
        //   this.source.atList.forEach(a => {
        //     // TODO历史列表aList与直播中格式不一致作
        //     const userName = `@${a.nick_name || a.nickName} `;
        //     const match =
        //       this.source.content &&
        //       this.source.content.text_content &&
        //       this.source.content.text_content.indexOf(userName) != -1;
        //     if (match) {
        //       this.msgContent = this.urlToLink(
        //         this.source.content.text_content.replace(
        //           userName,
        //           `<span style='color:#3562fa'>${userName}</span>`
        //         )
        //       );
        //     }
        //   });
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
      padding: 0 0 16px;
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
          background-color: #fb2626;
        }
        &.assistant {
          background-color: #0a7ff5;
        }
        &.guest {
          background-color: #0a7ff5;
        }
      }
      .msg-content {
        position: relative;
        .msg-content_body {
          position: relative;
          background: rgba(0, 0, 0, 0.25);
          border-radius: 20px;
          padding: 3px 16px;
          word-break: break-all;
          color: #fff;
          font-size: 26px;
          max-width: 520px;
          > .normal-msg {
            > .textInfo {
              line-height: 1.46;
              &.existSimpleImg {
                padding-top: 5px;
              }
              span {
                word-break: break-word;
              }
              .chat-text {
                img {
                  width: 34px;
                  height: 34px;
                }
              }
              .msg-content_chat-img {
                vertical-align: text-top;
                margin-top: 0;
              }
            }
            > .imgs {
              .img {
                display: inline-block;
                margin: 8px 8px 5px 0;
                width: 60px;
                height: 60px;
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
              color: rgba(255, 255, 255, 0.6);
              position: relative;
              line-height: 1.46;
            }

            > .imgs {
              .img {
                display: inline-block;
                margin: 8px 8px 0 0;
                width: 60px;
                height: 60px;
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
              height: calc(100% - 9px);
              position: absolute;
              top: 9px;
              left: 0;
              background: rgba(255, 255, 255, 0.6);
              border-radius: 3px;
            }
          }
          > .reply-msg-content {
            position: relative;
            > .textInfo {
              color: #fff;
              line-height: 1.46;
            }

            > .imgs {
              .img {
                display: inline-block;
                margin: 8px 8px 5px 0;
                width: 60px;
                height: 60px;
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
        color: #fff;
        &.interact {
          justify-content: unset;
        }
        &.purpose {
          background: linear-gradient(221deg, rgba(184, 58, 244, 0) 0%, #6950fb 100%);
        }
        &.red {
          background: linear-gradient(227deg, rgba(255, 137, 96, 0) 0%, #ff6267 100%);
        }
        > div {
          background: rgba(0, 0, 0, 0.25);
          border-radius: 20px;
          position: relative;
          font-size: 26px;
        }
        > .interact-gift-box {
          padding: 0 60px 0 16px;
          text-align: left;
          width: 100%;
          height: 46px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: none;

          &.zdy {
            padding-right: 68px;
          }
          .gift-zdy {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            position: absolute;
            right: 24px;
            background-color: white;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }
          .new-gift-img {
            width: 36px;
            position: absolute;
            right: 16px;
          }
        }
        > .interact-msg {
          padding: 3px 16px;
          border-width: 0;
          height: 46px;
          line-height: 40px;
          &.pwd_red_envelope_ok {
            display: flex;
            align-items: center;
            padding-left: 60px;
          }
          .highlight {
            color: #0a7ff5;
          }
          .new-award-img {
            width: 36px;
            position: absolute;
            left: 16px;
          }
        }
      }

      .question_msg_bg {
        padding: 10px 24px;
        background: rgba(255, 209, 201, 0.2);
        border-radius: 500px;
        &::after {
          border: 0 !important;
        }
      }
    }
    .margin-top-bottom {
      text-align: center;
      margin: 10px 0;
    }
    .sign-msg {
      background: #aaa;
      display: inline-block;
      padding: 2px 30px;
      border-radius: 20px;
    }
    .msg-item__content-body__content-link {
      color: #3562fa;
      text-decoration: underline #3562fa !important;
    }
  }
</style>
