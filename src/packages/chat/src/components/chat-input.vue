<template>
  <div class="vmp-chat-input">
    <div
      :class="['vmp-chat-input__textarea-box', { 'is-watch': isWatch }]"
      v-show="!inputStatus.disable && (!chatLoginStatus || isEmbed)"
    >
      <textarea
        id="chat-textarea"
        ref="chatTextarea"
        v-model="inputValue"
        :placeholder="placeholder"
        rows="1"
        class="textarea-box__textarea"
        @input="inputHandle"
        @paste="inputHandle"
        @keydown.stop="onkeydownHandle($event)"
        @keyup.stop="onKeyUpHandle($event)"
        @keyup.delete="onDeleteHandle"
      ></textarea>
      <!--  //粘贴事件       @paste="inputHandle" -->
      <span v-show="showWordLimit" class="textarea-box__textarea-show-limit">
        <i
          class="textarea-show-limit__current-count"
          :class="{ limited: inputValue.length >= 140 }"
        >
          {{ inputValue.length }}
        </i>
        /
        <i class="textarea-show-limit__total">140</i>
      </span>
    </div>

    <div
      v-show="inputStatus.disable || chatLoginStatus"
      :class="['vmp-chat-input__textarea-placeholder', { 'is-watch': isWatch }]"
    >
      <span v-show="chatLoginStatus && !isEmbed" class="textarea-placeholder_no-login">
        <i18n path="chat.chat_1001">
          <span class="chat-login-btn" place="n" @click="callLogin">{{ $t('nav.nav_1005') }}</span>
        </i18n>
      </span>
      <span v-show="inputStatus.disable && !chatLoginStatus" class="textarea-placeholder_no-login">
        {{ inputStatus.placeholder }}
      </span>
    </div>

    <div class="vmp-chat-input__send-btn-box">
      <div
        class="vmp-chat-input__send-btn"
        :class="{ disable: inputStatus.disable }"
        :disabled="inputStatus.disable"
        @click="sendMsgThrottle"
      >
        <i class="vh-iconfont vh-line-send"></i>
      </div>
    </div>
  </div>
</template>

