<template>
  <div class="chat-input-modal-fashion" :class="smFix ? 'smFix' : ''" v-show="visible">
    <div class="input-info">
      <div class="send-box" @touchend.prevent="operateEmoji">
        <i class="iconfonts vh-iconfont vh-line-expression" v-show="!showEmoji" title="表情"></i>
        <i
          class="iconfonts vh-saas-iconfont vh-saas-jianpan_icon"
          v-show="showEmoji"
          title="键盘"
        ></i>
      </div>
      <div class="inputGroup">
        <el-input
          type="textarea"
          class="textarea"
          autosize
          :placeholder="
            showTabType == 'qa'
              ? $t('chat.chat_1066')
              : showTabType == 'private'
              ? $t('chat.chat_1045')
              : $t('chat.chat_1021')
          "
          v-model="inputValue"
          id="textareaChat"
          ref="textareaChat"
          :maxlength="140"
          @blur="handleOnBlur"
          @focus="handleOnFocus"
        ></el-input>
        <span class="text-limit" v-show="inputValue.length >= 140">
          <span>{{ inputValue.length }}</span>
          /140
        </span>
      </div>
      <div class="send-box">
        <div class="send-menu" :class="inputValue ? '' : 'noMsg'" @touchend.prevent="send">
          <span class="iconfonts vh-iconfont vh-line-send"></span>
        </div>
      </div>
    </div>
    <div v-if="showEmoji" class="send-box__bottom--emoji">
      <div class="imgs">
        <img
          :src="item.src"
          @click.stop="inputEmoji(item)"
          v-for="item in faceArr"
          :key="item.value"
        />
      </div>
      <div class="tools">
        <div class="btn" @touchend.prevent="delInput">
          <span
            :class="inputValue ? '' : 'noMsgText'"
            class="iconfonts vh-saas-iconfont vh-saas-delete"
          ></span>
        </div>
        <div class="btn send" :class="inputValue ? '' : 'noMsgText'" @touchend.prevent="send">
          发送
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getEmojiList } from '@/packages/chat/src/js/emoji';
  import EventBus from '../js/Events.js';
  import { isMse } from '../js/utils.js';
  export default {
    name: 'VmpChatWapInputModal',
    props: {
      showTabType: {
        type: [String, Number],
        default: ''
      },
      refName: {
        default: 'chatWap'
      }
    },
    data() {
      return {
        //是否显示模态窗
        visible: false,
        //表情数组
        faceArr: getEmojiList(),
        //输入的值的模板
        inputValue: '',
        //是否显示表情弹窗
        showEmoji: false
      };
    },
    watch: {
      showEmoji() {
        EventBus.$emit('showEmoji', this.showEmoji);
        if (!this.showEmoji && !this.visible) {
          this.focusoutIOS();
        }
      }
    },
    computed: {
      smFix() {
        console.log('screen.height --', screen.height);
        // if (screen.height < 667) {
        //   return true;
        // } else {
        //   return false;
        // }
        const IsMse = isMse();
        if (IsMse.os === 'android') {
          return true;
        } else {
          return false;
        }
      }
    },
    mounted() {
      this.eventListener();
      console.log('userAgent:', navigator.userAgent);
      const IsMse = isMse();
      if (IsMse.os === 'ios') {
        window.addEventListener('focusin', this.focusinIOS);
        window.addEventListener('focusout', this.focusoutIOS);
      }
    },
    methods: {
      focusoutIOS() {
        // 键盘收起事件处理
        //  // alert('iphone 键盘收起事件处理');
        document.querySelector('body').classList.remove('fixIphoneX');
        //this.cancel();
      },
      focusinIOS() {
        // 键盘弹出事件处理
        // alert('iphone 键盘弹出事件处理');
        // this.scrollBottom();
        if (this.visible) {
          document.querySelector('body').classList.add('fixIphoneX');
        }
      },
      //显示模态窗
      openModal(text = '') {
        if (!['', null, void 0].includes(text)) {
          this.inputValue += text;
        }
        this.visible = true;
        this.showEmoji = false;
        this.$nextTick(() => {
          this.$refs.textareaChat.focus();
        });
      },
      //点击发送按钮
      send() {
        const inputValue = this.inputValue.trim();
        if (!inputValue) {
          // this.$message(this.$t('chat.chat_1057'));
          return;
        }
        EventBus.$emit('showSendBox', false);
        this.$emit('sendMsg', inputValue);
        this.cancel();
      },
      //取消
      cancel() {
        this.inputValue = '';
        this.showEmoji = false;
        this.visible = false;
        this.$nextTick(() => {
          this.$refs.textareaChat.blur();
          this.visible = false;
        });
      },
      //处理失去焦点
      handleOnBlur() {
        // this.showEmoji = false;
        // window.document.body.scrollTop = '0px';
        // window.document.activeElement.scrollIntoViewIfNeeded(true);
        // window.scroll(0, 0);
        // this.doSmFix();
      },
      //处理获得焦点
      handleOnFocus() {
        if (this.showEmoji) {
          this.showEmoji = false;
        }
        // this.doSmFix();
      },
      /*  doSmFix() {
        const this_p = this.$parent.$parent;
        let sendBoxEL = this_p.$refs.sendBox.$el.getBoundingClientRect();
        let chatWapEL = this_p.$refs[this.refName].getBoundingClientRect();
        if (sendBoxEL.top < chatWapEL.top) {
          this_p.smFix = true;
          this.smFix = true;
        } else {
          this_p.smFix = false;
          this.smFix = false;
        }
        console.log('-------------------', sendBoxEL.top, chatWapEL.top);
      }, */
      //选中表情
      inputEmoji(item = {}) {
        // 添加表情之后如果会超出 140 ，就不输入了
        const resultVal = this.inputValue + item.name;
        if (resultVal.length > 140) {
          return;
        }
        this.inputValue = resultVal;
      },
      closeSendBox() {
        this.visible = false;
        this.showEmoji = false;
      },
      //输入框获取光标
      getPosition(element) {
        let cursorPos = 0;
        if (document.selection) {
          //IE
          let selectRange = document.selection.createRange();
          selectRange.moveStart('character', -element.value.length);
          cursorPos = selectRange.text.length;
        } else if (element.selectionStart || element.selectionStart == '0') {
          cursorPos = element.selectionStart;
        }
        return cursorPos;
      },
      delInput() {
        this.inputValue = this.inputValue.substring(0, this.inputValue.length - 1);
        // 当前光标位置
        // let posCursor = this.getPosition(this.$refs.textareaChat.$refs.textarea);
        // console.log('当前光标位置：' + posCursor);
        // if (posCursor !== 0) {
        //   let str = this.inputValue;
        //   this.inputValue = str.substring(0, posCursor - 1) + str.substring(posCursor);
        //   this.$nextTick(() => {
        //     //矫正光标位置
        //     this.$refs.textareaChat.$refs.textarea.selectionStart = posCursor--;
        //     this.$refs.textareaChat.$refs.textarea.selectionEnd = posCursor;
        //     this.$refs.textareaChat.focus();
        //   });
        // }
      },
      operateEmoji() {
        this.showEmoji = !this.showEmoji;
        this.$nextTick(() => {
          if (this.showEmoji) {
            this.$refs.textareaChat.blur();
          } else {
            this.$refs.textareaChat.focus();
          }
        });
        //设置只读属性可以暂时禁止键盘
        // this.$refs.textareaChat.$el.setAttribute('readonly', 'readonly');
        // this.$refs.textareaChat.focus();
        // setTimeout(() => {
        //   this.$refs.textareaChat.$el.removeAttribute('readonly', 'readonly');
        // }, 200);
      },
      // eventBus监听
      eventListener() {
        //监听聊天组件是否打开
        EventBus.$on('showSendBox', e => {
          if (!e) {
            this.cancel();
          }
        });
      }
    }
  };
