<template>
  <div class="vmp-live-private-chat-list" :id="id">
    <div v-if="topLoading" class="private-chat__top-loading">加载中...</div>
    <ul class="private-chat__list-wrap" v-if="finishData && chatList.length">
      <li
        class="private-chat__list-item"
        :class="{
          'self-item':
            loginInfo.user_id == chat.user_id || loginInfo.third_party_user_id == chat.user_id
        }"
        v-for="(chat, idx) in chatList"
        :key="idx"
      >
        <div class="list-item__user-info">
          <template
            v-if="
              loginInfo.user_id == chat.user_id || loginInfo.third_party_user_id == chat.user_id
            "
          >
            <span class="list-item__user-info__user-name">{{ chat.name }}</span>
            <span class="user-status user-host" v-if="chat.role === 'host'">主持人</span>
            <span class="user-status user-assistant" v-else-if="chat.role === 'assistant'">
              助理
            </span>
            <span class="user-status user-admin" v-else-if="chat.role === 'admin'">管理员</span>
            <template v-if="chat.avatar">
              <span
                class="list-item__user-info__avatar"
                :style="{
                  backgroundImage: `url(${chat.avatar}?x-oss-process=image/resize,m_lfit,w_50)`
                }"
              ></span>
            </template>
            <template v-else>
              <span class="list-item__user-info__avatar">
                {{ chat.name ? chat.name.substr(0, 1) : '' }}
              </span>
            </template>
          </template>
          <template v-else>
            <template v-if="chat.avatar">
              <span
                class="list-item__user-info__avatar"
                :style="{
                  backgroundImage: `url(${chat.avatar}?x-oss-process=image/resize,m_lfit,w_50)`
                }"
              ></span>
            </template>
            <template v-else>
              <span class="list-item__user-info__avatar">
                {{ chat.name ? chat.name.substr(0, 1) : '' }}
              </span>
            </template>
            <span class="user-status user-host" v-if="chat.role === 'host'">主持人</span>
            <span class="user-status user-assistant" v-else-if="chat.role === 'assistant'">
              助理
            </span>
            <span class="user-status user-admin" v-else-if="chat.role === 'admin'">管理员</span>
            <span class="list-item__user-info__user-name">{{ chat.name }}</span>
          </template>
        </div>
        <div class="list-item__chat-txt" v-if="chat.txt" v-html="chat.txt"></div>
        <div class="list-item__chat-img-list" v-if="chat.msgType === 'imgChat'">
          <div
            class="chat-img-item"
            v-for="(imgUrl, imgIdx) in chat.img_list"
            :key="imgIdx"
            :style="{
              backgroundImage: `url(${imgUrl}?x-oss-process=image/resize,m_lfit,w_100${
                isWebp ? '/format,webp' : ''
              })`
            }"
            @click="showImgBrowser(imgIdx, chat.img_list)"
          ></div>
        </div>
        <span class="list-item__chat-time">{{ chat.time | chatTime }}</span>
      </li>
    </ul>
    <dl class="private-chat__empty" v-else-if="finishData">
      <dt></dt>
      <dd>暂时没有聊天哦～</dd>
    </dl>
  </div>
</template>

