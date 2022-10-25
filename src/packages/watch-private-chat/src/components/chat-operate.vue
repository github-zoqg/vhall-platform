<template>
  <div ref="chatQaOperator" class="vmp-watch-private-chat-operate">
    <div class="private-chat-operate-container__tool-bar">
      <div class="operate-container__tool-bar__left">
        <!--表情按钮-->
        <i class="vh-iconfont vh-line-expression" @click.stop="toggleEmoji"></i>
        <!-- 表情选择 -->
        <div class="operate-container__tool-bar__emoji-wrap">
          <emoji ref="emoji" @emojiInput="emojiInput"></emoji>
        </div>
      </div>
      <div class="operate-container__tool-bar__right"></div>
    </div>
    <div class="private-chat-operate-container__input-bar">
      <div v-show="!inputStatus.disable && !chatLoginStatus" class="input-bar__textarea-box">
        <textarea
          id="private-chat-textarea"
          ref="privateChatTextarea"
          v-model="inputValue"
          :placeholder="inputStatus.placeholder"
          rows="1"
          class="input-bar__textarea-box__textarea"
          @input="inputHandle"
          @keydown.stop="onkeydownHandle($event)"
          @keyup.stop="onKeyUpHandle"
        ></textarea>
        <span v-show="showWordLimit" class="input-bar__textarea-box__textarea-show-limit">
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
        class="input-bar__textarea-box__textarea-placeholder"
      >
        <span v-show="chatLoginStatus" class="input-bar__textarea-box__no-login">
          <i18n path="chat.chat_1001">
            <span class="input-bar__textarea-box__chat-login-btn" place="n" @click="callLogin">
              {{ $t('nav.nav_1005') }}
            </span>
          </i18n>
        </span>
        <span
          v-show="inputStatus.disable && !chatLoginStatus"
          class="input-bar__textarea-box__no-login"
        >
          {{ inputStatus.placeholder }}
        </span>
      </div>
      <div class="input-bar__textarea-box__send-btn-box">
        <div
          class="input-bar__textarea-box__send-btn"
          :class="{ disable: inputStatus.disable }"
          :disabled="inputStatus.disable"
          @click="sendMessage"
        >
          <i class="vh-iconfont vh-line-send"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import OverlayScrollbars from 'overlayscrollbars';
  import Emoji from '@/packages/chat/src/components/emoji';
  import { textToEmoji } from '@/packages/chat/src/js/emoji';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import { useChatServer, useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'vmpWatchPrivateChatOperate',
    components: {
      Emoji
    },
    props: {
      //是否需要登录
      chatLoginStatus: {
        type: Boolean,
        required: true
      },
      //聊天消息列表
      chatList: {
        type: Array,
        required: true,
        default: () => []
      },
      //最新的消息
      latestMessage: {
        type: Object,
        required: true
      },
      //输入框状态
      inputStatus: {
        type: Object,
        required: true,
        default: () => ({
          disable: false,
          noLogin: false,
          placeholder: '参与聊天'
        })
      },
      //当前的登录人信息
      joinInfo: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data() {
      return {
        //默认头像
        defaultAvatar: defaultAvatar,
        //输入框的值
        inputValue: '',
        //是否展示字数限制
        showWordLimit: false,
        //保存的滚动条实例
        overlayScrollbar: null,
        //发送私聊消息的间隔
        questionGap: 0,
        //修改后的昵称
        new_nick_name: null,
        //修改后的头像
        new_avatar: null
      };
    },
    computed: {},
    watch: {
      inputValue: {
        handler(newValue) {
          // 注意事项：输入了三行文字，直接Backspace 退格，重置输入框高度
          if (!newValue) {
            // console.log('chat input 值发生变化了', newValue);
            // 输入框内容发生变化，更新滚动条
            this.$nextTick(() => {
              this.overlayScrollbar.update();
              this.inputHandle();
            });
          }
        }
      }
    },
    beforeCreate() {
      this.chatServer = useChatServer();
    },
    mounted() {
      this.overlayScrollbarInit();
      document.addEventListener('click', () => {
        this.isFilterShow = false;
      });
      //todo 监听用户昵称修改
      //todo 监听用户头像修改
    },
    methods: {
      // 滚动条初始化
      overlayScrollbarInit() {
        this.$nextTick(() => {
          this.overlayScrollbar = OverlayScrollbars(
            document.getElementById('private-chat-textarea'),
            {
              paddingAbsolute: true,
              className: 'os-theme-light os-theme-vhall',
              scrollbars: {
                autoHide: 'leave',
                autoHideDelay: 200
              }
            }
          );
        });
      },
      //输入框输入事件,改变高度等
      inputHandle() {
        // const chatOldTextareaHeight = this.$refs.privateChatTextarea.style.height;
        // 最大字数限制 140
        if (this.inputValue.length > 140) {
          this.inputValue = this.inputValue.substring(0, 140);
        }
        this.$nextTick(() => {
          const chatTextareaHeight = this.$refs.privateChatTextarea.style.height;
          // if (chatOldTextareaHeight !== chatTextareaHeight) {
          const hostTextarea = document.querySelector(
            '.private-chat-operate-container__input-bar .os-host-textarea'
          );
          const chatTextAreaHeight = parseInt(chatTextareaHeight);
          if (chatTextAreaHeight <= 60) {
            // 解决删除文本之后 textarea 高度不会自动减小的问题
            this.$refs.privateChatTextarea.style.minHeight = '20px';
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
          // }
        });
      },
      //按下enter键的处理
      onkeydownHandle(event) {
        if (event.keyCode === 13) {
          this.sendMessage();
          //阻止默认行为
          event.preventDefault();
        }
      },
      //阻止输入框空格按键事件冒泡，触发播放器暂停/播放
      onKeyUpHandle(event) {
        event.stopPropagation();
      },
      // 切换表情显示
      toggleEmoji() {
        //如果需要登录
        if (this.chatLoginStatus) {
          this.callLogin();
          return;
        }
        //如果处于禁言状态
        if (this.inputStatus.disable) {
          this.$message({
            message: this.$t('chat.chat_1006'),
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          return;
        }
        this.$refs.emoji.toggleShow();
      },
      // 子组件输入表情
      emojiInput(value) {
        if (this.inputStatus.disable) {
          return;
        }
        this.inputValue += value;
      },
      onKeyUP(event) {
        if (event.keyCode == 13) {
          this.sendMessage();
          event.preventDefault();
        }
      },
      //转换表情内容
      emojiToText(content) {
        return textToEmoji(content)
          .map(c => {
            return c.msgType == 'text'
              ? c.msgCont
              : `<img width="24" src="${c.msgImage}" border="0" />`;
          })
          .join(' ');
      },
      //发送消息
      async sendMessage() {
        if (this.inputStatus.disable) {
          return;
        }
        if (this.inputValue.trim() === '') {
          return this.$message({
            message: this.$t('chat.chat_1009'),
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        }

        const msg = this.inputValue.trim();
        const curmsg = useChatServer().createCurMsg();
        const target = useChatServer().state.curPrivateTargetId;
        curmsg.setTarget(target);
        //将文本消息加入消息体
        curmsg.setText(msg);
        //发送消息
        useChatServer().sendMsg(curmsg);
        //清除发送后的消息
        useChatServer().clearCurMsg();
        this.inputValue = '';
        this.$nextTick(() => {
          // 输入框内容发生变化，更新滚动条
          this.overlayScrollbar.update();
          this.inputHandle();
          // 更新聊天内容区域滚动条
          this.$emit('sendMsgEnd');
        });
      },
      //信令唤起登录
      callLogin() {
        this.$emit('needLogin');
      }
    }
  };
</script>

<style lang="less">
  .vmp-watch-private-chat-operate {
    @bg-dark-normal: #1a1a1a;
    @font-dark-normal: #e6e6e6;
    @font-dark-second: #666666;
    // 错误提示字体颜色
    @font-error: #fb3a32;
    // 链接字体颜色
    @font-link: #3562fa;
    @active-color: var(--theme-color);
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border-top: 1px solid var(--tab-menu-bg-border);
    background-color: var(--chat-background-color-base);
    position: absolute;
    bottom: 0;
    .private-chat-operate-container__tool-bar {
      position: relative;
      display: flex;
      align-items: center;
      height: 18px;
      margin-bottom: 9px;
      .operate-container__tool-bar__left {
        display: flex;
        justify-content: flex-start;
        flex: 1;
      }
      .operate-container__tool-bar__right {
        display: flex;
        justify-content: flex-end;
        flex: 1;
      }
      .operate-container__tool-bar__emoji-wrap {
        width: 294px;
        position: absolute;
        top: 0;
        transform: translateY(-100%);
        left: 0;
      }
      .vh-iconfont {
        color: #999;
        font-size: 19px;
        cursor: pointer;
        &.active {
          color: @active-color;
        }
        &:hover {
          color: @active-color;
          cursor: pointer;
        }
        &.pic-disabled {
          pointer-events: none;
        }
        margin-left: 10px;
      }
      .vh-line-expression {
        font-size: 18px;
        color: #999;
        margin-left: 0;
        &:hover {
          color: @active-color;
          cursor: pointer;
        }
      }
    }
    .private-chat-operate-container__input-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      .input-bar__textarea-box {
        width: 264px;
        background-color: var(--chat-background-color-input);
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: var(--chat-font-color-input);
        line-height: 20px;
        padding: 10px 12px;
        text-align: left;
        border-radius: 20px;
        position: relative;
      }
      .textarea-box__textarea.os-host-overflow {
        overflow: visible !important;
      }
      .os-scrollbar-vertical {
        right: -8px;
      }
      .os-host-textarea {
        min-height: 20px;
      }
      .input-bar__textarea-box__textarea {
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
      .input-bar__textarea-box__textarea-show-limit {
        font-size: 12px;
        line-height: 20px;
        position: absolute;
        bottom: 9px;
        right: 14px;
        background-color: @bg-dark-normal;
      }
      .textarea-show-limit__current-count {
        color: @font-link;
        &.limited {
          color: @font-error;
        }
      }
      .textarea-show-limit__total {
        color: @font-dark-normal;
      }
      .input-bar__textarea-box__textarea-placeholder {
        width: 264px;
        background-color: var(--chat-background-color-input);
        font-size: 14px;
        color: @font-dark-normal;
        line-height: 20px;
        padding: 10px 12px;
        border-radius: 20px;
      }
      .input-bar__textarea-box__no-login {
        color: #666666;
        cursor: default;
      }
      .input-bar__textarea-box__chat-login-btn {
        cursor: pointer;
        color: @font-link;
      }
      .input-bar__textarea-box__send-btn-box {
      }
      .input-bar__textarea-box__send-btn {
        width: 40px;
        height: 40px;
        border-radius: 20px;
        background-color: var(--chat-background-color-input);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        .vh-line-send {
          font-size: 18px;
          color: var(--chat-font-color-msg-nickname);
        }
        &.disable {
          cursor: default;
          .vh-iconfont {
            color: #666666;
          }
        }
      }
    }
  }
</style>
