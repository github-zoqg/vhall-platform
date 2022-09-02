<template>
  <div
    class="vhsaas-chat-msg-item__wrapper"
    v-if="
      roleName != 2 ||
      source.join_id == joinId ||
      (source.answer && source.answer.join_id == joinId) ||
      !isOnlyMine
    "
  >
    <div v-if="source.answer" class="vhsaas-chat-msg-item clearfix">
      <!-- 头像 -->
      <div class="vhsaas-chat-msg-item__avatar">
        <img
          class="msg-item__avatar-img"
          :src="source.answer.avatar ? source.answer.avatar : defaultAvatar"
          alt
        />
      </div>
      <div class="vhsaas-chat-msg-item__content">
        <!-- 昵称和角色 -->
        <p class="msg-item__content-name clearfix">
          <span class="msg-item_content-name-nick">
            {{ source.answer.nick_name }}
          </span>
          <span class="msg-item_content-name-role" :class="source.answer.role_name">
            {{ source.answer.role_name | roleFilter }}
          </span>
          <span class="msg-item__content-time">{{ source.answer.created_time.slice(-8) }}</span>
        </p>
        <!-- 文本 -->
        <p
          v-if="source.answer.content"
          class="msg-item__content-body__content"
          v-html="answerContent"
        ></p>
        <div class="msg-item__content-hr"></div>
        <div class="vhsaas-msg-item__qa-content clearfix">
          <!-- 头像 -->
          <div class="vhsaas-chat-msg-item__avatar">
            <img class="msg-item__avatar-img" :src="source.avatar || defaultAvatar" alt />
          </div>
          <div class="vhsaas-chat-msg-item__content reply">
            <!-- 昵称和角色 -->
            <p class="msg-item__content-name clearfix">
              <span class="msg-item_content-name-nick">{{ source.nick_name }}</span>
              <!-- <span class="msg-item_content-name-role" :class="source.answer.role_name">
                {{ source.role_name | roleFilter(this) }}
              </span> -->
            </p>
            <!-- 文本 -->
            <p
              v-if="source.answer.content"
              class="msg-item__content-body__content"
              v-html="msgContent"
            ></p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="vhsaas-chat-msg-item clearfix">
      <!-- 头像 -->
      <div class="vhsaas-chat-msg-item__avatar">
        <img class="msg-item__avatar-img" :src="source.avatar || defaultAvatar" alt />
      </div>
      <div class="vhsaas-chat-msg-item__content">
        <!-- 昵称和角色 -->
        <p class="msg-item__content-name clearfix">
          <span class="msg-item_content-name-nick">{{ source.nick_name }}</span>
          <!-- <span
            class="msg-item_content-name-role"
            :class="msg.role_name"
          >{{ roleMap[msg.role_name] }}</span> -->
          <span class="msg-item__content-time">{{ source.created_time.slice(-8) }}</span>
        </p>
        <!-- 文本 -->
        <p v-if="source.content" class="msg-item__content-body__content" v-html="mineContent"></p>
      </div>
    </div>
  </div>
</template>

<script>
  import defaultAvatar from '@/app-shared/assets/img/default_avatar.png';
  export default {
    props: {
      source: {
        type: Object,
        required: true,
        default: () => {}
      },
      isOnlyMine: {
        default: false
      },
      joinId: {},
      roleName: {
        require: true
      }
    },
    data() {
      return {
        msgContent: '',
        answerContent: '',
        mineContent: '',
        defaultAvatar
      };
    },
    computed: {
      customRoleName() {
        return this.$domainStore.state.roomBaseServer.customRoleName;
      }
    },
    mounted() {
      this.handleAnswerContent();
      this.handleMsgContent();
    },
    methods: {
      handleMsgContent() {
        if (this.source.content) {
          this.msgContent = `<span class="msg-item__qa-flag">${this.$t(
            'chat.chat_1040'
          )}&nbsp;</span> ${this.urlToLink(this.source.content)}`;
          this.mineContent = this.urlToLink(this.source.content);
        }
      },
      handleAnswerContent() {
        if (this.source.answer && this.source.answer.content) {
          if (this.source.answer.content == '直播中回复') {
            this.answerContent = `<span class="msg-item__qa-flag color-e6e">${this.$t(
              'chat.chat_1039'
            )}</span>`;
          } else if (this.source.answer.is_open == 0) {
            this.answerContent = `<span class="msg-item__qa-flag">${this.$t(
              'chat.chat_1077'
            )}&nbsp;</span>${this.urlToLink(this.source.answer.content)}`;
          } else {
            this.answerContent = `<span class="msg-item__qa-flag">${this.$t(
              'chat.chat_1041'
            )}&nbsp;</span>${this.urlToLink(this.source.answer.content)}`;
          }
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

<style lang="less" scoped>
  .vhsaas-chat-msg-item {
    padding: 20px 24px 0;
    display: flex;
  }
  .vhsaas-chat-msg-item__avatar {
    width: 28px;
    height: 28px;
    border-radius: 14px;
    overflow: hidden;
    .msg-item__avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .vhsaas-chat-msg-item__content {
    flex: 1;
    padding-left: 10px;
    word-break: break-all;
    &.reply .msg-item__content-body__content {
      color: var(--theme-tab-content-qa-text-font);
    }
  }
  .msg-item_content-name-nick {
    float: left;
    max-width: 126px;
    font-size: 14px;
    color: var(--theme-tab-content-qa-text-font);
    line-height: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .msg-item_content-name-role {
    float: left;
    padding: 0 4px;
    margin-left: 8px;
    font-size: 12px;
    line-height: 16px;
    background-color: rgba(251, 58, 50, 0.2);
    border-radius: 9px;
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
  .msg-item__content-time {
    float: right;
    font-size: 14px;
    color: var(--theme-tab-content-qa-text-font);
    line-height: 16px;
  }
  .msg-item__content-body__content-wrapper {
    margin-top: 8px;
    background: #222222;
    border-radius: 4px;
    padding: 6px;
  }
  .msg-item__content-body__content {
    margin-top: 4px;
    font-size: 14px;
    color: var(--theme-tab-content-qa-replyText-font);
    line-height: 20px;
    word-break: break-all;
    &.reply-msg {
      margin-top: 0;
    }
    &::v-deep .reply-msg__nick-name {
      color: @font-dark-low;
    }
    &::v-deep .reply-msg__label {
      color: #fc9600;
    }
    ::v-deep .msg-item__qa-flag {
      color: #fc9600;
      &.color-e6e {
        color: #e6e6e6;
      }
    }
  }
  .msg-item__content-hr {
    width: 100%;
    height: 8px;
    float: left;
    clear: left;
  }
  ::v-deep .msg-item__content-body__content-link {
    color: @font-link;
    text-decoration: underline @font-link;
  }
  .vhsaas-msg-item__qa-content {
    display: flex;
    background: var(--theme-tab-content-qa-replyText-bg);
    border-radius: 4px;
    padding: 6px;
    clear: left;
  }
</style>
