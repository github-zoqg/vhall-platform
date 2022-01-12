<template>
  <div class="vmp-chat-input">
    <div class="vmp-chat-input__textarea-box" v-show="!inputStatus.disable && !chatLoginStatus">
      <textarea
        id="chat-textarea"
        ref="chatTextarea"
        v-model="inputValue"
        :placeholder="placeholder"
        rows="1"
        class="textarea-box__textarea"
        @input="inputHandle"
        @keydown.stop="onkeydownHandle($event)"
        @keyup.stop="onKeyUpHandle($event)"
        @keyup.delete="onDeleteHandle"
      ></textarea>
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
      class="vmp-chat-input__textarea-placeholder"
    >
      <span v-show="chatLoginStatus" class="textarea-placeholder_no-login">
        <span class="chat-login-btn" @click="callLogin">登录</span>
        后参与聊天
      </span>
      <span v-show="inputStatus.disable && !chatLoginStatus" class="textarea-placeholder_no-login">
        {{ inputStatus.placeholder }}
      </span>
    </div>

    <div class="vmp-chat-input__send-btn-box">
      <div class="vmp-chat-input__send-btn" @click="sendMsgThrottle">
        <i class="icon iconfont iconfasong_icon"></i>
      </div>
    </div>
  </div>
</template>

