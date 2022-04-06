<template>
  <van-popup
    v-model="visible"
    class="vmp-chat-wap-input-modal"
    :overlay-style="{ zIndex: 3000 }"
    get-container="body"
  >
    <div class="vmp-chat-wap-input-modal__send-box">
      <div class="send-box__top">
        <span class="send-box__top--cancel-btn" @click="cancel">
          {{ $t('account.account_1063') }}
        </span>
        <!-- 聊天 -->
        <span class="send-box__top--title">
          {{
            showTabType == 'qa'
              ? $t('common.common_1004')
              : showTabType == 'private'
              ? $t('common.common_1008')
              : $t('menu.menu_1002')
          }}
        </span>
        <span class="send-box__top--send-btn" @click="send">{{ $t('webinar.webinar_1010') }}</span>
      </div>
      <div class="send-box__bottom">
        <div class="send-box__bottom--textarea">
          <textarea
            v-model="inputValue"
            id="textareaChat"
            ref="textarea"
            :placeholder="
              showTabType == 'qa'
                ? $t('chat.chat_1066')
                : showTabType == 'private'
                ? $t('chat.chat_1045')
                : $t('webinar.webinar_1011')
            "
            :rows="3"
            maxlength="140"
            @blur="handleOnBlur"
          ></textarea>
          <div v-if="showEmoji" class="send-box__bottom--emoji">
            <div>
              <img
                :src="item.src"
                @click.stop="inputEmoji(item)"
                v-for="item in faceArr"
                :key="item.value"
              />
            </div>
          </div>
        </div>
        <div class="send-box__bottom--limit">
          <i
            class="vh-iconfont vh-line-expression"
            @click="showEmoji = !showEmoji"
            title="表情"
          ></i>
          <span class="send-box__bottom--reset-text">
            <i>{{ inputValue.length }}</i>
            /
            <i>140</i>
          </span>
        </div>
      </div>
    </div>
  </van-popup>
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
        window.document.body.scrollTop = '0px';
        window.document.activeElement.scrollIntoViewIfNeeded(true);
        window.scroll(0, 0);
      },
      //选中表情
      inputEmoji(item = {}) {
        this.inputValue += item.name;
        this.showEmoji = false;
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-wap-input-modal {
    border-radius: 8px;
    overflow: hidden;
    z-index: 9997 !important;
  }
  .vmp-chat-wap-input-modal__send-box {
    width: 620px;
    height: 440px;
    background-color: #fff;
    .send-box__top {
      width: 100%;
      height: 80px;
      line-height: 80px;
      background: #efefef;
      padding: 0 36px;
      text-align: center;
      &--send-btn {
        color: #fb3a32;
        font-size: 28px;
        float: right;
      }
      &--cancel-btn {
        float: left;
        color: #555555;
        font-size: 28px;
      }
      &--title {
        color: #222222;
        font-size: 32px;
      }
    }
    .send-box__bottom {
      width: 100%;
      height: 360px;
      position: relative;
      display: flex;
      flex-direction: column;
      &--textarea {
        flex: 1;
        padding: 30px;
        position: relative;
        max-height: 280px;
        overflow-y: auto;
        textarea {
          display: inline-block;
          width: 100%;
          height: 100%;
          font-size: 28px;
          line-height: 40px;
          color: #333333;
          background-image: none;
          border: none;
          -webkit-appearance: none;
        }
      }
      &--emoji {
        position: absolute;
        width: 100%;
        height: 100%;
        padding: 10px;
        box-sizing: border-box;
        left: 0;
        bottom: 0;
        overflow-y: scroll;
        background-color: #fff;
        img {
          width: 48px;
          height: 48px;
          margin: 6px;
          float: left;
        }
      }
      &--limit {
        padding: 20px 30px;
        display: flex;
        height: 80px;
        align-items: center;
        justify-content: space-between;
        color: #555;
        .vh-iconfont {
          color: #797979;
          font-size: 42px;
        }
      }
      &--reset-text {
        color: #555555;
        line-height: 40px;
      }
    }
  }
</style>
