<template>
  <div ref="chatQaOperator" class="vhsaas-chat-operator">
    <div class="vhsaas-chat-operator__header-wrapper">
      <i class="vh-iconfont vh-line-expression" @click.stop="toggleEmoji"></i>
      <div class="vhsaas-chat-operator__only-mine">
        <el-checkbox
          class="only-me-item__checkbox"
          @change="onClickOnlyMine"
          v-model="onlyMine"
        ></el-checkbox>
        <span class="only-me-item__label">{{ $t('chat.chat_1018') }}</span>
      </div>
      <!-- 表情选择 -->
      <div class="vhsaas-chat-operator__emoji-wrapper">
        <emoji ref="emoji" @emojiInput="emojiInput"></emoji>
      </div>
    </div>
    <div class="vhsaas-chat-qa-operator__body-wrap">
      <div
        v-show="!inputStatus.disable && !chatLoginStatus"
        class="vhsaas-chat-operator__textarea-box"
      >
        <textarea
          id="qa-textarea"
          ref="chatQaTextarea"
          v-model="inputValue"
          :placeholder="inputStatus.placeholder"
          rows="1"
          class="vhsaas-chat-operator__textarea"
          @input="inputHandle"
          @keydown.stop="onkeydownHandle($event)"
          @keyup.stop="onKeyUpHandle($event)"
        ></textarea>
        <span v-show="showWordLimit" class="vhsaas-chat-operator__textarea-show-limit">
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
        class="vhsaas-chat-operator__textarea-placeholder"
      >
        <!--TODO待翻译-->
        <span v-show="chatLoginStatus" class="textarea-placeholder_no-login">
          <i18n path="chat.chat_1002">
            <span class="chat-login-btn" place="n" @click="loginVisible">
              {{ $t('nav.nav_1005') }}
            </span>
          </i18n>
        </span>
        <span
          v-show="inputStatus.disable && !chatLoginStatus"
          class="textarea-placeholder_no-login"
        >
          {{ inputStatus.placeholder }}
        </span>
      </div>
      <div class="vhsaas-chat-operator__send-btn-box">
        <div
          class="vhsaas-chat-operator__send-btn"
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
  import Emoji from '@/packages/chat/src/common/components/emoji';
  import { useQaServer, useRoomBaseServer } from 'middle-domain';
  export default {
    components: {
      Emoji
    },
    props: {
      chatLoginStatus: {
        type: Boolean,
        required: true
      },
      chatList: {
        type: Array,
        required: true,
        default: () => []
      },
      inputStatus: {
        required: true,
        type: Object,
        default: () => ({
          disable: false,
          noLogin: false,
          placeholder: '说点什么吧'
        })
      }
    },
    data() {
      return {
        inputValue: '',
        showWordLimit: false,
        overlayScrollbar: null, // 滚动条实例
        onlyMine: false,
        questionGap: 0, // 每次发送问答成功以后需要等待15秒才能再此发送问答
        //限频定时器
        questionGapInterval: null
      };
    },
    computed: {
      join_name() {
        return this.watchInitData.join_info.nickname;
      },
      roleName() {
        return this.watchInitData.join_info.role_name;
      },
      roomId() {
        return this.watchInitData.interact.room_id;
      }
    },
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
    mounted() {
      this.overlayScrollbarInit();
      this.watchInitData = useRoomBaseServer().state.watchInitData;
      document.addEventListener('click', () => {
        this.isFilterShow = false;
      });
    },
    methods: {
      //阻止输入框空格按键事件冒泡，触发播放器暂停/播放
      onKeyUpHandle(event) {
        event.stopPropagation();
      },
      // 滚动条初始化
      overlayScrollbarInit() {
        this.$nextTick(() => {
          this.overlayScrollbar = OverlayScrollbars(document.getElementById('qa-textarea'), {
            paddingAbsolute: true,
            className: 'os-theme-light os-theme-vhall',
            scrollbars: {
              autoHide: 'leave',
              autoHideDelay: 200
            }
          });
        });
      },
      // 输入框 input 事件
      inputHandle() {
        // const chatOldTextareaHeight = this.$refs.chatQaTextarea.style.height;
        // 最大字数限制 140
        if (this.inputValue.length > 140) {
          this.inputValue = this.inputValue.substring(0, 140);
        }
        this.$nextTick(() => {
          const chatTextareaHeight = this.$refs.chatQaTextarea.style.height;
          console.log('chatTextareaHeight', chatTextareaHeight);
          // if (chatOldTextareaHeight !== chatTextareaHeight) {
          const hostTextarea = document.querySelector(
            '.vhsaas-chat-qa-operator__body-wrap .os-host-textarea'
          );
          const chatTextAreaHeight = parseInt(chatTextareaHeight);
          if (chatTextAreaHeight <= 60) {
            // 解决删除文本之后 textarea 高度不会自动减小的问题
            this.$refs.chatQaTextarea.style.minHeight = '20px';
            hostTextarea.style.minHeight = chatTextareaHeight;
          } else {
            hostTextarea.style.minHeight = '59px';
          }
          // 三行的时候显示字数限制，否则不显示
          this.showWordLimit = chatTextAreaHeight > 40;

          // 触发父元素绑定的高度发生变化事件
          setTimeout(() => {
            this.$emit('chatTextareaHeightChange', this.$refs.chatQaOperator.offsetHeight);
          });
          // }
        });
      },
      // 登录
      loginVisible() {
        this.$emit('needLogin');
      },
      // 切换表情显示
      toggleEmoji() {
        if (this.chatLoginStatus) {
          // this.$message({
          //   message: this.$t('未登录'),
          //   showClose: true,
          //   // duration: 0,
          //   type: 'error',
          //   customClass: 'zdy-info-box'
          // })
          this.toggleEmoji();
          return;
        }

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
      // 问答只看我的点击事件
      onClickOnlyMine(value) {
        this.onlyMine = value;
        if (this.onlyMine) {
          this.$message({
            message: this.$t('chat.chat_1019'),
            showClose: true,
            // duration: 0,
            type: 'success',
            customClass: 'zdy-info-box'
          });
        } else {
          this.$message({
            message: this.$t('chat.chat_1020'),
            showClose: true,
            // duration: 0,
            type: 'success',
            customClass: 'zdy-info-box'
          });
        }
        this.$emit('onOnlyMine', this.onlyMine);
      },
      onkeydownHandle(event) {
        if (event.keyCode == 13) {
          this.sendMessage();
          event.preventDefault();
        }
      },
      //发送消息
      async sendMessage() {
        if (this.inputStatus.disable) {
          return;
        }
        // 数据埋点
        window.vhallReportForWatch?.report(170027, {
          is_empty: this.inputValue.trim() ? 0 : 1
        });
        if (this.inputValue.trim() === '') {
          return this.$message({
            message: this.$t('chat.chat_1009'),
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        }
        if (this.questionGap > 0) {
          this.lock = sessionStorage.getItem('QALock');
          if (this.lock && this.lock == 'true') {
            this.$emit('onInputStatus', this.$t('chat.chat_1080', { n: this.questionGap }));
          } else {
            this.$emit('onInputStatus', this.$t('chat.chat_1003'));
          }
        } else {
          console.warn('获取发送问答--------');
          const params = {
            room_id: this.roomId,
            content: this.inputValue
          };
          // 如果是回放，需要传回放id
          if (this.watchInitData.webinar.type == 5 && this.watchInitData.switch.switch_id) {
            params.webinar_switch_id = this.watchInitData.switch.switch_id;
          }
          useQaServer()
            .sendQaMsg(params)
            .then(res => {
              console.warn('获取发送问答-----成功---', res);
              this.lock = sessionStorage.getItem('QALock');
              this.questionGap = 15;
              if (!this.questionGapInterval) {
                this.questionGapInterval = window.setInterval(() => {
                  if (this.questionGap > 0) {
                    if (!this.lock || this.lock == 'false') {
                      sessionStorage.setItem('QALock', true);
                    } else {
                      // this.inputStatus.placeholder = `太频繁啦，还有${this.questionGap}秒后才能发送`;
                      this.$emit(
                        'onInputStatus',
                        this.$t('chat.chat_1080', { n: this.questionGap })
                      );
                    }
                    this.questionGap = this.questionGap - 1;
                  } else {
                    window.clearInterval(this.questionGapInterval);
                    this.questionGapInterval = null;
                    // this.inputStatus.placeholder = '说点什么吧';
                    this.$emit(
                      'onInputStatus',
                      this.inputStatus.disable
                        ? this.$t('chat.chat_1079')
                        : this.$t('chat.chat_1003')
                    );
                    sessionStorage.setItem('QALock', false);
                  }
                }, 1000);
              }
            })
            .catch(res => {
              this.$message({
                message: this.$tec(res.code) || this.$t('chat.chat_1056'),
                showClose: true,
                // duration: 0,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            });
        }
        // 这块看起来很奇怪的代码，是为了清空输入框内容之后自适应高度。
        // 没有更好的替换方案，误删！
        this.inputValue = '';

        this.$nextTick(() => {
          // 输入框内容发生变化，更新滚动条
          this.overlayScrollbar.update();
          this.inputHandle();
        });
        // setTimeout(() => {
        //   this.inputValue = '';
        //   // this.$emit('performScroll');
        // });
      }
    }
  };
</script>

<style lang="less">
  @font-dark-qa-second: #666666;
  .vhsaas-chat-operator {
    width: calc(100% - 48px);
    padding: 10px 24px;
    border-top: 1px solid var(--tab-menu-bg-border);
    background-color: var(--chat-background-color-base);
    position: absolute;
    bottom: 0;
  }
  .vhsaas-chat-operator__header-wrapper {
    height: 19px;
    margin-bottom: 9px;
    line-height: 19px;
    position: relative;
    .vh-line-expression {
      cursor: pointer;
      font-size: 18px;
      color: #999999;
      &:hover {
        color: var(--theme-color);
      }
    }
    .vhsaas-chat-operator__only-mine {
      padding-left: 17px;
      display: inline-flex;
      align-items: center;
      vertical-align: top;
      line-height: 18px;
      .only-me-item__checkbox {
        display: inline-block;
        margin-right: 8px;
        position: relative;
        color: #999999;
        cursor: pointer;
        font-size: 14px;
        .el-checkbox__inner {
          background-color: transparent;
          border: 1px solid #999;
        }
        &.iconfuxuankuang_yixuan {
          color: @font-error;
          &:before {
            position: relative;
            z-index: 1;
          }
          &:after {
            content: '';
            position: absolute;
            top: 4px;
            left: 1px;
            width: 12px;
            height: 12px;
            z-index: 0;
            background-color: #ffffff;
          }
        }
      }
      .only-me-item__label {
        // margin-left: 5px;
        font-size: 14px;
        line-height: 18px;
        color: var(--theme-tab-content-qa-onlyMe-font);
      }
    }
  }
  .vhsaas-chat-operator__emoji-wrapper {
    width: 278px;
    position: absolute;
    top: -14px;
    transform: translateY(-100%);
    border-radius: 4px;
    @media screen and (max-width: 1280px) {
      max-height: 106px;
      overflow-y: auto;
    }
  }
  .vhsaas-chat-qa-operator__body-wrap {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    .vhsaas-chat-operator__textarea-box {
      width: 240px;
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
      ::v-deep > .vhsaas-chat-operator__textarea.os-host-overflow {
        overflow: visible !important;
      }
      ::v-deep .os-scrollbar-vertical {
        right: -8px;
      }
      ::v-deep .os-host-textarea {
        min-height: 20px;
      }
      textarea.vhsaas-chat-operator__textarea {
        &::-webkit-input-placeholder {
          color: @font-dark-qa-second;
        }
        &:-moz-placeholder {
          color: @font-dark-qa-second;
        }
        &::-moz-placeholder {
          color: @font-dark-qa-second;
        }
        &:-ms-input-placeholder {
          color: @font-dark-qa-second;
        }
      }
      .vhsaas-chat-operator__textarea-show-limit {
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
    .vhsaas-chat-operator__textarea-placeholder {
      width: 240px;
      background-color: var(--chat-background-color-input);
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
    .vhsaas-chat-operator__send-btn-box {
      .vhsaas-chat-operator__send-btn {
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
          .vh-line-send {
            color: #666666;
          }
        }
      }
    }
  }
</style>