</script>

<style lang="less">
  // body {
  //   padding-bottom: 0 !important;
  // }

  @supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
    .fixIphoneX {
      padding-bottom: 0 !important;
    }
  }

  .smFix {
    .chat-input-modal-fashion {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      margin-top: 0 !important;
    }
  }

  .chat-input-modal-fashion {
    width: 100%;
    position: relative;
    z-index: 9999;
    min-height: 94px;
    margin-top: -94px;
    font-size: 28px;
    background-color: var(--theme-chat-sendBox-model-bg-color);
    box-shadow: 0px -1px 1px var(--theme-chat-sendBox-box-shadow-color);
    .noMsg {
      opacity: 0.4 !important;
    }
    .noMsgText {
      background-color: #fff !important;
      color: #d9d9d9 !important;
    }
    &.smFix {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      margin-top: 0 !important;
    }

    .input-info {
      display: flex;
      align-items: flex-end;
      padding: 15px 32px;

      .send-box {
        width: 64px;
        height: 64px;
        min-height: 64px;
        // 表情按钮icon字体色
        color: var(--theme-chat-sendBox-emoji-font-color);
        display: flex;
        align-items: center;
        justify-content: center;

        > .iconfonts {
          font-size: 50px;
        }

        .send-menu {
          width: 64px;
          min-width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          // 发送消息按钮icon字体色
          color: var(--theme-chat-sendBox-send-active-font-color);
          background-color: var(--theme-chat-sendBox-send-bg-color);

          &.noMsg {
            // 发送消息按钮icon禁用字体色
            color: var(--theme-chat-sendBox-send-font-color);
            // opacity: 0.4;
          }
          .vh-iconfont {
            font-size: 34px;
          }
        }
      }

      .textarea {
        textarea {
          background-color: var(--theme-chat-sendBox-input-bg-color);
          color: var(--theme-chat-sendBox-input-font-color);
          min-height: 64px !important;
          padding: 10px 24px !important;
          max-height: 144px !important;
          border-radius: 40px;
          border-color: #fff;
          border: none;
          -webkit-appearance: none; /*去除阴影边框*/
          outline: none;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0); /*点击高亮的颜色*/
        }
        .el-textarea__inner::-webkit-input-placeholder {
          font-size: 28px !important;
          color: var(--theme-chat-sendBox-input-placeholder-color);
        }
        .el-textarea__inner {
          line-height: 40px;
        }
      }
    }

    .inputGroup {
      flex: 1;
      min-height: 64px;
      margin: 0 24px;
      position: relative;
      .text-limit {
        background-color: var(--theme-chat-sendBox-input-bg-color);
        position: absolute;
        bottom: 16px;
        right: 12px;
        font-size: 24px;
        color: var(--theme-chat-sendBox-input-max-font-color);
        padding-left: 4px;
        line-height: 32px;
        > span {
          color: #fb2626;
        }
      }
    }
    .send-box__bottom--emoji {
      position: relative;
      width: 100%;
      height: 356px;
      box-sizing: border-box;
      overflow-y: scroll;
      background-color: #f0f0f0;
      padding: 30px 30px 110px;
      .imgs {
        display: grid;
        justify-content: space-between;
        grid-template-columns: repeat(auto-fill, 52px);
        grid-gap: 26px;
        img {
          width: 60px;
          height: 60px;
        }
      }
      .tools {
        width: 280px;
        height: 120px;
        display: flex;
        justify-content: flex-end;
        background-color: transparent;
        z-index: 99;
        position: fixed;
        right: 20px;
        bottom: 20px;
        align-items: flex-end;
        // 判断iphoneX  填充到最底部
        @supports (bottom: env(safe-area-inset-bottom)) {
          bottom: calc(env(safe-area-inset-bottom) + 20px);
        }

        .btn {
          width: 104px;
          height: 74px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 10px;
          border-radius: 8px;
          background-color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          .iconfonts {
            font-size: 44px;
          }
          &.send {
            background-color: #fb3a32;
            color: #fff;
          }
        }
      }
    }

    input::-webkit-input-placeholder {
      /* placeholder字体大小  */
      font-size: 14px;
      color: #bfbfbf;
    }
  }
</style>
