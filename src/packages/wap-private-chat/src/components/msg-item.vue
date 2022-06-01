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
          width="35"
          height="35"
          :src="source.avatar || defaultAvatar"
          alt
        />
      </div>
      <div class="private-chat-msg__item-main__msg-content">
        <div class="msg-content_name">
          <p>
            <span
              v-if="source.roleName && source.roleName != '2'"
              class="role"
              :class="source.roleName | roleClassFilter"
            >
              {{ source.roleName | roleFilter }}
            </span>
            <span class="nickname">{{ source.nickname | overHidden(8) }}</span>
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
  import defaultAvatar from '@/packages/app-shared/assets/img/default_avatar.png';
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
      margin: 0 30px;
      padding: 10px 0;
      display: flex;
      align-items: flex-start;
      &__avatar-wrap {
        position: relative;
        margin-right: 10px;
      }
      &__chat-avatar {
        border-radius: 50%;
        display: block;
        border: 2px solid #e3e3e3;
      }

      &__msg-content {
        flex: 1;
        .msg-content_name {
          display: flex;
          padding-left: 10px;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
          .nickname {
            font-size: 22px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            word-break: break-all;
            color: #666;
            max-width: 300px;
            height: 26px;
            line-height: 26px;
          }
          .role {
            margin-right: 10px;
            padding: 3px 10px;
            line-height: 28px;
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
          .send_time {
            font-size: 24px;
            font-weight: 400;
            color: #8c8c8c;
          }
        }
        .msg-content_body {
          display: inline-block;
          margin-top: 5px;
          padding: 18px 20px;
          color: #444;
          line-height: 36px;
          background-color: #f7f7f7;
          width: fit-content;
          max-width: 100%;
          text-align: justify;
          word-break: break-word;
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
