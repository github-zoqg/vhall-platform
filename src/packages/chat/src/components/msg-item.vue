<template>
  <div class="vmp-chat-msg-item">
    <!--消息发送时间-->
    <div v-if="msg.showTime" class="vmp-chat-msg-item__showtime">{{ msg.showTime }}</div>
    <!--常规消息-->
    <div
      :class="[
        'msg-item-template',
        ['welcome_msg'].includes(msg.type) ? 'msg-item-template--welcome' : ''
      ]"
    >
      <!--欢迎语-->
      <template v-if="['welcome_msg'].includes(msg.type)">
        <div v-if="msg.nickname !== '' && msg.content !== ''" class="msg-item-template--welcome">
          <span>{{ msg.nickname }}</span>
          {{ msg.content }}
        </div>
      </template>
      <template v-else>
        <!--常规消息-->
        <div
          v-if="!msg.interactStatus && !msg.interactToolsStatus"
          class="msg-item-template__normal-msg clearfix"
        >
          <template
            v-if="
              chatOptions && chatOptions.userControlOptions && chatOptions.userControlOptions.enable
            "
          >
            <div class="normal-msg__avatar" @click="setPersonStatus($event, msg)">
              <img class="normal-msg__avatar-img" :src="msg.avatar" alt />
              <img
                v-if="msg.client === 'h5_browser'"
                class="chat-phone"
                width="9"
                height="12"
                src="../images/phone.png"
                alt
              />
            </div>
          </template>
          <template v-else>
            <div class="normal-msg__avatar">
              <img class="normal-msg__avatar-img" :src="msg.avatar" alt />
              <img
                v-if="msg.client === 'h5_browser'"
                class="chat-phone"
                width="9"
                height="12"
                src="../images/phone.png"
                alt
              />
            </div>
          </template>

          <div class="normal-msg__content">
            <p class="normal-msg__content__info-wrap clearfix">
              <span class="info-wrap__nick-name">{{ msg.nickname }}</span>
              <span
                v-if="
                  (msg.type === 'text' || msg.type === 'image') &&
                  msg.roleName &&
                  msg.roleName != '2'
                "
                class="info-wrap__role-name"
                :class="msg.roleName | roleClassFilter"
              >
                {{ roleFilter(msg.roleName) }}
              </span>
            </p>
            <!-- 被回复的消息 -->
            <div
              v-if="
                msg.replyMsg &&
                msg.replyMsg.content &&
                (msg.replyMsg.content.text_content || msg.replyMsg.content.image_urls)
              "
              class="normal-msg__content__reply-wrapper"
            >
              <!-- 文本 -->
              <p
                v-if="msg.replyMsg && msg.replyMsg.content && msg.replyMsg.content.text_content"
                class="reply-wrapper__content reply-msg"
                v-html="
                  `<span class='reply-wrapper__content__nick-name'>${
                    msg.replyMsg.nickname || msg.replyMsg.nick_name
                  }</span>&nbsp;${msg.replyMsg.content.text_content}`
                "
              ></p>
              <!-- 图片 -->
              <div
                v-if="msg.replyMsg && msg.replyMsg.content && msg.replyMsg.content.image_urls"
                class="reply-wrapper__img-wrapper reply-msg"
                :style="msg.replyMsg.content.text_content && 'margin-top:-3px;'"
              >
                <p
                  v-if="msg.replyMsg && msg.replyMsg.content && msg.replyMsg.content.text_content"
                  class="msg-item__content-hr"
                ></p>
                <!-- 回复 -->
                <span
                  v-if="!msg.replyMsg.content.text_content"
                  class="reply-wrapper__img-wrapper__nick-name"
                >
                  {{ msg.replyMsg.nickname }}
                </span>
                <p class="msg-item__content-hr"></p>
                <div
                  v-for="(img, index) in msg.replyMsg.content.image_urls"
                  :key="index"
                  class="reply-wrapper__img-wrapper__img-box reply-msg"
                  :class="index === 0 ? 'first-child' : ''"
                >
                  <img
                    class="img-box__content-img"
                    width="34"
                    height="34"
                    :src="img"
                    :alt="$t('chat.chat_1065')"
                    @click="previewImg($event, index, msg.replyMsg.content.image_urls)"
                  />
                </div>
              </div>
            </div>
            <!-- 文本 -->
            <p
              v-if="msg.content.text_content"
              class="normal-msg__content-wrapper"
              v-html="
                msg.replyMsg && msg.replyMsg.content
                  ? `<span class='normal-msg__content-wrapper__label'>回复&nbsp;</span> ${msgContent}`
                  : msgContent
              "
            ></p>
            <!-- 图片 -->
            <div v-if="msg.content.image_urls" class="normal-msg__img-wrapper">
              <!-- 回复 -->
              <span
                v-if="msg.replyMsg && msg.replyMsg.content && !msg.content.text_content"
                class="normal-msg__img-wrapper__label"
              >
                回复
              </span>
              <p class="msg-item__content-hr"></p>
              <div
                v-for="(img, index) in msg.content.image_urls"
                :key="index"
                class="normal-msg__img-wrapper__img-box"
                :class="index === 0 ? 'first-child' : ''"
              >
                <img
                  class="normal-msg__img-wrapper__img-box__content-img"
                  width="34"
                  height="34"
                  :src="img"
                  alt="聊天图片加载失败"
                  @click="previewImg($event, index, msg.content.image_urls)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 抽奖、问答、签到、问卷、红包 -->
        <div
          v-if="msg.interactStatus && !(msg.type == 'red_envelope_ok' && isEmbed)"
          class="msg-item-template__interact"
        >
          <div class="msg-item-template__interact-content">
            <span v-show="msg.nickname && msg.roleName != 1" class="interact-content__nick-name">
              {{ msg.nickname }}
            </span>
            <span
              v-show="msg.roleName"
              class="interact-content__role-name"
              :class="msg.roleName | roleClassFilterForMsg"
            >
              {{ roleFilter(msg.roleName) }}
            </span>
            <img
              v-if="msg.type == 'red_envelope_ok'"
              class="interact-content__redpackage-img"
              src="../images/red-package-1.png"
              alt=""
            />
            <span>{{ msg.content.text_content }}</span>
            <span
              v-if="msg.isCheck"
              class="interact-content__click-detail"
              @click="clickToView(msg.type, msg.content)"
            >
              {{ $t('nav.nav_1027') }}
            </span>
          </div>
        </div>
        <!-- 礼物、打赏 -->
        <div
          v-if="msg.interactToolsStatus && !(msg.type === 'reward_pay_ok' && isEmbed)"
          class="msg-item-template__interact-tools"
        >
          <div class="interact-tools-content">
            <span v-show="msg.nickname" class="interact-tools-content__nick-name">
              {{ msg.nickname }}
            </span>
            <span>
              {{ msg.type === 'reward_pay_ok' ? '打赏了红包' : `送出${msg.content.gift_name}` }}
            </span>
            <img
              class="interact-tools-content__img"
              :class="{
                'interact-tools-content__img-scale': msg.content.source_status === '0',
                'interact-tools-content__img-reward': !msg.content.gift_url
              }"
              :src="msg.content.gift_url || require('../images/red-package-1.png')"
              :alt="$t('interact_tools.interact_tools_1029')"
            />
            <br v-if="msg.type === 'reward_pay_ok'" />
            <span v-if="msg.type === 'reward_pay_ok'" style="color: #fa9a32">
              {{ msg.content.text_content }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
  import EventBus from '../js/Events.js';
  export default {
    name: 'msgItem',
    props: {
      msg: {
        type: Object,
        required: true,
        default() {
          return {};
        }
      },
      roleName: {
        required: true
      },
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
      }
    },
    data() {
      return {
        msgContent: '',
        //是否是嵌入端
        isEmbed: false
      };
    },
    computed: {
      //角色转换
      roleFilter() {
        const _this = this;
        return function (value) {
          let ret = '';
          switch (Number(value)) {
            case 1:
              ret = _this.$t('chat.chat_1022');
              break;
            case 3:
              ret = _this.$t('chat.chat_1024');
              break;
            case 4:
              ret = _this.$t('chat.chat_1023');
              break;
            case 20:
              ret = _this.$t('chat.chat_1064');
              break;
            default:
              ret = _this.$t('chat.chat_1062');
          }
          return ret;
        };
      }
    },
    filters: {
      //文字过长截取
      textOverflowSlice(val = '', len = 0) {
        if (['', void 0, null].includes(val) || ['', void 0, null].includes(len)) {
          return '';
        }
        if (val.length > len) {
          return val.substring(0, len) + '...';
        }
        return val;
      },
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
      // 预览图片
      previewImg(e, index, images) {
        this.$emit('previewImg', index, images);
      },
      //todo domain负责
      setPersonStatus(event, msg) {
        if (!msg.sendId) {
          return;
        }
        // 嘉宾和助理只能操作观众
        if ((this.roleName == 3 || this.roleName == 4) && msg.roleName != 2) {
          EventBus.$emit(
            'set_person_status_in_chat',
            event.target,
            msg.sendId,
            msg.count,
            msg.nickname,
            false,
            msg.roleName
          );
          return;
        }
        // 观众不能操作
        if (this.roleName == 2) {
          return;
        }
        EventBus.$emit(
          'set_person_status_in_chat',
          event.target,
          msg.sendId,
          msg.count,
          msg.nickname,
          true,
          msg.roleName
        );
      },
      //todo 信令唤起其他模块 点击查看消息
      clickToView(type, content) {
        // 抽奖点击查看
        if (type === 'lottery_result_notice') {
          this.lotteryCheck(content);
        } else if (type === 'questionnaire_push') {
          // 问卷点击查看
          this.questionnaireCheck(content.questionnaire_id);
        }
      },
      //todo 点击查看抽奖信息
      lotteryCheck(content) {
        this.$emit('lotteryCheck', content.msg, content.userId);
      },
      //todo 点击查看问卷信息
      questionnaireCheck(questionnaire_id) {
        this.$emit('questionnaireCheck', questionnaire_id);
      },
      //处理@消息
      handleAt() {
        //todo 可以考虑domaint提供统一的处理 实现@用户
        if (!this.msg.atList.length) {
          this.msgContent = this.msg.content.text_content;
        } else {
          let at = false;
          this.msg.atList.forEach(a => {
            // TODO历史列表aList与直播中格式不一致作
            const userName = `@${a.nick_name || a.nickName} `;
            const match =
              this.msg.content &&
              this.msg.content.text_content &&
              this.msg.content.text_content.indexOf(userName) != -1;
            if (match) {
              if (at) {
                this.msgContent = this.msgContent.replace(
                  userName,
                  `<span style='color:#4DA1FF'>${userName}</span>`
                );
              } else {
                this.msgContent = this.msg.content.text_content.replace(
                  userName,
                  `<span style='color:#4DA1FF'>${userName}</span>`
                );
              }
              at = true;
            } else {
              this.msgContent = at ? this.msgContent : this.msg.content.text_content;
            }
          });
        }
        if (
          this.msg.atList &&
          this.msg.atList.find(u => this.joinInfo.third_party_user_id == u.accountId) &&
          !this.msg.isHistoryMsg
        ) {
          this.$emit('dispatchEvent', { type: 'scrollElement', el: this.$el });
          clearTimeout(this.tipTimer);
          this.tipTimer = setTimeout(() => {
            this.$emit('dispatchEvent', { type: 'closeTip' });
          }, 10000);
        }
        if (this.msg.replyMsg && this.msg.replyMsg.content && !this.msg.isHistoryMsg) {
          this.$emit('dispatchEvent', { type: 'replyMsg', el: this.$el, msg: this.msg.replyMsg });
          clearTimeout(this.tipTimer);
          this.tipTimer = setTimeout(() => {
            this.$emit('dispatchEvent', { type: 'closeTip' });
          }, 10000);
        }
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
            width: 60px;
            height: 60px;
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
            width: 60px;
            height: 60px;
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
          margin: 20px 46px 0;
          line-height: 20px;
          padding: 5px 16px;
          background-color: #222222;
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
            background-color: rgba(53, 98, 250, 0.2);
            color: #3562fa;
          }
          &.guest {
            background-color: rgba(53, 98, 250, 0.2);
            color: #3562fa;
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
          margin-top: 20px;
          line-height: 20px;
          padding: 5px 16px;
          background-color: #222222;
          border-radius: 15px;
          color: @font-dark-normal;
          font-size: 14px;
          text-align: center;
          > span {
            float: left;
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
  }
</style>
