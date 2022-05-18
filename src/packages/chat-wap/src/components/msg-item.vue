<template>
  <div class="vmp-chat-wap-msg-item" style="pointer-events: auto">
    <!-- 发起抽奖/问答 -->
    <template
      v-if="['lottery_push', 'question_answer_open', 'question_answer_close'].includes(source.type)"
    >
      <div class="msg-item interact">
        <div class="interact-msg">
          <template v-if="['question_answer_open', 'question_answer_close'].includes(source.type)">
            {{ source.roleName | roleFilter }}
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
          <span
            class="interact-content__role-name"
            :class="source.roleName | roleClassFilterForMsg"
          >
            {{ source.roleName | roleFilter }}
          </span>
          {{ source.roleName != 1 ? source.nickname : '' }}{{ source.content.text_content }}
          <!-- <span class="highlight">{{ $t('chat.chat_1060') }}</span> -->
          <span class="highlight">点击查看详情</span>
        </div>
      </div>
    </template>
    <!-- 打赏 -->
    <template v-else-if="source.type == 'reward_pay_ok'">
      <div class="msg-item new-gift">
        <div class="interact-gift-box">
          <p class="new-gift-name">
            {{ source.nickName | overHidden(10) }}
          </p>
          <p class="new-gift-content">
            {{ $t('chat.chat_1029') }}
          </p>
          <img class="new-award-img" src="../img/red-package.png" />
        </div>
        <p class="reward_txt">
          {{ source.content.text_content | overHidden(10) }}
        </p>
      </div>
    </template>
    <!-- 送礼物 -->
    <template v-else-if="['gift_send_success', 'free_gift_send'].includes(source.type)">
      <div v-if="source.content.gift_name" class="msg-item new-gift">
        <div class="interact-gift-box">
          <span class="new-gift-name">
            {{ source.nickname | overHidden(10) }}
          </span>
          <span class="new-gift-content">
            {{ $t('chat.chat_1061') }} {{ source.content.gift_name | overHidden(10) }}
          </span>
          <img class="new-gift-img" :src="source.content.gift_url" />
        </div>
      </div>
    </template>
    <!-- 聊天消息 -->
    <template v-else>
      <div v-if="source.showTime" class="msg-showtime">{{ source.showTime }}</div>
      <div class="msg-item">
        <div class="avatar-wrap">
          <img
            class="chat-avatar"
            width="35"
            height="35"
            :src="source.avatar || defaultAvatar"
            alt
          />
        </div>
        <div class="msg-content">
          <!-- 签到消息头部 相类似的可优化 -->
          <p class="msg-content_name" v-if="['sign_in_push'].includes(source.type)">
            {{ $t('interact_tools.interact_tools_1024') }}
          </p>
          <!-- 正常聊天消息 -->
          <div class="msg-content_name" v-else>
            <p>
              <span
                v-if="source.roleName && source.roleName != '2'"
                class="role"
                :class="source.roleName | roleClassFilter"
              >
                {{ source.roleName | roleFilter }}
              </span>
              <span class="nickname">
                {{ source.nickname | overHidden(8) }}
              </span>
            </p>
            <span class="send_time">{{ source.sendTime.slice(-8) }}</span>
          </div>
          <!-- 图文消息 -->
          <div class="msg-content_body_pre">
            <!-- 回复消息 -->
            <template
              v-if="
                source.replyMsg &&
                source.replyMsg.type &&
                source.atList &&
                source.atList.length == 0
              "
            >
              <p class="reply-msg">
                <span v-html="source.replyMsg.nick_name || source.replyMsg.nickname" />
                ：
                <span v-html="source.replyMsg.content.text_content" />
              </p>
              <div class="msg-content_body">
                <span class="reply-color">{{ $t('chat.chat_1036') }}：</span>
                <span v-html="msgContent"></span>
                <img
                  @click="$emit('preview', img)"
                  class="msg-content_chat-img"
                  width="50"
                  height="50"
                  v-for="(img, index) in source.content.image_urls"
                  :key="index"
                  :src="img + '?x-oss-process=image/resize,m_lfit,h_150,w_150'"
                  :alt="$t('chat.chat_1065')"
                />
                <img class="jian-left" :src="jiantou" alt />
              </div>
            </template>
            <!-- @消息 -->
            <template v-if="source.atList && source.atList.length !== 0">
              <div class="msg-content_body">
                <span v-html="msgContent"></span>
                <img
                  @click="previewImg(img)"
                  class="msg-content_chat-img"
                  width="50"
                  height="50"
                  v-for="(img, index) in source.content.image_urls"
                  :key="index"
                  :src="img + '?x-oss-process=image/resize,m_lfit,h_150,w_150'"
                  :alt="$t('chat.chat_1065')"
                />
                <img class="jian-left" :src="jiantou" alt />
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
                <span class="reply-color"></span>
                <span v-html="msgContent" style="display: block" class="aaa"></span>
                <img
                  @click="previewImg(img, index, source.content.image_urls)"
                  class="msg-content_chat-img"
                  width="50"
                  height="50"
                  v-for="(img, index) in source.content.image_urls"
                  :key="index"
                  :src="img + '?x-oss-process=image/resize,m_lfit,h_150,w_150'"
                  :alt="$t('chat.chat_1065')"
                />
                <img class="jian-left" :src="jiantou" alt />
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
  import defaultAvatar from '@/packages/app-shared/assets/img/default_avatar.png';
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
        defaultAvatar: defaultAvatar,
        jiantou: require('../img/jiantou.png')
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
    mounted() {
      this.handleAt();
    },
    methods: {
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
                `<span style='color:#3562fa'>${userName}</span>`
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
  .vmp-chat-wap-msg-item {
    pointer-events: auto;
    .msg-showtime {
      padding: 15px 0 5px;
      font-size: 24px;
      color: #888888;
      text-align: center;
    }
    .msg-item {
      margin: 0 30px;
      padding: 10px 0;
      display: flex;
      align-items: flex-start;
      .avatar-wrap {
        position: relative;
        margin-right: 10px;
        .chat-avatar {
          border-radius: 50%;
          display: block;
          border: 2px solid #e3e3e3;
          object-fit: cover;
        }
        .chat-phone {
          position: absolute;
          right: 0;
          bottom: 0;
        }
      }
      .msg-content {
        flex: 1;
        margin-left: 10px;
        .msg-content_name {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
          height: 34px;
          .nickname {
            font-size: 22px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            word-break: break-all;
            color: #666;
            max-width: 300px;
            line-height: 34px;
          }
          .send_time {
            font-size: 24px;
            font-weight: 400;
            color: #8c8c8c;
          }
          .role {
            margin-right: 10px;
            padding: 0 10px;
            line-height: 34px;
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
        }
        .msg-content_body_pre {
          position: relative;
          .jian-left {
            width: 11px;
            height: 18px;
            position: absolute;
            left: -11px;
            top: 14px;
          }
        }
        .reply-color {
          color: #4da1ff;
          float: left;
        }
        .reply-msg {
          line-height: 40px;
          margin: 8px 0;
          color: #999;
          padding-left: 10px;
        }
        .msg-content_body {
          position: relative;
          display: inline-block;
          margin-top: 5px;
          padding: 18px 20px;
          word-break: break-all;
          color: #444;
          line-height: 36px;
          background-color: #f7f7f7;
          border-radius: 8px;
          span {
            word-break: break-word;
          }
        }
        .msg-content_chat-img-wrapper {
          .msg-content_chat-img {
            float: left;
            margin-right: 8px;
            margin-top: 8px;
            &:first-child {
              margin-left: 8px;
            }
          }
        }
        .emoji-img {
          width: 24px;
          height: 24px;
        }
      }
      &.interact {
        justify-content: center;
      }
      .question_msg_bg {
        background: rgba(255, 209, 201, 0.2);
        border-radius: 500px;
      }
      .interact-msg {
        padding: 20px 60px;
        position: relative;
        border-width: 0;
        .interact-content__role-name {
          color: @font-link;
          background-color: rgba(53, 98, 250, 0.2);
          border-radius: 9px;
          padding: 0 4px;
          font-size: 12px;
          line-height: 16px;
          margin: 2px 4px 0;
          border-radius: 500px;
          &.host {
            background-color: rgba(251, 58, 50, 0.2);
            color: #fb3a32;
          }
          &.assistant {
            background-color: rgba(166, 166, 166, 0.15);
            color: #3562fa;
          }
          &.guest {
            background-color: rgba(53, 98, 250, 0.2);
            color: #a6a6a6;
          }
        }
        input {
          background-color: transparent;
          position: relative;
          z-index: 1;
        }
        &::after {
          content: ' ';
          width: 200%;
          height: 200%;
          position: absolute;
          top: 0;
          left: 0;
          border: 1px solid #d2d2d2;
          transform: scale(0.5);
          transform-origin: 0 0;
          box-sizing: border-box;
          border-radius: 500px;
        }
        color: #444;
        p {
          text-align: center;
          line-height: 1;
        }
        .highlight {
          padding-left: 10px;
          color: #007aff;
        }
        .reward-text {
          margin-top: 13px;
        }
      }
    }
    .new-gift {
      padding-left: 0;
      padding-top: 26px;
      position: relative;
      display: block;
      &.interact {
        justify-content: unset;
      }
      &.purpose {
        background: linear-gradient(221deg, rgba(184, 58, 244, 0) 0%, #6950fb 100%);
      }
      &.red {
        background: linear-gradient(227deg, rgba(255, 137, 96, 0) 0%, #ff6267 100%);
      }

      .interact-gift-box {
        padding-left: 24px;
        margin-right: 10px;
        text-align: left;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        p {
          text-align: left;
          font-weight: 400;
          color: #fff;
        }
        .new-gift-name {
          font-size: 28px;
          max-width: 240px;
          line-height: 28px;
          margin-right: 8px;
          color: #8c8c8c;
        }
        .new-gift-content {
          font-size: 28px;
          transform: scale(0.9);
          line-height: 22px;
          color: #262626;
        }
      }
      .new-gift-img,
      .new-award-img {
        width: 32px;
      }
      .reward_txt {
        color: #ffd11a;
        font-size: 28px;
        line-height: 40px;
        text-align: center;
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
