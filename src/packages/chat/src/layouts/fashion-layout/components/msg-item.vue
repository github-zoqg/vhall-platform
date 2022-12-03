<template>
  <div class="vmp-fashion-chat-msg-item" v-if="!(isOnlyShowSponsor && source.roleName == 2)">
    <!--消息发送时间-->
    <div v-if="showTime" class="vmp-chat-msg-item__showtime">{{ showTime }}</div>
    <!--常规消息-->
    <div
      :class="[
        'msg-item-template',
        ['welcome_msg'].includes(source.type) ? 'msg-item-template--welcome' : ''
      ]"
    >
      <!--欢迎语-->
      <template v-if="['welcome_msg'].includes(source.type)">
        <div v-if="msg.nickname !== '' && msg.content !== ''" class="msg-item-template--welcome">
          <span>{{ msg.nickname }}</span>
          {{ msg.content }}
        </div>
      </template>
      <template v-else>
        <!--常规消息-->
        <div
          v-if="!source.interactStatus && !source.interactToolsStatus"
          class="msg-item-template__normal-msg clearfix"
        >
          <div class="normal-msg__content">
            <div class="normal-msg__content__msg-wrap">
              <template
                v-if="
                  chatOptions &&
                  chatOptions.userControlOptions &&
                  chatOptions.userControlOptions.enable &&
                  !isSelfMsg(source.sendId)
                "
              >
                <div
                  :class="['normal-msg__avatar', 'cur-pointer']"
                  @click="setPersonStatus($event, source)"
                >
                  <img class="normal-msg__avatar-img" :src="source.avatar || defaultAvatar" alt />
                  <img
                    v-if="source.client === 'h5_browser'"
                    class="chat-phone"
                    width="9"
                    height="12"
                    :src="phoneImg"
                    alt
                  />
                </div>
              </template>
              <template v-else>
                <div class="normal-msg__avatar">
                  <img class="normal-msg__avatar-img" :src="source.avatar || defaultAvatar" alt />
                  <img
                    v-if="source.client === 'h5_browser'"
                    class="chat-phone"
                    width="9"
                    height="12"
                    :src="phoneImg"
                    alt
                  />
                </div>
              </template>
              <p class="normal-msg__content__info-wrap clearfix">
                <span
                  v-if="isShowRoleTag"
                  class="info-wrap__role-name"
                  :class="source.roleName | roleClassFilter"
                >
                  {{ source.roleName | roleFilter }}
                </span>

                <template>
                  <span
                    class="info-wrap__nick-name cur-pointer"
                    :class="isShowRoleTag ? '' : 'info-wrap__nick-name__ml32'"
                    @click="setPersonStatus($event, source)"
                    v-if="
                      chatOptions &&
                      chatOptions.userControlOptions &&
                      chatOptions.userControlOptions.enable &&
                      !isSelfMsg(source.sendId)
                    "
                  >
                    {{ source.nickname | overHidden(8) }}
                  </span>
                  <span
                    class="info-wrap__nick-name"
                    :class="isShowRoleTag ? '' : 'info-wrap__nick-name__ml32'"
                    v-else
                  >
                    {{ source.nickname | overHidden(8) }}
                  </span>
                  <span
                    class="normal-msg__content-wrapper"
                    v-if="!hasReplyMsg && source.content.text_content"
                    v-html="msgContent"
                  ></span>
                </template>
              </p>
              <!-- 被回复的消息 -->
              <div v-if="hasReplyMsg" class="normal-msg__content__reply-wrapper">
                <!-- 文本 -->
                <p
                  v-if="
                    source.replyMsg &&
                    source.replyMsg.content &&
                    source.replyMsg.content.text_content
                  "
                  class="reply-wrapper__content reply-msg"
                  v-html="
                    `<span class='reply-wrapper__content__nick-name'>${overHiddenFunc(
                      source.replyMsg.nickname || source.replyMsg.nick_name,
                      8
                    )} </span>${source.replyMsg.content.text_content}`
                  "
                ></p>
                <!-- 图片 -->
                <div
                  v-if="
                    source.replyMsg &&
                    source.replyMsg.content &&
                    source.replyMsg.content.image_urls &&
                    source.replyMsg.content.image_urls.length
                  "
                  class="reply-wrapper__img-wrapper reply-msg"
                >
                  <p
                    v-if="
                      source.replyMsg &&
                      source.replyMsg.content &&
                      source.replyMsg.content.text_content
                    "
                    class="msg-item__content-hr msg-item__content-hr__4"
                  ></p>
                  <!-- 回复 -->
                  <span
                    v-if="!source.replyMsg.content.text_content"
                    class="reply-wrapper__img-wrapper__nick-name"
                  >
                    {{ source.replyMsg.nickname || source.replyMsg.nick_name | overHidden(8)
                    }}{{ ' ' }}
                  </span>
                  <p
                    v-if="!source.replyMsg.content.text_content"
                    class="msg-item__content-hr msg-item__content-hr__4"
                  ></p>
                  <div
                    v-for="(img, index) in source.replyMsg.content.image_urls"
                    :key="index"
                    :class="[
                      'reply-wrapper__img-wrapper__img-box reply-msg',
                      { 'is-watch': isWatch },
                      { 'first-child': index === 0 }
                    ]"
                  >
                    <img
                      class="img-box__content-img"
                      width="40"
                      height="40"
                      :src="img + '?x-oss-process=image/resize,m_lfit,h_80,w_80'"
                      :alt="$t('chat.chat_1065')"
                      @click="previewImg(index, source.replyMsg.content.image_urls)"
                    />
                  </div>
                </div>
              </div>
              <!-- 文本 -->
              <p
                v-if="hasReplyMsg && source.content.text_content"
                class="normal-msg__content-wrapper"
                :class="hasReplyMsg ? 'normal-msg__content-wrapper__mt4' : ''"
                v-html="msgContent"
              ></p>
              <!-- 图片 -->
              <div
                v-if="source.content.image_urls && source.content.image_urls.length"
                class="normal-msg__img-wrapper clearfix"
              >
                <!-- 回复，直播间装修，删除回复消息的“回复” -->
                <!-- <span
                  v-if="source.replyMsg && source.replyMsg.content && !source.content.text_content"
                  class="normal-msg__img-wrapper__label"
                >
                  {{ $t('chat.chat_1036') }}
                </span> -->
                <!-- <p
                  class="msg-item__content-hr msg-item__content-hr__1"
                  v-if="source.content.text_content || (source.replyMsg && source.replyMsg.content)"
                ></p> -->
                <div
                  v-for="(img, index) in source.content.image_urls"
                  :key="index"
                  :class="[
                    'normal-msg__img-wrapper__img-box',
                    { 'is-watch': isWatch },
                    { 'first-child': index === 0 }
                  ]"
                >
                  <img
                    class="normal-msg__img-wrapper__img-box__content-img"
                    width="40"
                    height="40"
                    :src="img + '?x-oss-process=image/resize,m_fill,h_80,w_80'"
                    :alt="$t('chat.chat_1065')"
                    @click="previewImg(index, source.content.image_urls)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 快问快答 -->
        <div
          v-if="
            source.interactStatus &&
            !(source.type == 'pwd_red_envelope_ok' && isEmbed) &&
            [
              'paper_send',
              'paper_send_rank',
              'paper_end',
              'paper_auto_end',
              'paper_auto_send_rank'
            ].includes(source.type)
          "
          class="msg-item-template__exam_container"
        >
          <exam-msg-item :source="source" @checkExamDetail="checkExamDetail"></exam-msg-item>
        </div>
        <!-- 抽奖、问答、签到、问卷、红包 -->
        <div
          v-if="
            source.interactStatus &&
            !(source.type == 'pwd_red_envelope_ok' && isEmbed) &&
            ![
              'paper_send',
              'paper_send_rank',
              'paper_end',
              'paper_auto_end',
              'paper_auto_send_rank'
            ].includes(source.type)
          "
          class="msg-item-template__interact"
        >
          <div class="msg-item-template__interact-content">
            <span
              v-show="source.roleName"
              class="interact-content__role-name"
              :class="source.roleName | roleClassFilterForMsg"
            >
              {{ source.roleName | roleFilter }}
            </span>
            <span v-show="source.nickname" class="interact-content__nick-name">
              {{ source.nickname | overHidden(8) }}
            </span>
            <span>{{ source.content.text_content }}</span>
            <!-- 红包图标 -->
            <img
              v-if="source.type == 'pwd_red_envelope_ok'"
              class="interact-content__redpackage-img"
              src="../../../common/img/red-package-1.png"
              alt=""
            />
            <span
              v-if="source.isCheck"
              class="interact-content__click-detail"
              @click="clickToView(source.type, source.content)"
            >
              {{ $t('chat.chat_1098') }}
            </span>
          </div>
        </div>
        <!-- 礼物、打赏 -->
        <div
          v-if="
            !isOnlyShowSponsor &&
            source.interactToolsStatus &&
            !(source.type === 'reward_pay_ok' && isEmbed)
          "
          class="msg-item-template__interact-tools"
        >
          <div class="interact-tools-content">
            <span v-show="source.nickname" class="interact-tools-content__nick-name">
              {{ source.nickname }}
            </span>
            <span>
              {{
                source.type === 'reward_pay_ok'
                  ? $t('chat.chat_1029')
                  : `${$t('chat.chat_1032')}${$tdefault(source.content.gift_name)}`
              }}
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
              class="interact-tools-content__img"
              :class="{
                'interact-tools-content__img-scale': source.content.source_status === '0',
                'interact-tools-content__img-reward': !source.content.gift_url
              }"
              :src="require('@/app-shared/assets/img/wap/chat/assetsMap')(source.content.gift_name)"
              :alt="$t('interact_tools.interact_tools_1029')"
            />
            <br v-if="source.type === 'reward_pay_ok'" />
            <span v-if="source.type === 'reward_pay_ok'" style="color: #fa9a32">
              {{ source.content.text_content }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
  import EventBus from '../../../common/js/Events.js';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import phoneImg from '@/app-shared/assets/img/phone.png';
  import { handleChatShowTime } from '@/app-shared/utils/handle-time.js';
  import ExamMsgItem from './exam-msg-item.vue';
  export default {
    name: 'msgItem',
    props: {
      source: {
        type: Object,
        required: true,
        default() {
          return {};
        }
      },
      //是否只展示观看端
      isOnlyShowSponsor: {
        default: false
      },
      // roleName: {
      //   required: true
      // },
      //聊天配置
      chatOptions: {
        type: Object,
        default: () => {
          return {};
        }
      },
      //当前登录人的信息
      joinInfo: {
        type: Object,
        default: () => {
          return {};
        }
      },
      //前一条消息
      preMsg: {
        type: Object,
        default: null
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
      // 是否观看端
      isWatch: {
        type: Boolean,
        default: null
      }
    },
    data() {
      return {
        //消息内容
        msgContent: '',
        //是否是嵌入端
        isEmbed: false,
        //默认兜底头像
        defaultAvatar: defaultAvatar,
        //手机端icon标识
        phoneImg: phoneImg
      };
    },
    components: {
      ExamMsgItem
    },
    computed: {
      isShowRoleTag() {
        return (
          (['text', 'image'].includes(this.source.type) || this.source.isHistoryMsg) &&
          this.source.roleName &&
          this.source.roleName != '2'
        );
      },
      hasReplyMsg() {
        return (
          this.source.replyMsg &&
          this.source.replyMsg.content &&
          (this.source.replyMsg.content.text_content || this.source.replyMsg.content.image_urls)
        );
      },
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
      overHiddenFunc(value = '', len = 0) {
        if (value === null || value === undefined) return '';
        if (value.length > len) {
          return value.substring(0, len) + '...';
        }
        return value;
      },
      setPersonStatus(event, msg) {
        if (!msg.sendId) {
          return;
        }
        EventBus.$emit(
          'set_person_status_in_chat',
          event.target,
          msg.sendId,
          msg.count,
          msg.nickname,
          msg.roleName
        );
      },
      // 判断是不是自己的消息
      isSelfMsg(id) {
        return this.joinInfo.third_party_user_id == id;
      },
      //信令唤起其他模块 点击查看消息
      clickToView(type, content) {
        // TODO: type 目前消息体不统一
        // 抽奖点击查看
        if (content?.msg?.data?.type === 'lottery_result_notice') {
          this.lotteryCheck(content?.msg?.data);
        }
        // 问卷查看
        if (type === 'questionnaire_push') {
          this.questionnaireCheck(content.questionnaire_id);
        }
        // 快问快答查看
        if (
          [
            'paper_send',
            'paper_send_rank',
            'paper_end',
            'paper_auto_end',
            'paper_auto_send_rank'
          ].includes(type)
        ) {
          this.checkExamDetail({
            examId: content.exam_id,
            examTitle: content.exam_title,
            sourceType: type
          });
        }
      },
      //点击查看抽奖信息
      lotteryCheck(msg) {
        this.emitLotteryEvent(msg);
      },
      //点击查看问卷信息
      questionnaireCheck(questionnaire_id) {
        this.emitQuestionnaireEvent(questionnaire_id);
      },
      //点击查看快问快答信息
      checkExamDetail(vo) {
        this.emitExamEvent(vo);
      },
      //处理@消息
      handleAt() {
        //todo 可以考虑domaint提供统一的处理 实现@用户
        this.msgContent = this.urlToLink(this.source.content.text_content);
        this.source.atList &&
          this.source.atList.forEach(a => {
            // TODO历史列表aList与直播中格式不一致作
            const userName = `@${a.nick_name || a.nickName}`;
            const match =
              this.source.content &&
              this.source.content.text_content &&
              this.source.content.text_content.indexOf(userName) != -1;
            if (match) {
              const isStart = this.source.content.text_content.startsWith(userName);
              this.msgContent = this.urlToLink(
                this.source.content.text_content.replace(
                  userName,
                  `<span class='normal-msg__content-wrapper__at ${
                    !isStart ? 'normal-msg__content-wrapper__at-ml__4' : ''
                  }'>${this.overHiddenFunc(userName, 8)} </span>`
                )
              );
            }
          });
        if (
          this.source.atList &&
          this.source.atList.find(u => this.joinInfo.third_party_user_id == u.accountId) &&
          !this.source.isHistoryMsg
        ) {
          this.$emit('dispatchEvent', { type: 'scrollElement', el: this.$el });
          clearTimeout(this.tipTimer);
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
          clearTimeout(this.tipTimer);
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
  .vmp-fashion-chat-msg-item {
    @font-dark-low: #999;
    @font-dark-normal: #e6e6e6;
    @bg-dark-normal: #1a1a1a;
    @font-link: #3562fa;
    @font-click-detail: #0a7ff5;
    pointer-events: auto;

    &__showtime {
      margin-top: 16px;
      margin-bottom: 12px;
      text-align: center;
      font-size: 14px;
      color: @font-dark-low;
      line-height: 20px;
    }

    .msg-item-template {
      margin: 0 10px 0px 12px;
      padding-top: 8px;
      padding-bottom: 4px;
      display: flex;
      align-items: center;
      .msg-item__content-hr {
        height: 6px;
        display: block;
        &__1 {
          height: 1px;
        }
        &__4 {
          height: 4px;
        }
      }
      &--welcome {
        width: 270px;
        padding: 6px 10px 7px 10px;
        border-radius: 30px;
        background-color: #202020;
        text-align: center;
        color: #bcbcbc;
        font-size: 12px;
        box-sizing: border-box;
        margin: 0 auto 12px auto;
        span {
          color: #4da1ff;
          display: inline-block;
          width: 70px;
          overflow: hidden;
          height: 16px;
          line-height: 14px;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }
      }
      &__normal-msg {
        display: flex;
        /*普通消息*/
        .normal-msg__avatar {
          width: 24px;
          height: 24px;
          border-radius: 14px;
          position: absolute;
          top: 3px;
          .normal-msg__avatar-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }
          .chat-phone {
            position: absolute;
            bottom: 0;
            right: 0;
          }
        }
        .normal-msg__content {
          flex: 1;
          padding-left: 8px;
          word-break: break-all;
          .normal-msg__content__info-wrap {
            display: inline;
            // align-items: center;
          }
          .normal-msg__content__msg-wrap {
            position: relative;
            display: inline-block;
            margin-top: 4px;
            padding: 4px 6px;
            background: var(--chat-background-color-secondary);
            border-radius: 15px;
          }
          .info-wrap__nick-name {
            max-width: 126px;
            font-size: 14px;
            color: var(--chat-font-color-msg-nickname);
            line-height: 22px;
            overflow: hidden;
            text-overflow: ellipsis;
            // white-space: nowrap;
            margin-left: 4px;
            &__ml32 {
              margin-left: 32px;
            }
          }
          .info-wrap__role-name {
            margin-left: 32px;
            padding: 2px 4px;
            font-size: 12px;
            line-height: 12px;
            background-color: rgba(251, 38, 38, 0.15);
            border-radius: 9px;
            &.host {
              background: rgba(251, 38, 38, 0.15);
              color: #fb2626;
            }
            &.assistant {
              background: rgba(10, 127, 245, 0.15);
              color: #33a0ff;
            }
            &.guest {
              background: rgba(10, 127, 245, 0.15);
              color: #33a0ff;
            }
          }

          .normal-msg__content__reply-wrapper {
            border-radius: 4px;
            position: relative;
            &::before {
              content: '';
              width: 3px;
              position: absolute;
              top: 4px;
              bottom: 4px;
              border-radius: 6px;
              background: var(--chat-font-color-msg-nickname);
            }
          }
          .reply-wrapper__content {
            margin-top: 4px;
            margin-left: 7px;
            font-size: 12px;
            line-height: 20px;
            color: var(--chat-font-color-msg-nickname);
            &.reply-msg {
              margin-top: 0;
            }
            .reply-wrapper__content__nick-name {
              margin-right: 4px;
              line-height: 20px;
              color: var(--chat-font-color-reply-name);
            }
            .reply-msg__label {
              color: #fa9a32;
            }
          }
          .reply-wrapper__img-wrapper {
            margin-left: 8px;
            padding-bottom: 4px;
            line-height: 1;
            .reply-msg__label {
              font-size: 12px;
              line-height: 20px;
              display: block;
              color: #fa9a32;
            }
          }
          .reply-wrapper__img-wrapper__img-box {
            display: inline-block;
            width: 40px;
            height: 40px;
            &.is-watch {
              width: 60px;
              height: 60px;
            }
            border-radius: 4px;
            overflow: hidden;
            background-color: @bg-dark-normal;
            margin-left: 8px;
            &.first-child {
              margin-left: 0;
            }
            &.reply-msg {
              width: 40px;
              height: 40px;
            }
            .img-box__content-img {
              width: 100%;
              height: 100%;
              margin: 0 auto;
              cursor: pointer;
              -o-object-fit: cover;
              object-fit: cover;
            }
          }
          .reply-wrapper__img-wrapper__nick-name {
            color: @font-dark-low;
            font-size: 14px;
            line-height: 20px;
            margin-right: 4px;
          }
          .normal-msg__content-wrapper {
            font-size: 14px;
            color: var(--chat-font-color-msg-text);
            line-height: 22px;
            word-break: break-word;
            &__mt4 {
              margin-top: 4px;
            }
            .normal-msg__content-wrapper__label {
              color: #fa9a32;
            }
            .normal-msg__content-wrapper__at {
              color: #0a7ff5;
              font-size: 14px;
              line-height: 22px;
              &-ml__4 {
                margin-left: 4px;
              }
            }
          }

          .normal-msg__img-wrapper {
            padding: 4px 0;
            .normal-msg__img-wrapper__label {
              font-size: 14px;
              line-height: 20px;
              display: block;
              color: #fa9a32;
            }
          }
          .normal-msg__img-wrapper__img-box {
            float: left;
            width: 40px;
            height: 40px;
            &.is-watch {
              width: 56px;
              height: 56px;
            }
            border-radius: 4px;
            overflow: hidden;
            background-color: @bg-dark-normal;
            margin-left: 8px;
            &.first-child {
              margin-left: 0;
            }
          }
          .normal-msg__img-wrapper__img-box__content-img {
            height: 100%;
            -o-object-fit: cover;
            object-fit: cover;
            width: 100%;
            margin: 0 auto;
            cursor: pointer;
          }
        }
      }
      &__interact {
        /*互动消息*/
        width: 100%;
        display: flex;
        justify-content: center;
        &-content {
          padding: 3px 8px;
          background: var(--chat-background-color-secondary);
          border-radius: 14px;
          font-size: 14px;
          line-height: 22px;
          padding: 6px 8px;
          color: var(--chat-font-color-msg-text);
          text-align: center;
          > span {
            float: left;
          }
        }
        .interact-content__nick-name {
          display: inline-block;
          max-width: 124px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 14px;
          line-height: 22px;
          color: var(--chat-font-color-msg-nickname);
          margin-right: 4px;
        }
        .interact-content__role-name {
          color: #fb2626;
          background-color: rgba(53, 98, 250, 0.2);
          border-radius: 9px;
          padding: 2px 4px;
          font-size: 12px;
          line-height: 12px;
          margin: 4px 4px 0 0;
          &.host {
            background: rgba(251, 38, 38, 0.15);
            color: #fb2626;
          }
          &.assistant {
            background: rgba(10, 127, 245, 0.15);
            color: #33a0ff;
          }
          &.guest {
            background: rgba(10, 127, 245, 0.15);
            color: #33a0ff;
          }
        }
        .interact-content__redpackage-img {
          width: 19px;
          margin-left: 5px;
          margin-top: 2px;
          float: left;
        }
        .interact-content__click-detail {
          color: @font-click-detail;
          cursor: pointer;
          user-select: none;
          margin-left: 4px;
        }
      }
      &__interact-tools {
        /* 红包、打赏 */
        width: 100%;
        display: flex;
        justify-content: center;
        .interact-tools-content {
          /*  margin-top: 20px; TODO: 注释掉内部20间距，外部有20间距设定 */
          line-height: 22px;
          padding: 4px 8px;
          background-color: var(--chat-background-color-secondary);
          border-radius: 15px;
          color: var(--chat-font-color-msg-text);
          font-size: 14px;
          text-align: center;
          > span {
            //float: left;
          }
          &__nick-name {
            color: var(--chat-font-color-msg-nickname);
            padding-right: 4px;
            font-size: 14px;
            line-height: 22px;
          }
          &__img {
            height: 24px;
            padding-left: 4px;
            &-scale {
              transform: scale(1);
            }
            &-reward {
              transform: scale(0.8);
            }
          }
          .gift-zdy {
            width: 18px;
            height: 18px;
            display: inline-block;
            background-color: white;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            margin-left: 7px;
            vertical-align: middle;
          }
        }
      }
      &__exam_container {
        margin: 0 auto;
      }
    }
    .msg-item__content-body__content-link {
      color: @font-click-detail;
      text-decoration: underline @font-click-detail !important;
      word-break: break-all;
    }
  }
</style>
