<template>
  <div class="vmp-chat-wap-msg-item" style="pointer-events: auto">
    <!-- 发起抽奖 -->
    <template
      v-if="
        msg.type == 'lottery_push' ||
        msg.type == 'question_answer_open' ||
        msg.type == 'question_answer_close'
      "
    >
      <div class="msg-item interact">
        <div class="interact-msg">{{ msg.content.text_content }}</div>
      </div>
    </template>
    <!-- 抽奖结果 -->
    <template v-else-if="msg.type == 'lottery_result_notice'">
      <div class="msg-item interact">
        <div class="interact-msg" @tap="checkLotteryDetail($event, msg)">
          {{ msg.content.text_content }}
          <template v-if="msg.content.Show">
            点击
            <span class="highlight">查看详情</span>
          </template>
        </div>
      </div>
    </template>
    <!-- 收到问卷 -->
    <template v-else-if="msg.type == 'questionnaire_push'">
      <div class="msg-item interact">
        <div class="interact-msg" @tap="checkQuestionDetail(msg.content.questionnaire_id)">
          1{{ msg.content.text_content }}，点击
          <span class="highlight">查看问卷</span>
        </div>
      </div>
    </template>
    <!-- 打赏 -->
    <template v-else-if="msg.type == 'reward_pay_ok'">
      <div class="msg-item interact new-gift" :class="Math.random() * 10 > 3 ? 'purpose' : 'red'">
        <div class="interact-gift-box">
          <p class="new-gift-name ellsips">
            {{ msg.nickName | textOverflowSlice(10) }}
          </p>
          <p class="new-gift-content">
            打赏{{ msg.content.num }}元,{{ msg.content.text_content | textOverflowSlice(6) }}
          </p>
        </div>
        <img class="new-award-img" src="../images/red-package.png" />
      </div>
    </template>
    <!-- 送礼物 -->
    <template v-else-if="msg.type == 'gift_send_success' || msg.type == 'free_gift_send'">
      <div
        v-if="msg.content.gift_name"
        class="msg-item interact new-gift"
        :class="Math.random() * 10 > 3 ? 'purpose' : 'red'"
      >
        <div class="interact-gift-box">
          <p class="new-gift-name ellsips">
            {{ msg.nickName | textOverflowSlice(10) }}
          </p>
          <p class="new-gift-content">
            送出一个 {{ msg.content.gift_name | textOverflowSlice(10) }}
          </p>
        </div>
        <img class="new-gift-img" :src="msg.content.gift_url" />
      </div>
    </template>
    <!-- 聊天消息 -->
    <template v-else>
      <div v-if="msg.showTime" class="msg-showtime">{{ msg.showTime }}</div>
      <div class="msg-item">
        <div class="avatar-wrap">
          <img class="chat-avatar" width="35" height="35" :src="msg.avatar" alt />
        </div>
        <div class="msg-content">
          <p class="msg-content_name">
            <span
              v-if="msg.roleName && msg.roleName != '2'"
              class="role"
              :class="msg.roleName | roleClassFilter"
            >
              {{ msg.roleName | roleFilter }}
            </span>
            <span class="nickname">{{ msg.nickname }}</span>
          </p>
          <!-- 图文消息 -->
          <div class="msg-content_body_pre">
            <!-- 回复消息 -->
            <template v-if="msg.replyMsg && msg.replyMsg.type && msg.atList.length == 0">
              <p class="reply-msg">
                <span v-html="msg.replyMsg.nick_name" />
                ：
                <span v-html="msg.replyMsg.content.text_content" />
              </p>
              <div class="msg-content_body">
                <span class="reply-color">回复：</span>
                <span v-html="msg.content.text_content"></span>
                <img
                  @tap="$emit('preview', img)"
                  class="msg-content_chat-img"
                  width="50"
                  height="50"
                  v-for="(img, index) in msg.content.image_urls"
                  :key="index"
                  :src="img + '?x-oss-process=image/resize,m_lfit,h_150,w_150'"
                  :alt="'聊天图片加载失败'"
                />
                <img class="jian-left" :src="jiantou" alt />
              </div>
            </template>
            <!-- @消息 -->
            <template v-if="msg.atList.length != 0">
              <div class="msg-content_body">
                <span v-html="msgContent"></span>
                <img
                  @tap="$emit('preview', img)"
                  class="msg-content_chat-img"
                  width="50"
                  height="50"
                  v-for="(img, index) in msg.content.image_urls"
                  :key="index"
                  :src="img + '?x-oss-process=image/resize,m_lfit,h_150,w_150'"
                  :alt="'聊天图片加载失败'"
                />
                <img class="jian-left" :src="jiantou" alt />
              </div>
            </template>
            <!-- 正常消息 -->
            <template v-if="!Object.keys(msg.replyMsg || {}).length && !msg.atList.length">
              <div class="msg-content_body">
                <span class="reply-color"></span>
                <span v-html="msg.content.text_content" style="display: block"></span>
                <img
                  @tap="$emit('preview', img)"
                  class="msg-content_chat-img"
                  width="50"
                  height="50"
                  v-for="(img, index) in msg.content.image_urls"
                  :key="index"
                  :src="img + '?x-oss-process=image/resize,m_lfit,h_150,w_150'"
                  :alt="'聊天图片加载失败'"
                />
                <img class="jian-left" :src="jiantou" alt />
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
  export default {
    props: {
      msg: {
        required: true,
        default: () => ({})
      }
    },
    data() {
      return {
        msgContent: '',
        jiantou: require('../images/jiantou.png')
      };
    },
    filters: {
      //角色转换
      roleFilter(value) {
        let ret = '';
        switch (Number(value)) {
          case 1:
            ret = '主持人';
            break;
          case 3:
            ret = '助理';
            break;
          case 4:
            ret = '嘉宾';
            break;
          case 20:
            ret = '组长';
            break;
          default:
            ret = '未定义';
        }
        return ret;
      },
      //角色标签样式
      roleClassFilter(value) {
        //主持人
        if ([1, '1'].includes(value)) {
          return 'host';
        }
        //助理
        if ([3, '3'].includes(value)) {
          return 'assistant';
        }
        //游客
        return 'guest';
      },
      //消息里的角色样式
      roleClassFilterForMsg(value) {
        //主持人
        if ([1, '1'].includes(value)) {
          return 'host';
        }
        //助理
        if ([3, '3'].includes(value)) {
          return 'assistant';
        }
        //游客
        if ([4, '4'].includes(value)) {
          return 'guest';
        }
        return '';
      },
      //文字过长截取
      textOverflowSlice(val = '', len = 0) {
        if (['', void 0, null].includes(val) || ['', void 0, null].includes(len)) {
          return '';
        }
        if (val.length > len) {
          return val.substring(0, len) + '...';
        }
        return val;
      }
    },
    mounted() {
      this.handleAt();
    },
    methods: {
      // 点击查看抽奖信息
      //todo 信令替代
      checkLotteryDetail(e, msg) {
        console.log(e, msg);
        // EventBus.$emit('checkLotteryDetail', msg);
      },
      // 点击查看问卷
      //todo 信令替代
      checkQuestionDetail(questionnaire_id) {
        console.log(questionnaire_id);
        // EventBus.$emit('checkQuestionDetail', questionnaire_id);
      },
      //处理@消息
      handleAt() {
        //todo 可以考虑domaint提供统一的处理 实现@用户
        if (!this.msg.atList.length) {
          this.msgContent = this.msg.content.text_content;
        } else {
          let at = false;
          this.msg.atList.forEach(a => {
            console.log('atList', a.nick_name);
            console.log(this.msg.atList.length);
            const userName = `@${a.nick_name} `;
            const match =
              this.msg.content &&
              this.msg.content.text_content &&
              this.msg.content.text_content.indexOf(userName) != -1;
            console.log(match);
            if (match) {
              if (at) {
                this.msgContent = this.msgContent.replace(
                  userName,
                  `<span style='color:#4DA1FF'>${userName}</span>`
                );
              } else {
                this.msgContent = this.msg.content.text_content.replace(
                  userName,
                  `<span style='color:#4DA1FF'>${userName}</span>`
                );
              }
              at = true;
            } else {
              this.msgContent = at ? this.msgContent : this.msg.content.text_content;
            }
          });
        }
        if (
          this.msg.atList &&
          this.msg.atList.find(u => this.joinInfo.third_party_user_id == u.accountId) &&
          !this.msg.isHistoryMsg
        ) {
          this.$emit('dispatchEvent', { type: 'scrollElement', el: this.$el });
          clearTimeout(this.tipTimer);
          this.tipTimer = setTimeout(() => {
            this.$emit('dispatchEvent', { type: 'closeTip' });
          }, 10000);
        }
        if (this.msg.replyMsg && this.msg.replyMsg.content && !this.msg.isHistoryMsg) {
          this.$emit('dispatchEvent', { type: 'replyMsg', el: this.$el, msg: this.msg.replyMsg });
          clearTimeout(this.tipTimer);
          this.tipTimer = setTimeout(() => {
            this.$emit('dispatchEvent', { type: 'closeTip' });
          }, 10000);
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-chat-wap-msg-item {
    pointer-events: auto;
    .msg-showtime {
      padding: 15px 0 5px;
      font-size: 24px;
      color: #888888;
      text-align: center;
    }
    .msg-item {
      margin: 0 30px;
      padding: 10px 0;
      display: flex;
      align-items: flex-start;
      .avatar-wrap {
        position: relative;
        margin-right: 10px;
        .chat-avatar {
          border-radius: 50%;
          display: block;
          border: 2px solid #e3e3e3;
          object-fit: contain;
        }
        .chat-phone {
          position: absolute;
          right: 0;
          bottom: 0;
        }
      }
      .msg-content {
        flex: 1;
        margin-left: 10px;
        .msg-content_name {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          height: 34px;
          .nickname {
            font-size: 22px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            word-break: break-all;
            color: #666666;
            max-width: 300px;
            line-height: 34px;
          }
          .role {
            margin-right: 10px;
            padding: 0 10px;
            line-height: 34px;
            border-radius: 50px;
            font-size: 20px;
            &.host {
              background-color: rgba(252, 86, 89, 0.2);
              color: #fc5659;
            }
            &.assistant {
              background-color: rgba(166, 166, 166, 0.2);
              color: #a6a6a6;
            }
            &.guest {
              background-color: rgba(77, 161, 255, 0.2);
              color: #4da1ff;
            }
          }
        }
        .msg-content_body_pre {
          position: relative;
          .jian-left {
            width: 11px;
            height: 18px;
            position: absolute;
            left: -11px;
            top: 14px;
          }
        }
        .reply-color {
          color: #4da1ff;
          float: left;
        }
        .reply-msg {
          line-height: 40px;
          margin: 8px 0;
          color: #999;
          padding-left: 10px;
        }
        .msg-content_body {
          position: relative;
          display: inline-block;
          margin-top: 5px;
          padding: 18px 20px;
          word-break: break-all;
          color: #444444;
          line-height: 36px;
          background-color: #f7f7f7;
          border-radius: 8px;
          span {
            word-break: break-word;
          }
        }
        .msg-content_chat-img-wrapper {
          .msg-content_chat-img {
            float: left;
            margin-right: 8px;
            margin-top: 8px;
            &:first-child {
              margin-left: 8px;
            }
          }
        }
        .emoji-img {
          width: 24px;
          height: 24px;
        }
      }
      &.interact {
        justify-content: center;
      }
      .interact-msg {
        padding: 20px 60px;
        position: relative;
        border-width: 0;
        input {
          background-color: transparent;
          position: relative;
          z-index: 1;
        }
        &::after {
          content: ' ';
          width: 200%;
          height: 200%;
          position: absolute;
          top: 0;
          left: 0;
          border: 1px solid #d2d2d2;
          transform: scale(0.5);
          transform-origin: 0 0;
          box-sizing: border-box;
          border-radius: 500px;
        }
        color: #444444;
        p {
          text-align: center;
          line-height: 1;
        }
        .highlight {
          padding-left: 10px;
          color: #007aff;
        }
        .reward-text {
          margin-top: 13px;
        }
      }
    }
    .new-gift {
      padding-left: 0;
      width: 350px;
      margin-top: 26px;
      height: 72px;
      border-top-left-radius: 36px;
      border-bottom-left-radius: 36px;
      position: relative;
      &.interact {
        justify-content: unset;
      }
      &.purpose {
        background: linear-gradient(221deg, rgba(184, 58, 244, 0) 0%, #6950fb 100%);
      }
      &.red {
        background: linear-gradient(227deg, rgba(255, 137, 96, 0) 0%, #ff6267 100%);
      }
      .interact-gift-box {
        padding-left: 24px;
        margin-right: 10px;
        text-align: left;
        width: 100%;
        display: inline-block;
        border: none;
        p {
          text-align: left;
          font-weight: 400;
          color: #ffffff;
        }
        .new-gift-name {
          font-size: 24px;
          width: 240px;
          line-height: 28px;
          padding-left: 8px;
          margin-bottom: 6px;
        }
        .new-gift-content {
          font-size: 18px;
          transform: scale(0.9);
          line-height: 22px;
          margin-left: -4px;
        }
      }
      .new-gift-img,
      .new-award-img {
        position: absolute;
        right: -36px;
        bottom: 0;
        display: inline-block;
        width: 74px;
        height: 74px;
        border-radius: 40px;
        border: 1px solid #f7f7f7;
        background: #f7f7f7;
        object-fit: scale-down;
      }
    }
  }
</style>
