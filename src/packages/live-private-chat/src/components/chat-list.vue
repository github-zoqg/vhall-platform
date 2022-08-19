<template>
  <div class="vmp-live-private-chat-list" :id="id">
    <div v-if="topLoading" class="private-chat__top-loading">加载中...</div>
    <ul class="private-chat__list-wrap" v-if="finishData && chatList.length">
      <li
        class="private-chat__list-item"
        :class="{
          'list-item__self-item':
            loginInfo.user_id == chat.sendId || loginInfo.third_party_user_id == chat.sendId
        }"
        v-for="(chat, idx) in chatList"
        :key="idx"
      >
        <div class="list-item__user-info">
          <template
            v-if="loginInfo.user_id == chat.sendId || loginInfo.third_party_user_id == chat.sendId"
          >
            <span class="list-item__user-info__user-name">{{ chat.nickname }}</span>
            <span class="user-status user-host" v-if="[1, '1'].includes(chat.roleName)">
              {{ chat.roleName | roleFilter }}
            </span>
            <span class="user-status user-assistant" v-else-if="[3, '3'].includes(chat.roleName)">
              {{ chat.roleName | roleFilter }}
            </span>
            <span class="user-status user-admin" v-else-if="[4, '4'].includes(chat.roleName)">
              {{ chat.roleName | roleFilter }}
            </span>
            <span
              class="list-item__user-info__avatar"
              :style="{
                backgroundImage: !chat.avatar
                  ? `url(${defaultAvatar})`
                  : `url(${chat.avatar}?x-oss-process=image/resize,m_lfit,w_50)`
              }"
            ></span>
          </template>
          <template v-else>
            <span
              class="list-item__user-info__avatar"
              :style="{
                backgroundImage: !chat.avatar
                  ? `url(${defaultAvatar})`
                  : `url(${chat.avatar}?x-oss-process=image/resize,m_lfit,w_50)`
              }"
            ></span>
            <span class="user-status user-host" v-if="[1, '1'].includes(chat.roleName)">
              {{ $t('chat.chat_1022') }}
            </span>
            <span class="user-status user-assistant" v-else-if="[3, '3'].includes(chat.roleName)">
              {{ $t('chat.chat_1024') }}
            </span>
            <span class="user-status user-admin" v-else-if="[4, '4'].includes(chat.roleName)">
              {{ $t('chat.chat_1023') }}
            </span>
            <span class="list-item__user-info__user-name">{{ chat.nickname }}</span>
          </template>
        </div>
        <div
          class="list-item__chat-txt"
          v-if="chat.content && chat.content.text_content"
          v-html="urlToLink(chat.content.text_content)"
        ></div>
        <div class="list-item__chat-img-list" v-if="chat.type === 'image'">
          <div
            class="chat-img-item"
            v-for="(imgUrl, imgIdx) in chat.content.img_list"
            :key="imgIdx"
            :style="{
              backgroundImage: `url(${imgUrl}?x-oss-process=image/resize,m_lfit,w_100${
                isWebp ? '/format,webp' : ''
              })`
            }"
            @click="showImgBrowser(imgIdx, chat.content.img_list)"
          ></div>
        </div>
        <p class="list-item__chat-time">
          {{ chat.sendTime | chatTime }}
        </p>
      </li>
    </ul>
    <dl class="private-chat__empty" v-else-if="finishData">
      <dt></dt>
      <dd>暂时没有聊天哦～</dd>
    </dl>
  </div>
</template>

