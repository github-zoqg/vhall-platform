<template>
  <div class="vmp-watch-private-chat-msg-template">
    <!--头像-->
    <div class="msg-item__avatar">
      <img class="msg-item__avatar__img" :src="source.avatar || defaultAvatar" alt />
    </div>
    <!--内容-->
    <div class="msg-item__content">
      <!-- 昵称和角色 -->
      <div class="msg-item__content__name">
        <div class="msg-item__content__info-wrap">
          <span class="msg-item__content__nick-name">{{ source.nickname }}</span>
          <span
            class="msg-item__content__role-name"
            :class="source.roleName | roleClassFilter"
            v-if="source.roleName && source.roleName != 2"
          >
            {{ source.roleName | roleFilter }}
          </span>
        </div>

        <span class="msg-item__content__time">
          {{ source.sendTime && source.sendTime.slice(-8) }}
        </span>
      </div>
      <!-- 文本 -->
      <p
        v-if="source.content.text_content"
        class="msg-item__content__content-text"
        v-html="messageContent"
      ></p>
    </div>
  </div>
</template>

<script>
  import defaultAvatar from '@/packages/chat/src/common/img/my-dark@2x.png';
  export default {
    name: 'VmpWatchPrivateChatMsgTemplate',
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
    props: {
      //消息信息
      source: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data() {
      return {
        //默认兜底头像
        defaultAvatar,
        //消息内容
        messageContent: ''
      };
    },
    mounted() {
      this.handleMessageContent();
    },
    methods: {
      //处理消息内容
      handleMessageContent() {
        if (this.source.content) {
          this.messageContent = this.urlToLink(this.source.content.text_content);
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
          // eslint-disable-next-line no-useless-escape
          /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/g;

        // 将聊天内容中除去 img 标签以外的聊天内容中的链接用 a 标签包裹
        strArr.forEach((item, index) => {
          const tempStr = item.replace(regUrl, function (match) {
            return `<a class='msg-item__content__content-link' href='${match}' target='_blank'>${match}</a>`;
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
  .vmp-watch-private-chat-msg-template {
    display: flex;
    padding: 20px 24px 0;
    .msg-item__avatar {
      display: flex;
      align-items: center;
      width: 28px;
      height: 28px;
      border-radius: 14px;
      overflow: hidden;
      &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .msg-item__content {
      flex: 1;
      padding-left: 10px;
      word-break: break-all;
      &__name {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      &__info-wrap {
        display: flex;
      }
      &__nick-name {
        max-width: 126px;
        font-size: 14px;
        color: var(--theme-tab-content-private-name-font);
        line-height: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &__role-name {
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
      &__time {
        align-self: self-end;
        font-size: 14px;
        color: var(--theme-tab-content-private-time-font);
      }
      &__content-text {
        margin-top: 4px;
        font-size: 14px;
        color: var(--theme-tab-content-private-content-font);
      }
      &__content-link {
        color: #3562fa;
        text-decoration: underline #3562fa;
      }
    }
  }
</style>
