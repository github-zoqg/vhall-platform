<template>
  <div class="vmp-chat-msg-item" v-if="!(isOnlyShowSponsor && source.roleName == 2)">
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

          <div class="normal-msg__content">
            <p class="normal-msg__content__info-wrap clearfix">
              <template>
                <span
                  class="info-wrap__nick-name cur-pointer"
                  @click="setPersonStatus($event, source)"
                  v-if="
                    chatOptions &&
                    chatOptions.userControlOptions &&
                    chatOptions.userControlOptions.enable &&
                    !isSelfMsg(source.sendId)
                  "
                >
                  {{ source.nickname }}
                </span>
                <span class="info-wrap__nick-name" v-else>
                  {{ source.nickname }}
                </span>
              </template>

              <span
                v-if="
                  (['text', 'image'].includes(source.type) || source.isHistoryMsg) &&
                  source.roleName &&
                  source.roleName != '2'
                "
                class="info-wrap__role-name"
                :class="source.roleName | roleClassFilter"
              >
                {{ source.roleName | roleFilter }}
              </span>
            </p>
            <!-- 被回复的消息 -->
            <div
              v-if="
                source.replyMsg &&
                source.replyMsg.content &&
                (source.replyMsg.content.text_content || source.replyMsg.content.image_urls)
              "
              class="normal-msg__content__reply-wrapper"
            >
              <!-- 文本 -->
              <p
                v-if="
                  source.replyMsg && source.replyMsg.content && source.replyMsg.content.text_content
                "
                class="reply-wrapper__content reply-msg"
                v-html="
                  `<span class='reply-wrapper__content__nick-name'>${
                    source.replyMsg.nickname || source.replyMsg.nick_name
                  }</span>&nbsp;${source.replyMsg.content.text_content}`
                "
              ></p>
              <!-- 图片 -->
              <div
                v-if="
                  source.replyMsg && source.replyMsg.content && source.replyMsg.content.image_urls
                "
                class="reply-wrapper__img-wrapper reply-msg"
                :style="source.replyMsg.content.text_content && 'margin-top:-3px;'"
              >
                <p
                  v-if="
                    source.replyMsg &&
                    source.replyMsg.content &&
                    source.replyMsg.content.text_content
                  "
                  class="msg-item__content-hr"
                ></p>
                <!-- 回复 -->
                <span
                  v-if="!source.replyMsg.content.text_content"
                  class="reply-wrapper__img-wrapper__nick-name"
                >
                  {{ source.replyMsg.nickname }}
                </span>
                <p class="msg-item__content-hr"></p>
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
                    width="34"
                    height="34"
                    :src="img"
                    :alt="$t('chat.chat_1065')"
                    @click="previewImg(index, source.replyMsg.content.image_urls)"
                  />
                </div>
              </div>
            </div>
            <!-- 文本 -->
            <p
              v-if="source.content.text_content"
              class="normal-msg__content-wrapper"
              v-html="
                source.replyMsg && source.replyMsg.content
                  ? `<span class='normal-msg__content-wrapper__label'>${$t(
                      'chat.chat_1036'
                    )}&nbsp;</span> ${msgContent}`
                  : msgContent
              "
            ></p>
            <!-- 图片 -->
            <div v-if="source.content.image_urls" class="normal-msg__img-wrapper">
              <!-- 回复 -->
              <span
                v-if="source.replyMsg && source.replyMsg.content && !source.content.text_content"
                class="normal-msg__img-wrapper__label"
              >
                {{ $t('chat.chat_1036') }}
              </span>
              <p class="msg-item__content-hr"></p>
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
                  width="34"
                  height="34"
                  :src="img"
                  :alt="$t('chat.chat_1065')"
                  @click="previewImg(index, source.content.image_urls)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 抽奖、问答、签到、问卷、红包 -->
        <div
          v-if="source.interactStatus && !(source.type == 'red_envelope_ok' && isEmbed)"
          class="msg-item-template__interact"
        >
          <div class="msg-item-template__interact-content">
            <span
              v-show="source.nickname && source.roleName != 1"
              class="interact-content__nick-name"
            >
              {{ source.nickname | overHidden(8) }}
            </span>
            <span
              v-show="source.roleName"
              class="interact-content__role-name"
              :class="source.roleName | roleClassFilterForMsg"
            >
              {{ source.roleName | roleFilter }}
            </span>
            <img
              v-if="source.type == 'red_envelope_ok'"
              class="interact-content__redpackage-img"
              src="../img/red-package-1.png"
              alt=""
            />
            <span>{{ source.content.text_content }}</span>
            <span
              v-if="source.isCheck"
              class="interact-content__click-detail"
              @click="clickToView(source.type, source.content)"
            >
              {{ $t('nav.nav_1027') }}
            </span>
          </div>
        </div>
        <!-- 礼物、打赏 -->
        <div
          v-if="source.interactToolsStatus && !(source.type === 'reward_pay_ok' && isEmbed)"
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
                  : `${$t('chat.chat_1032')}${source.content.gift_name}`
              }}
            </span>
            <img
              class="interact-tools-content__img"
              :class="{
                'interact-tools-content__img-scale': source.content.source_status === '0',
                'interact-tools-content__img-reward': !source.content.gift_url
              }"
              :src="source.content.gift_url || require('../img/red-package-1.png')"
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
  import EventBus from '../js/Events.js';
  import defaultAvatar from '@/packages/app-shared/assets/img/my-dark@2x.png';
  import phoneImg from '@/packages/app-shared/assets/img/phone.png';
  import { handleChatShowTime } from '../js/handle-time.js';
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
    computed: {
      showTime() {
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
      },
      //点击查看抽奖信息
      lotteryCheck(msg) {
        this.emitLotteryEvent(msg);
      },
      //点击查看问卷信息
      questionnaireCheck(questionnaire_id) {
        this.emitQuestionnaireEvent(questionnaire_id);
      },
      //处理@消息
      handleAt() {
        //todo 可以考虑domaint提供统一的处理 实现@用户
        if (!this.source.atList || !this.source.atList.length) {
          this.msgContent = this.urlToLink(this.source.content.text_content);
        } else {
          let at = false;
          this.source.atList.forEach(a => {
            // TODO历史列表aList与直播中格式不一致作
            const userName = `@${a.nick_name || a.nickName} `;
            const match =
              this.source.content &&
              this.source.content.text_content &&
              this.source.content.text_content.indexOf(userName) != -1;
            if (match) {
              if (at) {
                this.msgContent = this.urlToLink(
                  this.msgContent.replace(
                    userName,
                    `<span style='color:#3562fa'>${userName}</span>`
                  )
                );
              } else {
                this.msgContent = this.urlToLink(
                  this.source.content.text_content.replace(
                    userName,
                    `<span style='color:#3562fa'>${userName}</span>`
                  )
                );
              }
              at = true;
            } else {
              this.msgContent = at
                ? this.urlToLink(this.msgContent)
                : this.urlToLink(this.source.content.text_content);
            }
          });
        }
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
  .vmp-chat-msg-item {
    @font-dark-low: #999;
    @font-dark-normal: #e6e6e6;
    @bg-dark-normal: #1a1a1a;
    @font-link: #3562fa;
    pointer-events: auto;

    &__showtime {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: @font-dark-low;
      line-height: 20px;
    }

    .msg-item-template {
      margin: 0 10px 0 12px;
      padding-top: 20px;
      display: flex;
      align-items: center;
      .msg-item__content-hr {
        height: 6px;
        display: block;
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
          width: 28px;
          height: 28px;
          border-radius: 14px;
          position: relative;
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
          padding-left: 10px;
          word-break: break-all;
          .normal-msg__content__info-wrap {
            display: flex;
            align-items: center;
          }
          .info-wrap__nick-name {
            max-width: 126px;
            font-size: 14px;
            color: @font-dark-low;
            line-height: 16px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .info-wrap__role-name {
            padding: 0 4px;
            margin-left: 8px;
            font-size: 12px;
            line-height: 16px;
            background-color: rgba(251, 58, 50, 0.2);
            border-radius: 9px;
            &.host {
              background: rgba(251, 58, 50, 0.2);
              color: #fb3a32;
            }
            &.assistant {
              background-color: rgba(53, 98, 250, 0.2);
              color: #3562fa;
            }
            &.guest {
              background-color: rgba(53, 98, 250, 0.2);
              color: #3562fa;
            }
          }

          .normal-msg__content__reply-wrapper {
            margin-top: 8px;
            background: #222222;
            border-radius: 4px;
            padding: 6px;
          }
          .reply-wrapper__content {
            margin-top: 4px;
            font-size: 14px;
            color: @font-dark-normal;
            line-height: 20px;
            &.reply-msg {
              margin-top: 0;
            }
            .reply-wrapper__content__nick-name {
              color: @font-dark-low;
            }
            .reply-msg__label {
              color: #fa9a32;
            }
          }
          .reply-wrapper__img-wrapper {
            .reply-msg__label {
              font-size: 14px;
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
          }
          .normal-msg__content-wrapper {
            margin-top: 4px;
            font-size: 14px;
            color: @font-dark-normal;
            line-height: 20px;
            word-break: break-word;
            .normal-msg__content-wrapper__label {
              color: #fa9a32;
            }
          }

          .normal-msg__img-wrapper {
            .normal-msg__img-wrapper__label {
              font-size: 14px;
              line-height: 20px;
              display: block;
              color: #fa9a32;
            }
          }
          .normal-msg__img-wrapper__img-box {
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
          // margin: 20px 46px 0;
          line-height: 20px;
          padding: 5px 16px;
          background-color: #222;
          border-radius: 15px;
          color: @font-dark-normal;
          font-size: 14px;
          text-align: center;
          > span {
            float: left;
          }
        }
        .interact-content__nick-name {
          display: inline-block;
          max-width: 124px;
          color: #999999;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .interact-content__role-name {
          color: @font-link;
          background-color: rgba(53, 98, 250, 0.2);
          border-radius: 9px;
          padding: 0 4px;
          font-size: 12px;
          line-height: 16px;
          margin: 2px 4px 0;
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
        .interact-content__redpackage-img {
          width: 16px;
          margin-right: 4px;
          margin-top: 1px;
          float: left;
        }
        .interact-content__click-detail {
          color: @font-link;
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
          line-height: 20px;
          padding: 5px 16px;
          background-color: #222;
          border-radius: 15px;
          color: @font-dark-normal;
          font-size: 14px;
          text-align: center;
          > span {
            //float: left;
          }
          &__nick-name {
            color: @font-dark-low;
            border-radius: 9px;
            padding: 0 4px;
            font-size: 14px;
            line-height: 20px;
          }
          &__img {
            height: 18px;
            padding-left: 7px;
            &-scale {
              transform: scale(1.4);
            }
            &-reward {
              transform: scale(0.8);
            }
          }
        }
      }
    }
    .msg-item__content-body__content-link {
      color: #3562fa;
      text-decoration: underline #3562fa !important;
    }
  }
</style>
