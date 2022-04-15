<template>
  <div class="chat-input-modal">
    <div class="input-info">
      <el-input
        type="textarea"
        class="textarea"
        autosize
        :placeholder="
          showTabType == 'qa'
            ? $t('chat.chat_1066')
            : showTabType == 'private'
            ? $t('chat.chat_1045')
            : $t('webinar.webinar_1011')
        "
        v-model="inputValue"
        id="textareaChat"
        ref="textarea"
        :maxlength="140"
        @blur="handleOnBlur"
        @focus="handleOnFocus"
      ></el-input>
      <div class="send-menu">
        <i class="vh-iconfont vh-line-expression" @click="showEmoji = !showEmoji" title="表情"></i>
        <span class="send-box__top--send-btn" @click="send">
          {{ $t('webinar.webinar_1010') }}
        </span>
      </div>
    </div>
    <div v-if="showEmoji" class="send-box__bottom--emoji">
      <img
        :src="item.src"
        @click.stop="inputEmoji(item)"
        v-for="item in faceArr"
        :key="item.value"
      />
    </div>
  </div>
</template>

<script>
  import { getEmojiList } from '@/packages/chat/src/js/emoji';

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
      }
    }
  };
</script>

<style lang="less">
  .chat-input-modal {
    width: 100%;
    position: relative;
    z-index: 9999;
    min-height: 120px;
    padding: 20px 30px;
    background-color: #fff;
    margin-top: -120px;
    font-size: 28px;

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      /* prettier-ignore */
      border-bottom: 1PX solid #e2e2e2;
      left: 0;
      top: 0;
      transform-origin: 0 bottom;
      opacity: 1;
    }

    .input-info {
      display: flex;
      align-items: flex-end;

      .textarea {
        flex: 1;
        min-height: 80px;

        textarea {
          min-height: 80px !important;
          padding: 10px !important;
          max-height: 200px !important;
        }
      }

      .send-menu {
        height: 80px;
        display: flex;
        align-items: center;

        .vh-iconfont {
          color: #797979;
          font-size: 42px;
          margin: 0 30px;
        }

        .send-box__top--send-btn {
          font-size: 28px;
        }
      }
    }

    .send-box__bottom--emoji {
      position: relative;
      width: 100%;
      height: 200px;
      margin-top: 10px;
      box-sizing: border-box;
      overflow-y: scroll;
      background-color: #fff;

      img {
        width: 48px;
        height: 48px;
        margin: 6px;
        float: left;
      }
    }

    input::-webkit-input-placeholder {
      /* placeholder字体大小  */
      font-size: 14px;
    }
  }
</style>