<script>
  import OverlayScrollbars from 'overlayscrollbars';
  import { useChatServer, useRoomBaseServer } from 'middleDomain';
  export default {
    name: 'VmpChatInput',
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
        placeholder: '参与聊天',
        //字数限制
        inputMaxLength: 140,
        //显示字数限制提示
        showWordLimit: true,
        //聊天里临时选择的图片
        imgUrls: [],
        //回复消息
        replyMsg: {}
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
      }
    },
    watch: {
      replyMsg() {
        if (Object.keys(this.replyMsg || {}).length == 0) {
          this.inputValue = this.trimPlaceHolder('reply');
        } else {
          this.inputValue = this.inputValue
            ? `回复${this.replyMsg.nickName}: ${this.trimPlaceHolder('reply')}`
            : `回复${this.replyMsg.nickName}: `;
        }
      },
      inputValue(newValue) {
        if (!newValue) {
          this.replyMsg = {};
        }
      }
    },
    beforeCreate() {
      this.chatServer = useChatServer();
    },
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
        const chatOldTextareaHeight = this.$refs.chatTextarea.style.height;
        // 最大字数限制 140
        if (this.inputValue.length > 140) {
          this.inputValue = this.inputValue.substring(0, 140);
        }
        setTimeout(() => {
          this.$nextTick(() => {
            const chatTextareaHeight = this.$refs.chatTextarea.style.height;
            if (chatOldTextareaHeight !== chatTextareaHeight) {
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
              this.showLimit = chatTextAreaHeight > 40;

              this.$emit('inputHeightChange');
            }
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
          const nickName = userName.replace('@', '');
          // 删除整个@过的用户名逻辑
          if (this.atList.find(u => u.nickName === nickName)) {
            let tempList = this.atList.filter(n => n.nickName !== nickName);
            this.atList.splice(0, this.atList.length, ...tempList);
            this.inputValue = this.inputValue.replace(userName, '');
          } else {
            let tempList = this.atList.filter(a => {
              const atIndex = this.inputValue.indexOf(`@${a.nickName} `);
              return atIndex !== -1;
            });
            this.atList.splice(0, this.atList.length, ...tempList);
          }
        }
        // 删除要回复的用户名逻辑
        const lastReplyIndex = firstPart.lastIndexOf('回复');
        if (lastReplyIndex !== -1) {
          const replyUserName = this.inputValue.substring(lastReplyIndex, currentIndex);
          if (`回复${this.replyMsg.nickName}:` === replyUserName) {
            this.inputValue = this.inputValue.replace(replyUserName, '');
            this.replyMsg = {};
          } else {
            this.inputValue.indexOf(`回复${this.replyMsg.nickName}: `) === -1 &&
              (this.replyMsg = {});
          }
        }
      },
      /** 发送聊天消息 */
      sendMsg(callback) {
        this.sendTimeOut && window.clearTimeout(this.sendTimeOut);

        //是否是聊天禁言状态
        if (this.inputStatus.disable) {
          return;
        }
        //获取一下子组件里上传的图片
        this.getUploadImg();
        const inputValue = this.trimPlaceHolder('reply');
        //判断是否有输入内容，或者上传图片
        if ((!inputValue || (inputValue && !inputValue.trim())) && !this.imgUrls.length) {
          return this.$message.warning('内容不能为空');
        }

        const { checkHasKeyword, sendMsg } = this.chatServer;
        const joinDefaultName = JSON.parse(sessionStorage.getItem('moduleShow'))
          ? JSON.parse(sessionStorage.getItem('moduleShow')).auth.nick_name
          : '';

        this.sendTimeOut = setTimeout(() => {
          const data = {};
          if (inputValue) {
            data.type = 'text';
            data.barrageTxt = inputValue
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\n/g, '<br/>');
            data.text_content = inputValue;
          }
          //如果有聊天图片
          if (this.imgUrls.length) {
            data.image_urls = this.imgUrls;
            data.type = 'image';
          }
          //todo 考虑从domain里取用
          const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
          console.warn('获取当前的本地用户信息', userInfo);
          let name = '';
          if (userInfo) {
            if (userInfo.nickname) {
              name = userInfo.nickname;
            } else {
              name = userInfo.nick_name;
            }
          } else {
            name = joinDefaultName;
          }
          //获取发消息的用户的用户昵称
          if (this.roleName === 2 && this.join_name) {
            name = this.join_name;
          }
          //消息内容
          const context = {
            nickname: name, // 昵称
            avatar: userInfo && userInfo.avatar ? userInfo.avatar : '', // 头像
            role_name: this.roleName, // 角色 1主持人2观众3助理4嘉宾
            replyMsg: this.replyMsg, // 回复消息
            atList: this.atList // @用户列表
          };

          //判断一下是否是分组讨论的组长
          const { groupInitData = {} } = this.roomBaseState;
          if (groupInitData.isInGroup && groupInitData.join_role == 20) {
            context.role_name = 20;
          }

          let filterStatus = true;
          if (sessionStorage.getItem('watch')) {
            filterStatus = checkHasKeyword(inputValue);
          }

          if (this.roleName !== 2 || (this.roleName === 2 && filterStatus)) {
            if (this.atList.length && data.text_content) {
              this.atList.forEach(a => {
                data.text_content = data.text_content.replace(`@${a.nickName}`, `***${a.nickName}`);
              });
            }

            sendMsg({ data, context });
          }
          //清空一下子组件里上传的图片
          this.clearImgUrls();
          this.inputValue = '';
          this.replyMsg = {};
          //todo 建议移入domain  清空一下@列表，但是保持引用
          this.atList.splice(0, this.atList.length);
          callback && callback();
        }, 300);
      },
      /** 发送聊天消息节流 */
      sendMsgThrottle() {
        //如果没有登录，则不能发消息
        if (this.chatLoginStatus) {
          return;
        }
        if (this.roleName !== 2) {
          this.sendMsg();
          return;
        }
        if (this.chatGap > 0) {
          this.lock = sessionStorage.getItem('chatLock');
          if (this.lock && this.lock == 'true') {
            this.$message.warning(`当前活动火爆，请您在${this.chatGap}秒后再次发言`);
          }
        } else {
          this.sendMsg(() => {
            this.chatGapInterval && window.clearInterval(this.chatGapInterval);
            this.lock = sessionStorage.getItem('chatLock');
            this.chatGap = this.delayTime(this.onlineUsers);
            this.chatGapInterval = window.setInterval(() => {
              if (this.chatGap > 0) {
                if (!this.lock || this.lock == 'false') {
                  sessionStorage.setItem('chatLock', true);
                } else {
                  this.$message.warning(`太频繁啦，还有${this.chatGap}秒后才能发送`);
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
      //todo 利用信令 唤起登录
      callLogin() {},
      //选择了表情,这个方法是通过ref暴露给父组件使用
      emojiInput(val = '') {
        if (this.inputStatus.disable) {
          return;
        }
        this.inputValue += val;
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
      atUser(accountId) {
        this.replyMsg = {};
        const msgToAt =
          this.chatList.find(chatMsg => {
            return chatMsg.sendId == accountId;
          }) || {};
        if (!this.atList.find(u => u.accountId == msgToAt.sendId)) {
          this.inputValue = this.trimPlaceHolder() + `@${msgToAt.nickName} `;
          this.$refs.chatTextarea.focus();
          let currentIndex = 0;
          try {
            currentIndex = this.$refs.chatTextarea['selectionStart'] || 0;
          } catch (e) {
            console.log(e);
          }
          this.atList.push({
            nickName: msgToAt.nickName,
            accountId: msgToAt.sendId,
            index: currentIndex
          });
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-input {
    @bg-dark-normal: #1a1a1a;
    @font-dark-normal: #e6e6e6;
    @font-dark-second: #666666;
    // 错误提示字体颜色
    @font-error: #fb3a32;
    // 链接字体颜色
    @font-link: #3562fa;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    &__textarea-box {
      width: 220px;
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
      background-color: @bg-dark-normal;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: @font-dark-normal;
      line-height: 20px;
      padding: 10px 12px;
      text-align: center;
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
      .iconfasong_icon {
        font-size: 18px;
        color: #e6e6e6;
      }
    }
  }
</style>
