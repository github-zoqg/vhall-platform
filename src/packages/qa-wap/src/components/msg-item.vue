<template>
  <div
    :class="['qa-item-wrapper', { 'qa-last-ios-progress': index == length - 1 }]"
    v-if="
      source.join_id == joinId || (source.answer && source.answer.join_id == joinId) || !isOnlyMine
    "
  >
    <div class="qa-msg__item-main">
      <div class="qa-msg__item-main__avatar-wrap">
        <!-- 发消息的人的头像 -->
        <img
          class="qa-msg__item-main__chat-avatar"
          :src="source.answer ? answerAvatar : questionAvatar"
          alt
        />
      </div>
      <div class="qa-msg__item-main__msg-content">
        <div class="msg-content_name">
          <p>
            <!-- 消息发出人的昵称 -->
            <span class="nickname">
              {{ source.answer ? source.answer.nick_name : questionNickname | overHidden(8) }}
            </span>
            <!-- 只有回复问题的人才会显示role -->
            <span v-if="source.answer" class="role" :class="source.answer.role_name">
              {{ source.answer.role_name | roleFilter }}
            </span>
          </p>
          <span class="send_time">{{ source.created_time.slice(-8) }}</span>
        </div>
        <!-- 气泡内容 -->
        <section class="msg-content_body">
          <!-- 消息发出人的消息内容 -->
          <div class="msg-content_body-top">
            <span v-if="source.answer" class="msg-content_body-tip">
              {{ $t('chat.chat_1041') }}
            </span>
            <p
              class="msg-content_body-top_msg"
              v-html="source.answer ? urlToLink(source.answer.content) : urlToLink(source.content)"
            ></p>
          </div>
          <!-- 被回答的消息的内容 -->
          <div v-if="source.answer" class="msg-content_body-bottom">
            <div class="msg-content_body-bottom-box">
              <span class="msg-content_body-tip">{{ $t('chat.chat_1040') }}</span>
              <p class="msg-content_body-bottom_msg" v-html="urlToLink(source.content)"></p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      index: {
        // 每一行的唯一索引
        type: Number
      },
      source: {
        type: Object,
        required: true,
        default: () => {}
      },
      isOnlyMine: {
        default: false
      },
      joinId: {},
      length: {}
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
      }
    },
    computed: {
      customRoleName() {
        return this.$domainStore.state.roomBaseServer.customRoleName;
      },
      answerAvatar() {
        return this.source.answer.avatar !== '0'
          ? this.source.answer.avatar || require(`../img/question.png`)
          : require(`../img/question.png`);
      },
      questionAvatar() {
        return this.source.avatar !== '0'
          ? this.source.avatar || require(`../img/question.png`)
          : require(`../img/question.png`);
      },
      questionNickname() {
        return this.source.data ? this.source.data.nick_name : this.source.nick_name;
      }
    },
    methods: {
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
  .qa-item-wrapper {
    .qa-msg__item-main {
      margin: 0 24px;
      padding: 24px 0 8px;
      display: flex;
      align-items: flex-start;
      &__avatar-wrap {
        position: relative;
        margin-right: 9px;
        width: 56px;
        height: 56px;
      }
      &__chat-avatar {
        border-radius: 50%;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: scale-down;
      }

      &__msg-content {
        flex: 1;
        .msg-content_name {
          display: flex;
          padding-left: 3px;
          // align-items: center;
          justify-content: space-between;
          margin-bottom: 3px;
          .nickname {
            float: left;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            word-break: break-all;
            color: var(--theme-tab-content-qa-name-font);
            max-width: 300px;
            height: 28px;
            font-size: 28px;
            line-height: 28px;
          }
          .role {
            float: left;
            margin-left: 12px;
            padding: 4px 8px;
            font-size: 20px;
            line-height: 22px;
            border-radius: 50px;
            &.host {
              color: #fb2626;
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
          .send_time {
            font-size: 24px;
            font-weight: 400;
            color: var(--theme-tab-content-qa-time-font);
            line-height: 34px;
          }
        }
        .msg-content_body {
          display: inline-block;
          padding: 10px 12px;
          background: var(--theme-tab-content-qa-content-bg);
          border-radius: 0px 32px 32px 32px;
          width: fit-content;
          max-width: 100%;
          font-size: 28px;
          line-height: 39px;
          word-break: break-word;
          &-top {
            color: var(--theme-tab-content-qa-content-font);
            &_msg {
              display: inline;
            }
          }
          &-bottom {
            color: var(--theme-tab-content-qa-content-font);
            margin-top: 8px;
            position: relative;
            &-box {
              padding-left: 14px;
              color: var(--theme-tab-content-qa-question-font);
            }
            &_msg {
              display: inline;
            }
            &::before {
              content: '';
              position: absolute;
              top: 0;
              bottom: 0;
              width: 6px;
              background: var(--theme-tab-content-qa-question-font);
              border-radius: 3px;
            }
          }
          &-tip {
            color: #fc9600;
            margin-right: 8px;
          }
          img {
            width: 34px;
            height: 34px;
            vertical-align: middle !important;
          }
        }
      }
    }
    &.qa-last-ios-progress {
      padding-bottom: 34px;
    }
  }
  .qa-item-wrapper {
    .msg-item__content-body__content-link {
      color: #3562fa;
      text-decoration: underline #3562fa !important;
    }
  }
</style>
