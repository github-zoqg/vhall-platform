<template>
  <div class="chat-input-modal" v-show="visible">
    <div class="input-info">
      <div class="send-box" @click="operateEmoji">
        <i class="vh-iconfont vh-line-expression" title="表情"></i>
      </div>
      <el-input
        type="textarea"
        class="textarea"
        autosize
        show-word-limit
        :placeholder="
          showTabType == 'qa'
            ? $t('chat.chat_1066')
            : showTabType == 'private'
            ? $t('chat.chat_1045')
            : $t('webinar.webinar_1011')
        "
        v-model="inputValue"
        id="textareaChat"
        ref="textareaChat"
        :maxlength="140"
        @blur="handleOnBlur"
        @focus="handleOnFocus"
        @keyup.enter.native="send"
      ></el-input>
      <div class="send-box">
        <div class="send-menu" @click="closeSendBox">
          <span class="vh-iconfont vh-line-send"></span>
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
        <div class="btn" @click="delInput">
          <span class="vh-iconfont vh-line-close"></span>
        </div>
        <div class="btn" @click="send">发送</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getEmojiList } from '@/packages/chat/src/js/emoji';
  import EventBus from '../js/Events.js';

  export default {
    name: 'VmpChatWapInputModal',
    props: {
      showTabType: {
        type: [String, Number],
        default: ''
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
      }
    },
    methods: {
      //显示模态窗
      openModal(text = '') {
        if (!['', null, void 0].includes(text)) {
          this.inputValue += text;
        }
        this.visible = true;
        this.showEmoji = false;
        setTimeout(() => {
          document.querySelector('textarea#textareaChat').focus();
        }, 0);
      },
      //点击发送按钮
      send() {
        const inputValue = this.inputValue.trim();
        if (!inputValue) {
          // this.$message(this.$t('chat.chat_1057'));
          return;
        }
        this.$emit('sendMsg', inputValue);
        this.cancel();
      },
      //取消
      cancel() {
        this.inputValue = '';
        this.visible = false;
      },
      //处理失去焦点
      handleOnBlur() {
        // this.showEmoji = false;
        window.document.body.scrollTop = '0px';
        window.document.activeElement.scrollIntoViewIfNeeded(true);
        window.scroll(0, 0);
      },
      //处理获得焦点
      handleOnFocus() {
        if (this.showEmoji) {
          this.showEmoji = false;
        }
      },
      //选中表情
      inputEmoji(item = {}) {
        this.inputValue += item.name;
        // this.showEmoji = false;
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
        //设置只读属性可以暂时禁止键盘
        // this.$refs.textareaChat.$el.setAttribute('readonly', 'readonly');
        // this.$refs.textareaChat.focus();
        // setTimeout(() => {
        //   this.$refs.textareaChat.$el.removeAttribute('readonly', 'readonly');
        // }, 200);
      }
    }
  };
</script>

<style lang="less">
  .chat-input-modal {
    width: 100%;
    position: relative;
    z-index: 9999;
    min-height: 94px;
    margin-top: -94px;
    font-size: 28px;
    background-color: #f0f0f0;

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      /* prettier-ignore */
      border-bottom: 1PX solid #D9D9D9;
      left: 0;
      top: 0;
      transform-origin: 0 bottom;
      opacity: 1;
    }

    .input-info {
      display: flex;
      align-items: flex-end;
      padding: 15px 32px;

      .send-box {
        width: 66px;
        height: 66px;
        min-height: 66px;
        color: #262626;
        display: flex;
        align-items: center;
        justify-content: center;

        .vh-line-expression {
          font-size: 50px;
        }

        .send-menu {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #fff;

          .vh-iconfont {
            font-size: 28px;
          }
        }
      }

      .textarea {
        flex: 1;
        min-height: 64px;
        margin: 0 24px;

        textarea {
          min-height: 64px !important;
          padding: 10px 24px !important;
          max-height: 144px !important;
          border-radius: 40px;
          border-color: #fff;
        }
        .el-textarea__inner::-webkit-input-placeholder {
          font-size: 28px !important;
        }
      }
    }

    .send-box__bottom--emoji {
      position: relative;
      width: 100%;
      height: 456px;
      box-sizing: border-box;
      overflow-y: scroll;
      background-color: #fff;
      padding: 30px 30px 80px;
      .imgs {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        img {
          width: 70px;
          height: 70px;
          margin: 10px;
        }
      }
      .tools {
        width: 200px;
        display: flex;
        justify-content: flex-end;
        background-color: #fff;
        z-index: 99;
        padding-top: 10px;
        position: fixed;
        right: 20px;
        bottom: 20px;
        .btn {
          width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 10px;
          padding: 10px 0;
        }
      }
    }

    input::-webkit-input-placeholder {
      /* placeholder字体大小  */
      font-size: 14px;
    }
  }
</style>