<script>
  import OverlayScrollbars from 'overlayscrollbars';
  import { useChatServer, useRoomBaseServer } from 'middle-domain';
  import emitter from '@/app-shared/mixins/emitter';
  export default {
    name: 'VmpChatInput',
    mixins: [emitter],
    props: {
      //输入框状态
      inputStatus: {
        type: Object,
        required: true,
        default: () => ({
          disable: false,
          placeholder: ''
        })
      },
      //是否需要登录
      chatLoginStatus: {
        type: Boolean,
        required: true
      },
      //聊天配置
      chatOptions: {
        type: Object,
        default: () => {
          return {};
        }
      },
      //聊天消息列表
      chatList: {
        type: Array,
        default: () => []
      },
      //todo 建议放入domain @列表
      atList: {
        type: Array,
        default: () => []
      }
    },
    data() {
      const roomBaseState = useRoomBaseServer().state;
      return {
        roomBaseState,
        //聊天输入框的值
        inputValue: '',
        //聊天框提示文字
        placeholder: this.$t('chat.chat_1021'),
        //字数限制
        inputMaxLength: 140,
        //显示字数限制提示
        showWordLimit: false,
        //聊天里临时选择的图片
        imgUrls: [],
        //回复消息
        replyMsg: {},
        // 聊天输入框的值，是否是从无到有。默认null表示一开始是无内容的，一但有内容了，除非当前inputValue为空，否则不处理
        isWordNull: null
      };
    },
    computed: {
      //用户昵称
      join_name() {
        return this.roomBaseState.watchInitData.join_info.nickname;
      },
      //用户角色
      roleName() {
        return this.roomBaseState.watchInitData.join_info.role_name;
      },
      //在线人数
      onlineUsers() {
        return this.roomBaseState.watchInitData.pv.show;
      },
      isEmbed() {
        // 是不是音视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(this.roomBaseState.clientType);
      }
    },
    watch: {
      //观察回复消息，自动调整输入框的值
      replyMsg() {
        if (Object.keys(this.replyMsg || {}).length == 0) {
          this.inputValue = this.trimPlaceHolder('reply');
        } else {
          const replyText = this.$t('chat.chat_1036');
          this.inputValue = this.inputValue
            ? `${replyText}${this.replyMsg.nickname}: ${this.trimPlaceHolder('reply')}`
            : `${replyText}${this.replyMsg.nickname}: `;
        }
      },
      //观察输入的值，调整输入框高度
      inputValue(newValue) {
        // 注意事项：输入了三行文字，直接Backspace 退格，重置输入框高度
        // if (!newValue) {
        // 输入框内容发生变化，更新滚动条
        this.$nextTick(() => {
          this.overlayScrollbar.update();
          this.inputHandle();
        });
        // }
      }
    },
    beforeCreate() {},
    mounted() {
      this.overlayScrollbarInit();
    },
    methods: {
      // 滚动条初始化
      overlayScrollbarInit() {
        this.$nextTick(() => {
          this.overlayScrollbar = OverlayScrollbars(document.getElementById('chat-textarea'), {
            paddingAbsolute: true,
            className: 'os-theme-light os-theme-vhall',
            scrollbars: {
              autoHide: 'leave',
              autoHideDelay: 200
            }
          });
        });
      },
      //输入框输入事件,改变高度等
      inputHandle() {
        // 最大字数限制 140
        if (this.inputValue.length > 140) {
          this.inputValue = this.inputValue.substring(0, 140);
        }
        this.$nextTick(() => {
          const chatTextareaHeight = this.$refs.chatTextarea.style.height;
          const hostTextarea = document.querySelector(
            '.vmp-chat-input__textarea-box .os-host-textarea'
          );
          const chatTextAreaHeight = parseInt(chatTextareaHeight);
          if (chatTextAreaHeight <= 60) {
            // 解决删除文本之后 textarea 高度不会自动减小的问题
            this.$refs.chatTextarea.style.minHeight = '20px';
            hostTextarea.style.minHeight = chatTextareaHeight;
          } else {
            hostTextarea.style.minHeight = '59px';
          }
          // 三行的时候显示字数限制，否则不显示
          this.showWordLimit = chatTextAreaHeight > 40;

          // 触发父元素绑定的高度发生变化事件
          setTimeout(() => {
            this.$emit('chatTextareaHeightChange');
          });
        });
      },
      //按下enter键的处理
      onkeydownHandle(event) {
        if (event.keyCode === 13) {
          this.sendMsgThrottle();
          //阻止默认行为
          event.preventDefault();
        }
      },
      //阻止输入框空格按键事件冒泡，触发播放器暂停/播放
      onKeyUpHandle(event) {
        event.stopPropagation();
      },
      //删除输入文字的处理
      onDeleteHandle() {
        if (!this.inputValue) {
          this.atList.splice(0, this.atList.length);
          return;
        }
        const currentIndex = this.$refs.chatTextarea.selectionStart;
        const firstPart = this.inputValue.substring(0, currentIndex);
        const lastIndex = firstPart.lastIndexOf('@');
        if (lastIndex !== -1) {
          const userName = this.inputValue.substring(lastIndex, currentIndex);
          const nickname = userName.replace('@', '');
          // 删除整个@过的用户名逻辑
          if (this.atList.find(u => u.nickname === nickname)) {
            let tempList = this.atList.filter(n => n.nickname !== nickname);
            this.atList.splice(0, this.atList.length, ...tempList);
            this.inputValue = this.inputValue.replace(userName, '');
          } else {
            let tempList = this.atList.filter(a => {
              const atIndex = this.inputValue.indexOf(`@${a.nickname} `);
              return atIndex !== -1;
            });
            this.atList.splice(0, this.atList.length, ...tempList);
          }
        }
        // 删除要回复的用户名逻辑
        const replyText = this.$t('chat.chat_1036');
        const lastReplyIndex = firstPart.lastIndexOf(replyText);
        if (lastReplyIndex !== -1) {
          const replyUserName = this.inputValue.substring(lastReplyIndex, currentIndex);
          if (`${replyText}${this.replyMsg.nickname}:` === replyUserName) {
            this.inputValue = this.inputValue.replace(replyUserName, '');
            this.replyMsg = {};
          } else {
            this.inputValue.indexOf(`${replyText}${this.replyMsg.nickname}: `) === -1 &&
              (this.replyMsg = {});
          }
        }
      },
      /** 发送聊天消息 */
      sendMessage(callback) {
        //是否是聊天禁言状态
        if (this.inputStatus.disable) {
          return;
        }
        //获取一下子组件里上传的图片
        this.getUploadImg();
        // 数据埋点-发送图片
        if (this.imgUrls && this.imgUrls.length) {
          window.vhallReportForProduct?.report(110124);
        }
        const inputValue = this.trimPlaceHolder('reply');
        //判断是否有输入内容，或者上传图片
        if ((!inputValue || (inputValue && !inputValue.trim())) && !this.imgUrls.length) {
          return this.$message.warning(this.$t('chat.chat_1009'));
        }
        const curmsg = useChatServer().createCurMsg();
        //将文本消息加入消息体
        curmsg.setText(inputValue);
        //将图片消息加入消息体
        curmsg.setImage(this.imgUrls);
        //将回复消息加入消息体
        curmsg.setReply(this.replyMsg);
        //将@消息加入消息体
        curmsg.setAt([].concat(this.atList));
        //发送消息
        useChatServer().sendMsg(curmsg);
        //埋点上报
        window.vhallReport?.report('CHAT', {
          event: JSON.stringify(curmsg.data),
          market_tools_id: this.roleName
        });
        //发送图片埋点上报
        if (this.imgUrls.length > 0) {
          window.vhallReportForProduct?.report(110124);
        }
        //清除发送后的消息
        useChatServer().clearCurMsg();
        //清空一下子组件里上传的图片
        this.clearImgUrls();
        this.inputValue = '';
        this.replyMsg = {};
        //todo 建议移入domain  清空一下@列表，但是保持引用
        this.atList.splice(0, this.atList.length);
        callback && callback();
        this.$nextTick(() => {
          // 输入框内容发生变化，更新滚动条
          this.overlayScrollbar.update();

          this.inputHandle();
        });
        this.dispatch('VmpChatOperateBar', 'sendEnd');
      },
      /** 发送聊天消息节流 */
      sendMsgThrottle() {
        //如果没有登录，则不能发消息
        if (this.chatLoginStatus) {
          return;
        }
        if (this.roleName !== 2) {
          this.sendMessage();
          return;
        }
        if (this.chatGap > 0) {
          this.lock = sessionStorage.getItem('chatLock');
          if (this.lock && this.lock == 'true') {
            this.$message.warning(this.$t('chat.chat_1068', this.chatGap));
          }
        } else {
          this.sendMessage(() => {
            this.chatGapInterval && window.clearInterval(this.chatGapInterval);
            this.lock = sessionStorage.getItem('chatLock');
            this.chatGap = this.delayTime(this.onlineUsers);
            this.chatGapInterval = window.setInterval(() => {
              if (this.chatGap > 0) {
                if (!this.lock || this.lock == 'false') {
                  sessionStorage.setItem('chatLock', true);
                } else {
                  this.$message.warning(this.$t('chat.chat_1080', this.chatGap));
                }
                this.chatGap = this.chatGap - 1;
              } else {
                window.clearInterval(this.chatGapInterval);
                sessionStorage.setItem('chatLock', false);
              }
            }, 1000);
          });
        }
      },
      //替换回复内容
      trimPlaceHolder() {
        return this.inputValue.replace(/^[回复].+[:]\s/, '');
      },
      //利用信令 唤起登录
      callLogin() {
        this.$emit('needLogin');
      },
      //选择了表情,这个方法是通过ref暴露给父组件使用
      emojiInput(val = '') {
        if (this.inputStatus.disable) {
          return;
        }
        const resultVal = this.inputValue + val;
        // 选择表情，判断添加后是否会超出 140 ，如果超出不能输入
        if (resultVal.length > 140) {
          return;
        }
        this.inputValue = resultVal;
      },
      //获取输入上传的图片
      getUploadImg() {
        this.$emit('getUploadImg');
      },
      //更新输入上传的图片
      updateImgUrls(images = []) {
        this.imgUrls = images;
      },
      //清空图片上传组件里上传的图片
      clearImgUrls() {
        this.imgUrls = [];
        this.$emit('clearUploadImg');
      },
      //处理回复消息
      reply(count) {
        this.inputValue = '';
        this.atList.splice(0, this.atList.length);
        this.replyMsg =
          this.chatList.find(chatMsg => {
            return chatMsg.count === count;
          }) || {};
        this.$refs.chatTextarea.focus();
      },
      //处理@某人
      atUser(count) {
        this.replyMsg = {};
        const msgToAt =
          this.chatList.find(chatMsg => {
            return chatMsg.count == count;
          }) || {};
        if (!this.atList.find(u => u.accountId == msgToAt.sendId)) {
          this.inputValue = this.trimPlaceHolder() + `@${msgToAt.nickname} `;
          this.$refs.chatTextarea.focus();
          let currentIndex = 0;
          try {
            currentIndex = this.$refs.chatTextarea['selectionStart'] || 0;
          } catch (e) {
            console.log(e);
          }
          this.atList.push({
            nickName: msgToAt.nickname,
            accountId: msgToAt.sendId,
            index: currentIndex
          });
        }
      },
      /**
       * 获取根据人数和系数获取延迟时间
       * @param n 人数
       * @param o 非必传，系数，不传递默认为1
       * @returns {number}
       */
      delayTime(n, o) {
        n = n || 0;
        o = o || 1;
        let result = 0;
        if (n <= 1000) {
          result = 0;
        } else if (n <= 10000) {
          // 大于1千，小于1万
          result = n / 1000;
        } else if (n <= 50000) {
          // 大于1万，小于5万
          result = 20 + (10 * (n - 10000)) / 10000;
        } else if (n > 50000) {
          // 大于5万
          result = 60;
        }
        return Math.floor(o * result);
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-input {
    @bg-dark-normal: #1a1a1a;
    @font-dark-normal: #e6e6e6;
    @font-dark-second: #666;
    // 错误提示字体颜色
    @font-error: #fb3a32;
    // 链接字体颜色
    @font-link: #3562fa;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    &__textarea-box {
      width: 220px;
      &.is-watch {
        width: 264px;
      }
      flex: 1;
      background-color: @bg-dark-normal;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: @font-dark-normal;
      line-height: 20px;
      padding: 10px 12px;
      text-align: left;
      border-radius: 20px;
      position: relative;
      .textarea-box__textarea.os-host-overflow {
        overflow: visible !important;
      }
      .os-scrollbar-vertical {
        right: -8px;
      }
      .os-host-textarea {
        min-height: 20px;
      }
      .textarea-box__textarea {
        &::-webkit-input-placeholder {
          color: @font-dark-second;
        }
        &:-moz-placeholder {
          color: @font-dark-second;
        }
        &::-moz-placeholder {
          color: @font-dark-second;
        }
        &:-ms-input-placeholder {
          color: @font-dark-second;
        }
      }
      .textarea-box__textarea-show-limit {
        font-size: 12px;
        line-height: 20px;
        position: absolute;
        bottom: 9px;
        right: 14px;
        background-color: @bg-dark-normal;
        .textarea-show-limit__current-count {
          color: @font-link;
          &.limited {
            color: @font-error;
          }
        }
        .textarea-show-limit__total {
          color: @font-dark-normal;
        }
      }
    }

    &__textarea-placeholder {
      width: 220px;
      &.is-watch {
        width: 264px;
      }
      background-color: @bg-dark-normal;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: @font-dark-normal;
      line-height: 20px;
      padding: 10px 12px;
      text-align: left;
      border-radius: 20px;
      .textarea-placeholder_no-login {
        color: #666666;
        cursor: default;
      }
      .chat-login-btn {
        cursor: pointer;
        color: @font-link;
      }
    }

    &__send-btn {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background-color: #1a1a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-left: 8px;
      .vh-line-send {
        font-size: 18px;
        color: #e6e6e6;
      }
      &.disable {
        cursor: default;
        .vh-iconfont {
          color: #666666;
        }
      }
    }
  }
</style>
