<template>
  <div class="vmp-chat-wap-msg-item" style="pointer-events: auto">
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
            {{ source.roleName != 1 ? overHidden(source.nickname, 8) : '' }}
            <span class="role" :class="source.roleName | roleClassFilter">
              <span>{{ source.roleName | roleFilter }}</span>
            </span>
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
          {{ source.roleName != 1 ? overHidden(source.nickname, 8) : '' }}
          <span class="role" :class="source.roleName | roleClassFilter">
            <span>{{ source.roleName | roleFilter }}</span>
          </span>
          {{ source.content.text_content }}
          <span class="highlight">{{ $t('chat.chat_1093') }}</span>
        </div>
      </div>
    </template>
    <!-- 收到快问快答 -->
    <template v-else-if="source.type == 'paper_send'">
      <div class="msg-item interact exam_msg_flex">
        <div
          class="interact-msg exam_msg_bg"
          @tap="checkQuestionDetail(source.content.exam_id)"
          @click="checkQuestionDetail(source.content.exam_id)"
        >
          {{ overHidden(source.nickname, 8) }}
          <span class="role" :class="source.roleName | roleClassFilter">
            <span>{{ source.roleName | roleFilter }}</span>
          </span>
          {{ source.content.text_content }}
          <span class="highlight">{{ $t('chat.chat_1093') }}</span>
        </div>
        <div class="interact-msg exam_msg_bg">
          <span class="highlight">{{ source.content.exam_title }}</span>
        </div>
      </div>
    </template>
    <!-- 打赏 -->
    <!-- <template v-else-if="source.type == 'reward_pay_ok'">
      <div class="msg-item new-gift reward_pay_ok">
        <div class="interact-gift-box">
          <div>
            <div class="flex-box">
              <p class="new-gift-name">
                {{ source.nickName | overHidden(8) }}
              </p>
              <p class="new-gift-content">
                {{ $t('chat.chat_1029') }}
              </p>
              <img
                class="new-award-img"
                :src="require('@/app-shared/assets/img/wap/chat/reward.png')"
              />
            </div>
            <div class="reward_txt">
              {{ source.content.text_content | overHidden(10) }}
            </div>
          </div>
        </div>
      </div>
    </template> -->
    <!-- 送礼物 -->
    <template v-else-if="['gift_send_success', 'free_gift_send'].includes(source.type)">
      <div v-if="source.content.gift_name" class="msg-item new-gift">
        <div class="interact-gift-box" :class="source.content.source_status == 1 ? 'zdy' : ''">
          <span class="new-gift-name">
            {{ source.nickname | overHidden(8) }}
          </span>
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
      <div v-if="showTime" class="msg-showtime">{{ showTime }}</div>
      <div class="msg-item">
        <div class="avatar-wrap">
          <img class="chat-avatar" :src="source.avatar || defaultAvatar" alt />
        </div>
        <div class="msg-content">
          <!-- 签到消息头部 相类似的可优化 -->
          <!-- <p class="msg-content_name" v-if="['sign_in_push'].includes(source.type)">
            {{ $t('interact_tools.interact_tools_1024') }}
          </p> -->
          <!-- 正常聊天消息 -->
          <p class="msg-content_name">
            <span class="nickname">
              {{ source.nickname | overHidden(8) }}
            </span>
            <span
              v-if="source.roleName && source.roleName != '2'"
              class="role"
              :class="source.roleName | roleClassFilter"
            >
              {{ source.roleName | roleFilter }}
            </span>
          </p>
          <!-- <div class="msg-content_name" v-else>
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
          </div> -->
          <!-- 图文消息 -->
          <div class="msg-content_body_pre">
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
                    <span
                      v-html="
                        overHidden(source.replyMsg.nick_name || source.replyMsg.nickname, 8) + ' '
                      "
                    />
                    ：
                    <span v-html="source.replyMsg.content.text_content" />
                    <template v-if="!!!source.replyMsg.content.text_content">
                      <div
                        @click="previewImg(img, index, source.replyMsg.content.image_urls)"
                        class="msg-content_chat-img"
                        v-for="(img, index) in source.replyMsg.content.image_urls"
                        :key="index"
                        :style="`backgroundImage: url('${
                          img + '?x-oss-process=image/resize,m_lfit,h_84,w_86'
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
                        img + '?x-oss-process=image/resize,m_lfit,h_84,w_86'
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
                    <span class="reply-color">
                      {{ $t('chat.chat_1036') }}
                    </span>
                    <span v-html="msgContent" class="chat-text"></span>
                    <template v-if="!!!msgContent">
                      <div
                        @click="previewImg(img, index, source.content.image_urls)"
                        class="msg-content_chat-img"
                        v-for="(img, index) in source.content.image_urls"
                        :key="index"
                        :style="`backgroundImage: url('${
                          img + '?x-oss-process=image/resize,m_lfit,h_84,w_86'
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
                        img + '?x-oss-process=image/resize,m_lfit,h_84,w_86'
                      }')`"
                      :alt="$t('chat.chat_1065')"
                    ></div>
                  </div>
                </div>
                <!-- <img class="jian-left" :src="jiantou" alt /> -->
              </div>
            </template>
            <!-- @消息 -->
            <template v-if="source.atList && source.atList.length !== 0">
              <div class="msg-content_body">
                <div class="textInfo">
                  <span v-html="msgContent" class="chat-text"></span>
                </div>
                <div
                  @click="previewImg(img, index, source.content.image_urls)"
                  class="msg-content_chat-img"
                  v-for="(img, index) in source.content.image_urls"
                  :key="index"
                  :style="`backgroundImage: url('${
                    img + '?x-oss-process=image/resize,m_lfit,h_84,w_86'
                  }')`"
                  :alt="$t('chat.chat_1065')"
                ></div>
                <!-- <img class="jian-left" :src="jiantou" alt /> -->
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
                <div
                  class="textInfo"
                  :class="
                    !!!msgContent && source.content.image_urls.length != 0 ? 'existSimpleImg' : ''
                  "
                >
                  <!-- <span class="reply-color"></span> -->
                  <span
                    v-html="msgContent"
                    class="chat-text"
                    :class="
                      !!msgContent &&
                      source.content.image_urls &&
                      source.content.image_urls.length != 0
                        ? 'existImg'
                        : ''
                    "
                  ></span>
                  <template v-if="!!!msgContent">
                    <div
                      @click="previewImg(img, index, source.content.image_urls)"
                      class="msg-content_chat-img"
                      v-for="(img, index) in source.content.image_urls"
                      :key="index"
                      :style="`backgroundImage: url('${
                        img + '?x-oss-process=image/resize,m_lfit,h_84,w_86'
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
                      img + '?x-oss-process=image/resize,m_lfit,h_84,w_86'
                    }')`"
                    :alt="$t('chat.chat_1065')"
                  ></div>
                </div>
                <!-- <img class="jian-left" :src="jiantou" alt /> -->
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import { handleChatShowTime } from '@/app-shared/utils/handle-time.js';
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
        // jiantou: require('../img/jiantou.png')
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
        if (msgData.isCheck) {
          // 防止未中奖也弹窗
          this.emitLotteryEvent(msgData?.content?.msg?.data);
        }
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
  .vmp-chat-wap-msg-item {
    pointer-events: auto;
    .msg-showtime {
      padding: 8px 0 24px;
      font-size: 24px;
      color: var(--theme-chat-msg-timeline);
      text-align: center;
    }
    .msg-item {
      margin: 0 24px;
      padding: 8px 0 24px;
      display: flex;
      align-items: flex-start;

      .avatar-wrap {
        position: relative;
        // margin-right: 10px;
        .chat-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: block;
          // border: 2px solid #e3e3e3;
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
          margin-bottom: 12px;
          height: 34px;
          .nickname {
            font-size: 28px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            word-break: break-all;
            color: var(--theme-chat-msg-name-font);
            max-width: 300px;
            line-height: 34px;
            margin-right: 8px;
          }
          .role {
            margin-right: 10px;
            padding: 0 10px;
            line-height: 34px;
            border-radius: 50px;
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
        }
        .msg-content_body_pre {
          position: relative;
          // .jian-left {
          //   width: 11px;
          //   height: 18px;
          //   position: absolute;
          //   left: -11px;
          //   top: 14px;
          // }
        }
        .reply-color {
          color: #fc9600;
          float: left;
          line-height: 1.4;
          margin-right: 8px !important;
        }
        .reply-msg-content {
          word-break: break-word;
          .reply-color {
            min-width: 60px;
          }
          > .imgs {
            .img {
              display: inline-block;
              margin: 8px 8px 0 0;
              width: 84px;
              height: 86px;
              border-radius: 4px;
              background-size: cover;
              background-repeat: no-repeat;
              background-position: center;
              &:nth-last-child(1) {
                margin-right: 0 !important;
              }
            }
          }
          .existSimpleImg {
            padding-top: 0;
          }
        }
        .reply-msg {
          line-height: 40px;
          margin: 8px 0;
          color: var(--theme-chat-msg-reply-font);
          padding-left: 18px;
          position: relative;
          .textInfo {
            position: relative;
          }
          .chat-text {
            line-height: 1.4;
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
          > .imgs {
            .img {
              display: inline-block;
              margin: 8px 8px 0 0;
              width: 84px;
              height: 86px;
              border-radius: 4px;
              background-size: cover;
              background-repeat: no-repeat;
              background-position: center;
              &:nth-last-child(1) {
                margin-right: 0 !important;
              }
            }
          }
          .existSimpleImg .msg-content_chat-img {
            margin-bottom: 0;
          }
        }
        .msg-content_chat-img {
          vertical-align: text-top;
          display: inline-block;
          border-radius: 4px;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          &:nth-last-child(1) {
            margin-right: 0 !important;
          }
        }
        .msg-content_body {
          position: relative;
          display: inline-block;
          padding: 16px;
          word-break: break-all;
          color: var(--theme-chat-msg-font);
          // line-height: 1.4;
          // line-height: 40px;
          font-size: 28px;
          background-color: var(--theme-chat-msg-bg);
          border-radius: 0px 16px 16px 16px;
          max-width: 572px;
          span {
            word-break: break-word;
          }
          .chat-text {
            line-height: 1.4;
            &.existImg {
              margin-bottom: 8px;
            }
            img {
              width: 40px;
              height: 40px;
            }
          }
          .msg-content_chat-img {
            display: inline-block;
            margin-right: 8px;
            width: 84px;
            height: 86px;
            border-radius: 4px;
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
          }
          .imgs {
            .img {
              display: inline-block;
              margin: 8px 8px 0 0;
              width: 84px;
              height: 86px;
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
        .emoji-img {
          width: 24px;
          height: 24px;
        }
      }
      &.interact {
        justify-content: center;
      }
      &.new-gift,
      &.interact {
        margin: 0 auto;
        width: fit-content;
        > div {
          background: var(--theme-chat-msg-interact-bg);
          border-radius: 40px;
        }
        .role {
          float: left;
          border-radius: 50px;
          padding: 0 10px;
          margin-right: 8px;
          margin-top: 4px;
          line-height: 34px;
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
      }
      .interact-msg {
        padding: 4px 24px;
        position: relative;
        border-width: 0;
        min-height: 48px;
        height: auto;
        line-height: 40px;
        color: var(--theme-chat-msg-font);

        &.pwd_red_envelope_ok {
          display: flex;
          align-items: center;
          padding-left: 84px;
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
          transform: scale(0.5);
          transform-origin: 0 0;
          box-sizing: border-box;
          border-radius: 500px;
        }

        p {
          text-align: center;
          line-height: 1;
        }
        .highlight {
          padding-left: 10px;
          color: #0a7ff5;
        }
        .reward-text {
          margin-top: 13px;
        }
        .new-award-img {
          width: 60px;
          position: absolute;
          left: 24px;
        }
      }
      &.exam_msg_flex {
        display: block;
        text-align: center;
        > div {
          border-radius: none;
        }
        .exam_msg_bg {
          &::after {
            border: 0 !important;
          }
        }
      }
      .question_msg_bg {
        &::after {
          border: 0 !important;
        }
      }
    }
    .new-gift {
      padding-left: 0;
      position: relative;
      display: block;
      &.interact {
        justify-content: unset;
      }

      .interact-gift-box {
        padding: 0 84px 0 24px;
        text-align: left;
        width: 100%;
        height: 48px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        position: relative;
        &.zdy {
          padding-right: 90px;
        }
        // p {
        //   text-align: left;
        //   font-weight: 400;
        //   color: #fff;
        // }
        .new-gift-name {
          font-size: 28px;
          margin-right: 8px;
          color: var(--theme-chat-msg-gift-font);
        }
        .new-gift-content {
          font-size: 28px;
          // transform: scale(0.9);
          color: var(--theme-chat-msg-font);
        }
        .flex-box {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .gift-zdy {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          position: absolute;
          right: 24px;
          background-color: var(--theme-chat-msg-bg);
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
      }
      // &.reward_pay_ok {
      //   .interact-gift-box {
      //     height: 88px;
      //     padding: 0 74px 0 24px;
      //     .reward_txt {
      //       line-height: 1;
      //       margin-top: 4px;
      //     }
      //   }
      // }
      .new-gift-img,
      .new-award-img {
        width: 60px;
        position: absolute;
        right: 24px;
      }
      .reward_txt {
        color: #d67900;
        font-size: 28px;
        line-height: 40px;
        text-align: center;
      }
    }
    .margin-top-bottom {
      text-align: center;
      margin: 10px 0;
    }
    .msg-item__content-body__content-link {
      color: #3562fa;
      text-decoration: underline #3562fa !important;
      word-break: break-all;
    }
  }
</style>
width: 40px;