<script>
  import { uniqueId } from 'lodash';
  import { useChatServer, useMsgServer } from 'middle-domain';
  import defaultAvatar from '@/app-shared/utils/avatar';

  export default {
    name: 'livePrivateChatList',
    data() {
      return {
        //默认头像
        defaultAvatar: defaultAvatar,
        //是否是webp
        isWebp: window.webp,
        //取一个唯一id
        id: uniqueId('`chat_'),
        finishData: false,
        topLoading: false,
        scrollEnd: false,
        //聊天列表
        chatList: useChatServer().state.privateChatList,
        page_size: 100,
        page: 0,
        count: 0
      };
    },
    props: {
      //活动id
      webinarId: {
        type: [Number, String],
        default: ''
      },
      //当前的登录信息
      loginInfo: {
        type: Object,
        default: () => {
          return {};
        }
      },
      //角色
      role: {
        type: [Number, String],
        default: ''
      },
      //房间号
      roomId: {
        type: [Number, String],
        default: ''
      },
      //聊天的人的id
      selectUserId: {
        type: [Number, String],
        default: ''
      }
    },
    watch: {
      selectUserId: {
        handler(newVal) {
          if (newVal) {
            this.chatServer.setCurPrivateTarget && this.chatServer.setCurPrivateTarget(newVal);
          }
        },
        immediate: true
      }
    },
    beforeCreate() {
      this.chatServer = useChatServer();
      this.msgServer = useMsgServer();
    },
    mounted() {
      this.listenEvent();
      this.initScroll();
    },
    methods: {
      listenEvent() {
        this.chatServer.$on('receivePrivateMsg', msg => {
          if (msg.sendId == this.selectUserId) this.scrollBottom();
        });
      },
      init() {
        this.resetData();
        this.initEvent();
        this.initScroll();
      },
      resetData() {
        useChatServer().clearPrivateChatMsg();
        this.finishData = true;
        this.topLoading = false;
        this.scrollEnd = false;
        this.page_size = 100;
        this.page = 0;
        this.count = 0;
      },
      initEvent() {
        this.queryChatList();
        this.finishData = true;
      },
      //初始化滚动条
      initScroll() {
        let preTop = 0;
        this.$chatDom = document.getElementById(this.id);
        this.$chatDom.onscroll = e => {
          if (this.scrollEnd) {
            return;
          }
          preTop = e.target.scrollTop;
        };
      },
      nextPageChatList() {
        if (this.topLoading) return;
        this.topLoading = true;
        this.page++;
        this.queryChatList();
      },
      //获取当前用户聊天列表
      queryChatList() {
        if (this.page === 1) {
          this.finishData = false;
        }
        const params = {
          room_id: this.roomId,
          webinar_id: this.webinarId,
          start_time: '',
          pos: this.page,
          limit: this.page_size,
          to_user: this.selectUserId
        };
        return this.chatServer.getPrivateChatHistoryList(params).then(() => {
          this.scrollBottom();
        });
      },
      // 根据新消息数量计算滚动定位位置
      computeScrollPosition(count) {
        let newChatItems = this.$chatDom.querySelectorAll('.chat-list-item');
        let firstEle = newChatItems[0];
        let lashEle = newChatItems[count - 1];
        const offsetH = 100;
        if (firstEle && lashEle) {
          this.$chatDom.scrollTop = lashEle.offsetTop - firstEle.offsetTop + offsetH;
        }
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$chatDom.scrollTop = this.$chatDom.scrollHeight;
        });
      },
      //查看图片预览
      showImgBrowser(idx, imgList) {
        this.$emit('showImg', idx, imgList);
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
  .vmp-live-private-chat-list {
    @color-default: #ffd021;
    @color-blue: #4b5afe;
    @color-blue-hover: #5d6afe;
    @color-role-admin: #15a0f9;
    position: relative;
    width: 100%;
    height: 100%;
    padding: 20px 0;
    box-sizing: border-box;
    overflow-y: auto;
    .private-chat__top-loading {
      height: 50px;
      line-height: 50px;
      margin-top: -20px;
      text-align: center;
    }
    .private-chat__list-wrap {
      font-size: 14px;
      .private-chat__list-item {
        padding-left: 10px;
        margin-bottom: 15px;
        font-family: PingFangSC-Regular, PingFang SC;
        .list-item__user-info {
          &__avatar {
            display: inline-block;
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            border-radius: 50%;
            vertical-align: middle;
            background-size: cover;
            background-position: center center;
          }
          &__user-name {
            display: inline-block;
            max-width: 126px;
            margin-left: 5px;
            color: #888;
            vertical-align: middle;
            font-size: 14px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
        .list-item__chat-txt /deep/ {
          display: inline-block;
          max-width: 320px;
          margin: 4px 32px 2px 32px;
          line-height: 22px;
          padding: 7px 10px;
          background-color: #f5f5f5;
          border-radius: 0 8px 8px 8px;
          text-align: justify;
          word-break: break-all;
          vertical-align: middle;
          font-size: 14px;
          color: #222;
          img {
            display: inline-block;
            width: 20px;
            height: 20px;
            vertical-align: middle;
          }
          .a_link {
            color: @color-blue;
            &:hover {
              color: @color-blue-hover;
            }
          }
        }
        .list-item__chat-img-list {
          display: block;
          height: 48px;
          margin: 4px 28px 6px 32px;
          border-radius: 4px;
          font-size: 0;
          cursor: default;
          .chat-img-item {
            display: inline-block;
            width: 48px;
            height: 48px;
            margin-right: 4px;
            border-radius: 3px;
            vertical-align: middle;
            background: #000 no-repeat center;
            background-size: contain;
            cursor: pointer;
            &:last-child {
              margin-right: 0;
            }
          }
        }
        .list-item__chat-time {
          margin-left: 30px;
          color: #aaa;
          font-size: 12px;
        }
        .list-item__user-info {
          line-height: 24px;
          .user-status {
            display: inline-block;
            padding: 0 5px;
            height: 16px;
            margin-left: 5px;
            line-height: 16px;
            border-radius: 10px;
            text-align: center;
            vertical-align: middle;
            font-size: 12px;
          }
          .user-host {
            background: rgba(251, 58, 50, 0.2);
            color: #fb3a32;
          }
          .user-assistant {
            background: #ade1ff;
            color: #0a7ff5;
          }
          .user-admin {
            background: #ade1ff;
            color: #0a7ff5;
          }
        }
        &.list-item__self-item {
          padding-right: 10px;
          text-align: right;
          .user-status {
            margin-right: 5px;
            margin-left: 0;
          }
          .user-name {
            margin-right: 5px;
          }
          .chat-txt {
            margin-top: 8px;
            margin-right: 32px;
            border-radius: 8px 0 8px 8px;
            background-color: #e3e6ff;
          }
          .chat-time {
            margin-right: 32px;
          }
        }
      }
    }
    .private-chat__empty {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      dt {
        width: 130px;
        height: 130px;
        background: url(../images/no-create.png) no-repeat center;
        border-radius: 50%;
        background-size: contain;
      }
      dd {
        color: #333;
        font-size: 14px;
        padding-top: 20px;
        padding-left: 4px;
        text-align: center;
      }
    }
    .msg-item__content-body__content-link {
      color: #3562fa;
      text-decoration: underline #3562fa !important;
    }
  }
</style>