<script>
  import { faceArr as emojiFace } from '@/packages/chat/src/js/emoji';
  import { uniqueId } from 'lodash';
  export default {
    name: 'livePrivateChatList',
    filters: {
      //todo 考虑全局公共utils里处理这个
      chatTime(value) {
        if (['', null, void 0].includes(value)) {
          return;
        }
        if (value < 15) return value;
        return value.substring(0, 16);
      }
    },
    data() {
      return {
        //是否是webp
        isWebp: window.webp,
        //取一个唯一id
        id: uniqueId('`chat_'),
        finishData: false,
        topLoading: false,
        scrollEnd: false,
        //聊天列表
        chatList: [],
        page_size: 50,
        page: 1,
        count: 0
      };
    },
    props: {
      //活动id
      activityId: {
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
      }
    },
    mounted() {
      this.initEvent();
      this.initScroll();
    },
    methods: {
      initEvent() {
        //todo domain代替EventBus完成监听新的私聊消息
        // EventBus.$on('new_chat', msg => {
        //   this.finishData = true;
        //   this.listenChat(msg, 'push');
        // });
        this.queryChatList();
        this.finishData = true;
      },
      //todo 待替换
      initScroll() {
        let preTop = 0;
        this.$chatDom = document.getElementById(this.id);
        this.$chatDom.onscroll = e => {
          if (this.scrollEnd) {
            return;
          }
          let top = e.target.scrollTop;
          if (top < preTop && top < 100) {
            // 向上滚动到50px处
            this.nextPageChatList();
          }
          preTop = top;
        };
      },
      //todo 移入domain
      listenChat(msg, type) {
        let findResult = false;
        /* 倒序环更高效 */
        const msg_id = msg.msgId || msg.msg_id;
        for (let i = this.chatList.length - 1; i >= 0; i--) {
          if (this.chatList[i].msg_id === msg_id) {
            findResult = true;
            break;
          }
        }
        if (findResult) {
          // 重复
          return;
        }
        let obj = this.formatChatMsg(msg);
        let chatList = JSON.parse(JSON.stringify(this.chatList));
        if (chatList.length >= 100) {
          chatList = chatList.splice(-100);
        } else {
          if (type === 'push') {
            // 实时消息
            chatList.push(obj);
          } else {
            // 历史聊天
            if (this.page === 1) {
              chatList.push(obj);
            } else {
              chatList.unshift(obj);
            }
          }
        }
        this.chatList = chatList;
        this.scrollBottom();
      },
      initChat(group_channel_id) {
        this.group_channel_id = group_channel_id;
        this.chatList = [];
        this.queryChatList();
      },
      nextPageChatList() {
        if (this.topLoading) return;
        this.topLoading = true;
        this.page++;
        this.queryChatList();
      },
      //todo 移入domain
      queryChatList() {
        if (this.page === 1) {
          this.finishData = false;
        }
        //todo domain负责拉去历史消息
        const params = {
          activity_id: this.activityId,
          group_channel_id: this.group_channel_id,
          page: this.page,
          page_size: this.page_size
        };
        return Promise.resolve({
          code: 200,
          msg: null,
          data: {
            total: 2,
            page_num: 1,
            list: [
              {
                filter_desp: null,
                terminal: 'pc_browser',
                audit_status: 1,
                limit_status: 0,
                filter_status: 0,
                view_status: 1,
                msg_data:
                  '{"type":"imgChat","text_content":"","img_list":["https://test-zhike.oss-cn-beijing.aliyuncs.com/mp-test/64/4e/644e34cbfbaeda386a9f3e67a6d4364c.jpeg"]}',
                send_id: 'v1478672653019328512',
                send_time: '2022-01-17 15:37:14',
                deleted: 0,
                child_channel: 'child_tziQLU34',
                context:
                  '{"role":"host","consumer_user_id":"v1478672653019328512","nick_name":"主持人","avatar":"","UUID":"MC45NzAyMzMyMTgyMDcwODQ3"}',
                msg_id: '08a0ce566a084e54ab3e11390c4065ea',
                channel_id: 'ch_2tf76kFf',
                target_id: 'ch_2tf76kFf'
              },
              {
                filter_desp: null,
                terminal: 'pc_browser',
                audit_status: 1,
                limit_status: 0,
                filter_status: 0,
                view_status: 1,
                msg_data: '{"type":"text","text_content":"111"}',
                send_id: 'v1478672653019328512',
                send_time: '2022-01-17 14:22:48',
                deleted: 0,
                child_channel: 'child_tziQLU34',
                context:
                  '{"role":"host","consumer_user_id":"v1478672653019328512","nick_name":"主持人","avatar":"","UUID":"MC40MDE0MjAwNDkxNDMzMQ=="}',
                msg_id: '1e44f1bc4f874e7a8993d51f6df19d12',
                channel_id: 'ch_2tf76kFf',
                target_id: 'ch_2tf76kFf'
              }
            ],
            page_all: 1
          }
        }).then(res => {
          this.historyChat(res.data);
          this.finishData = true;
        });
      },
      //todo 移入domain
      historyChat(data) {
        this.scrollEnd = data.list.length != this.page_size;
        if (this.page > 1) {
          data.list.forEach(chat => {
            this.reChatHistory(chat);
          });
          this.$nextTick(() => {
            this.computeScrollPosition(data.list.length);
          });
        } else {
          data.list.reverse().forEach(chat => {
            this.reChatHistory(chat);
          });
          let st = setTimeout(() => {
            clearTimeout(st);
            this.scrollBottom();
          }, 100);
        }
        this.topLoading = false;
      },
      //todo 移入domain
      reChatHistory(chat) {
        this.listenChat(chat);
      },
      //todo 移入domain
      formatChatMsg(msg) {
        msg.data = msg.data || msg.msg_data;
        if (msg.context && typeof msg.context === 'string') {
          msg.context = JSON.parse(msg.context);
        }
        if (typeof msg.data === 'string') {
          msg.data = JSON.parse(msg.data);
        }
        let obj = {
          msg_id: msg.msgId || msg.msg_id,
          user_id: msg.context.consumer_user_id,
          role: msg.context.role,
          name: msg.context.nick_name,
          avatar: msg.context.avatar,
          txt: msg.data.text_content,
          time: msg.send_time || new Date(msg.time).format('yyyy-MM-dd hh:mm:ss')
        };
        if (msg.data.type === 'imgChat') {
          obj.msgType = 'imgChat';
          obj.img_list = msg.data.img_list;
        } else {
          obj.msgType = 'chat';
        }
        obj.avatar = msg.context.avatar || msg.avatar;
        if (obj.avatar && obj.avatar.indexOf('//') !== 0 && obj.avatar.indexOf('https') !== 0) {
          obj.avatar = obj.avatar ? `${this.$imgHost}/${obj.avatar}` : '';
        }
        if (obj.txt) {
          obj.txt = obj.txt.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          if (obj.role !== 'watch') {
            /* 正则匹配校验url */
            /* eslint-disable */
          let reg = /(https:\/\/|http:\/\/|\/\/|www\.)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
          obj.txt = obj.txt.replace(reg, (url) => {
            let href = url
            if (url.indexOf('www.') === 0) {
              href = `//${url}`
            }
            return `<a class='a_link' href="${href}" title="点击打开链接" target='_blank'>${url}</a>`
          })
          /* eslint-enable */
          }
        }
        /* 替换表情图片 */
        for (let i = 0; i < emojiFace.length; i++) {
          for (let key in emojiFace[i]) {
            let test = key.replace(/\[/, '\\[').replace(/\]/, '\\]');
            let reg = new RegExp(test, 'g');
            obj.txt = obj.txt.replace(
              reg,
              "<img src='//cnstatic01.e.vhall.com/static/img/arclist/Expression_" +
                emojiFace[i][key] +
                "@2x.png'>"
            );
          }
        }
        return obj;
      },
      // 根据新消息数量计算滚动定位位置
      computeScrollPosition(count) {
        let newChatEles = this.$chatDom.querySelectorAll('.chat-list-item');
        let firstEle = newChatEles[0];
        let lashEle = newChatEles[count - 1];
        const offsetH = 100;
        if (firstEle && lashEle) {
          this.$chatDom.scrollTop = lashEle.offsetTop - firstEle.offsetTop + offsetH;
        }
      },
      //滚动到底部
      scrollBottom() {
        this.$nextTick(() => {
          this.$chatDom.scrollTop = 100000;
        });
      },
      //查看图片预览
      showImgBrowser(idx, imgList) {
        this.$emit('showImg', idx, imgList);
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
            background-color: @color-default;
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
          display: block;
          margin-left: 30px;
          color: #aaa;
          font-size: 12px;
        }
        .list-item__user-info {
          line-height: 24px;
          .user-status {
            display: inline-block;
            width: 44px;
            height: 16px;
            margin-left: 5px;
            line-height: 16px;
            border-radius: 10px;
            text-align: center;
            vertical-align: middle;
            font-size: 12px;
          }
          .user-host {
            background-color: #ffd021;
          }
          .user-assistant {
            background-color: #e2e2e2;
          }
          .user-admin {
            background-color: @color-role-admin;
            color: #fff;
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
        background: url(../images/no-data.png) no-repeat center;
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
  }
</style>
