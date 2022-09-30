<template>
  <div
    class="vmp-wap-private-chat-msg-item"
    style="pointer-events: auto"
    :class="{ 'is-self-msg': source.sendId == userId }"
  >
    <div v-if="source.showTime" class="private-chat-msg__showtime">{{ source.showTime }}</div>
    <div class="private-chat-msg__item-main">
      <div class="private-chat-msg__item-main__avatar-wrap">
        <img
          class="private-chat-msg__item-main__chat-avatar"
          :src="source.avatar || defaultAvatar"
          alt
        />
      </div>
      <div class="private-chat-msg__item-main__msg-content">
        <div class="msg-content_name">
          <p>
            <span class="nickname">{{ source.nickname | overHidden(8) }}</span>
            <span
              v-if="source.roleName && source.roleName != '2'"
              class="role"
              :class="source.roleName | roleClassFilter"
            >
              {{ source.roleName | roleFilter }}
            </span>
          </p>
          <span class="send_time">{{ source.sendTime.slice(-8) }}</span>
        </div>
        <!-- 图文消息 -->
        <p v-if="msgContent" class="msg-content_body" v-html="msgContent"></p>
        <p v-if="source.content.image_urls" class="msg-content_chat-img-wrapper">
          <img
            @tap="$emit('preview', img)"
            class="msg-content_chat-img"
            width="50"
            height="50"
            v-for="(img, index) in source.content.image_urls"
            :key="index"
            :src="img + '?x-oss-process=image/resize,m_lfit,h_150,w_150'"
            :alt="$t('chat.chat_1065')"
          />
        </p>
      </div>
    </div>
  </div>
</template>
<script>
  import defaultAvatar from '@/app-shared/assets/img/default_avatar.png';
  export default {
    name: 'VmpWapPrivateChatMsgItem',
    props: {
      source: {
        required: true,
        default: () => ({})
      },
      userId: {
        required: true
      }
    },
    data() {
      return {
        defaultAvatar: defaultAvatar,
        msgContent: ''
      };
    },
    computed: {
      customRoleName() {
        return this.$domainStore.state.roomBaseServer.customRoleName;
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
      }
    },
    mounted() {
      this.handleMsg(this.source.content.text_content);
    },
    methods: {
      handleMsg(msg) {
        this.msgContent = this.urlToLink(msg);
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
  .vmp-wap-private-chat-msg-item {
    pointer-events: auto;
    .private-chat-msg__showtime {
      padding: 15px 0 5px;
      font-size: 24px;
      color: #888;
      text-align: center;
    }
    .private-chat-msg__item-main {
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
            color: var(--theme-tab-content-private-name-font);
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
            color: var(--theme-tab-content-private-time-font);
            line-height: 34px;
          }
        }
        .msg-content_body {
          display: inline-block;
          padding: 10px 12px;
          color: var(--theme-tab-content-private-content-font);
          background: var(--theme-tab-content-private-content-bg);
          border-radius: 0px 32px 32px 32px;
          width: fit-content;
          max-width: 100%;
          text-align: justify;
          word-break: break-word;
          font-size: 28px;
          line-height: 39px;
          span {
            word-break: break-word;
          }
          img {
            width: 34px;
            height: 34px;
            vertical-align: middle !important;
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
    }
    &.is-self-msg {
      .private-chat-msg__item-main {
        flex-direction: row-reverse;
        &__avatar-wrap {
          margin-right: 0;
          margin-left: 10px;
        }
        &__msg-content {
          .msg-content_name {
            flex-direction: row-reverse;
          }
          .msg-content_body {
            float: right;
            border-radius: 32px 0px 32px 32px;
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
