<template>
  <div class="c-msg-item">
    <!--消息发送时间-->
    <div v-if="msg.showTime" class="msg-item-showtime">{{ msg.showTime }}</div>
    <!--消息主体-->
    <div :class="['msg-item', msg.type]">
      <template v-if="['welcome_msg'].includes(msg.type)">
        <div v-if="msg.nickName !== '' && msg.content !== ''" class="welcome-msg">
          <span>{{ msg.nickName }}</span>
          {{ msg.content }}
        </div>
      </template>

      <template v-if="['reward_pay_ok'].includes(msg.type)">
        <div class="msg-reward gift" :class="Math.random() * 10 > 1 ? 'purpose' : 'red'">
          <p>
            <span class="user-name">{{ msg.nickName | filterName }}</span>
            <span class="gift-name">
              打赏{{ msg.content.num }}元,{{ msg.content.text_content | filterContext }}
            </span>
            <img
              class="award-img"
              style="display: block; width: 32px; height: 38px"
              src="../images/red-package.png"
              alt
            />
          </p>
        </div>
      </template>

      <template v-if="['gift_send_success', 'free_gift_send'].includes(msg.type)">
        <div class="msg-reward gift" :class="Math.random() * 10 > 1 ? 'purpose' : 'red'">
          <p>
            <span class="user-name">{{ msg.nickName | filterName }}</span>
            <span class="gift-name">送出一个{{ msg.content.gift_name | filterName }}</span>
            <img class="gift-img" :src="msg.content.gift_url" alt />
          </p>
        </div>
      </template>

      <template
        v-if="
          !['welcome_msg', 'reward_pay_ok', 'gift_send_success', 'free_gift_send'].includes(
            msg.type
          )
        "
      >
        <div class="avatar-wrap" @click="setPersonStatus($event, msg)">
          <img class="chat-avatar" width="26" height="26" :src="msg.avatar" alt />
          <img
            v-if="msg.client === 'mobile'"
            class="chat-phone"
            width="9"
            height="12"
            src="../images/phone.png"
            alt
          />
        </div>
        <div class="msg-content">
          <p class="msg-content_name">
            <span class="nickname" @click="setPersonStatus($event, msg)">{{ msg.nickName }}</span>
            <template v-if="['text', 'image'].includes(msg.type)">
              <span
                v-if="msg.roleName && msg.roleName != '2'"
                class="role"
                :class="msg.roleName | roleClassFilter"
              >
                {{ msg.roleName | roleFilter }}
              </span>
            </template>
          </p>
          <!-- 图文消息 -->
          <template v-if="['text', 'image'].includes(msg.type)">
            <p
              v-if="msg.replyMsg && msg.replyMsg.content && msg.replyMsg.content.text_content"
              class="replymsg-content_body"
              v-html="
                `${msg.replyMsg.nickName || msg.replyMsg.nick_name} : ${
                  msg.replyMsg.content.text_content
                }`
              "
            ></p>
            <p
              v-if="msg.replyMsg && msg.replyMsg.content && msg.replyMsg.content.image_urls"
              class="msg-content_chat-img-wrapper reply-msg"
              :style="msg.replyMsg.content.text_content && 'margin-top:-3px;'"
            >
              <span
                v-if="!msg.replyMsg.content.text_content"
                style="color: #dddddd; vertical-align: middle"
              >
                {{ msg.replyMsg.nickName }}:
              </span>
              <img
                @click="previewImg($event, index, msg.replyMsg.content.image_urls)"
                class="msg-content_chat-img"
                width="34"
                height="34"
                v-for="(img, index) in msg.replyMsg.content.image_urls"
                :key="index"
                :src="img + '?x-oss-process=image/resize,m_lfit,h_34,w_34'"
                alt="聊天图片加载失败"
              />
            </p>
            <p
              v-if="msg.content.text_content"
              class="msg-content_body"
              v-html="
                msg.replyMsg && msg.replyMsg.content
                  ? `<span style='color:#4DA1FF;'>回复:</span> ${this.msgContent}`
                  : this.msgContent
              "
            ></p>
            <p v-if="msg.content.image_urls" class="msg-content_chat-img-wrapper">
              <span
                v-if="msg.replyMsg && msg.replyMsg.content && !msg.content.text_content"
                style="color: #4da1ff; vertical-align: middle"
              >
                回复:
              </span>
              <img
                @click="previewImg($event, index, msg.content.image_urls)"
                class="msg-content_chat-img"
                width="34"
                height="34"
                v-for="(img, index) in msg.content.image_urls"
                :key="index"
                :src="img + '?x-oss-process=image/resize,m_lfit,h_34,w_34'"
                alt="聊天图片加载失败"
              />
            </p>
          </template>
          <!-- 抽奖消息 开启问答 关闭问答-->
          <template v-if="checkMsgType(msg.type)">
            <p class="msg-content_body system">{{ msg.content.text_content }}</p>
          </template>
          <!-- 中奖消息 -->
          <template v-if="msg.type === 'lottery_result_notice'">
            <p class="msg-content_body system">
              {{ msg.content.text_content }}
              <span
                v-if="msg.content.Show"
                class="lottery-check"
                @click="lotteryCheck($event, msg.content)"
              >
                点击查看
              </span>
            </p>
          </template>
          <!-- 推送问卷 -->
          <template v-if="msg.type === 'questionnaire_push'">
            <p class="msg-content_body system">
              {{ msg.content.text_content }}
              <span
                v-if="msg.roleName == '2'"
                class="lottery-check"
                @click="questionnaireCheck(msg.content.questionnaire_id)"
              >
                点击查看
              </span>
            </p>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
  import EventBus from '../js/Events.js';
  export default {
    name: 'msgItem',
    props: {
      msg: {
        required: true,
        default() {
          return {};
        }
      },
      roleName: {
        required: true
      }
    },
    data() {
      return {
        msgContent: ''
      };
    },
    computed: {
      //检查是否是抽奖消息 开启问答 关闭问答
      checkMsgType() {
        const mapList = [
          'lottery_push',
          'question_answer_open',
          'question_answer_close',
          'sign_in_push',
          'sign_end',
          'timer_start',
          'timer_end',
          'timer_pause',
          'timer_reset',
          'timer_resume'
        ];
        return function (type) {
          return mapList.some(val => val === type);
        };
      }
    },
    filters: {
      filterName(val) {
        if (val && val.length > 8) {
          return val.substr(0, 8) + '...';
        } else {
          return val;
        }
      },
      filterContext(val) {
        if (val && val.length > 6) {
          return val.substr(0, 6) + '...';
        } else {
          return val;
        }
      },
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
      roleClassFilter(value) {
        return value == '1' ? 'host' : value == '3' ? 'assistant' : 'guest';
      }
    },
    mounted() {
      // 实现@用户
      if (!this.msg.atList.length) {
        this.msgContent = this.msg.content.text_content;
      } else {
        let at = false;
        this.msg.atList.forEach(a => {
          const userName = `@${a.nickName} `;
          const match =
            this.msg.content &&
            this.msg.content.text_content &&
            this.msg.content.text_content.indexOf(userName) != -1;
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
      const userInfo = JSON.parse(sessionStorage.getItem('user'));
      if (
        this.msg.atList &&
        this.msg.atList.find(u => userInfo.third_party_user_id == u.accountId) &&
        !this.msg.isHistoryMsg
      ) {
        EventBus.$emit('scrollElement', this.$el);
        clearTimeout(this.tipTimer);
        this.tipTimer = setTimeout(() => {
          EventBus.$emit('closeTip');
        }, 10000);
      }
      if (this.msg.replyMsg && this.msg.replyMsg.content && !this.msg.isHistoryMsg) {
        EventBus.$emit('replyMsg', { el: this.$el, msg: this.msg.replyMsg });
        clearTimeout(this.tipTimer);
        this.tipTimer = setTimeout(() => {
          EventBus.$emit('closeTip');
        }, 10000);
      }
    },
    methods: {
      // 点击查看抽奖信息
      lotteryCheck(e, content) {
        content.msg.chat = true;
        this.$emit('lotteryCheck', content.msg, content.userId);
      },
      // 点击查看问卷信息
      questionnaireCheck(questionnaire_id) {
        this.$emit('questionnaireCheck', questionnaire_id);
      },
      // 预览图片
      previewImg(e, index, imgs) {
        this.$emit('previewImg', index, imgs);
      },
      setPersonStatus(event, msg) {
        if (!msg.sendId) {
          return;
        }
        // 嘉宾和助理只能操作观众
        if ((this.roleName == 3 || this.roleName == 4) && msg.roleName != 2) {
          EventBus.$emit(
            'tangram_set_person_status_in_chat',
            event.target,
            msg.sendId,
            msg.count,
            msg.nickName,
            false,
            msg.roleName
          );
          return;
        }
        // 观众不能操作
        if (this.roleName == 2) {
          return;
        }
        EventBus.$emit(
          'tangram_set_person_status_in_chat',
          event.target,
          msg.sendId,
          msg.count,
          msg.nickName,
          true,
          msg.roleName
        );
      }
    }
  };
</script>
<style lang="less">
  .c-msg-item {
    pointer-events: auto;
    .msg-item-showtime {
      padding: 0 0 12px 0;
      font-size: 12px;
      color: #888888;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .welcome-msg {
      width: 270px;
      padding: 6px 10px 7px 10px;
      border-radius: 30px;
      background-color: #202020;
      text-align: center;
      color: #bcbcbc;
      font-size: 12px;
      box-sizing: border-box;
      margin: 0 auto 12px auto;
      span {
        color: #4da1ff;
        display: inline-block;
        width: 70px;
        overflow: hidden;
        height: 16px;
        line-height: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
      }
    }
    .msg-item {
      margin: 0 10px 0 12px;
      padding: 0 0 12px 0;
      display: flex;
      align-items: center;
      .avatar-wrap {
        position: relative;
        overflow: hidden;
        margin-right: 10px;
        align-self: flex-start;
        cursor: pointer;
        .chat-avatar {
          border-radius: 50%;
          display: block;
          border: 1px solid rgba(221, 221, 221, 0.3);
        }
        .chat-phone {
          position: absolute;
          right: 0;
          bottom: 0;
        }
      }
      .msg-content {
        font-size: 12px;
        flex: 1;
        color: #fff;
        .msg-content_name {
          display: flex;
          align-items: center;
          margin-bottom: 1px;
          .nickname {
            color: #999999;
            word-break: break-all;
            max-width: 108px;
            margin-right: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 17px;
            cursor: pointer;
          }
          .role {
            text-align: center;
            padding: 1px 7px;
            line-height: 17px;
            border-radius: 30px;
            font-size: 10px;
            &.host {
              background-color: rgba(252, 86, 89, 0.15);
              color: #fc5659;
            }
            &.assistant {
              background-color: rgba(166, 166, 166, 0.15);
              color: #a6a6a6;
            }
            &.guest {
              background-color: rgba(77, 161, 255, 0.15);
              color: #4da1ff;
            }
          }
        }
        .msg-content_body {
          word-break: break-all;
          color: #dddddd;
          line-height: 18px;
          font-size: 12px;
          margin-top: 3px;
          &.system {
            color: #ffffff;
            .lottery-check {
              color: #fc5659;
              cursor: pointer;
            }
          }
        }
        .replymsg-content_body {
          word-break: break-all;
          color: #dddddd;
          line-height: 18px;
          font-size: 12px;
          border-radius: 3px;
          background: #2d2d2d;
          min-height: 30px;
          padding-left: 5px;
          padding-top: 6px;
          padding-bottom: 6px;
          box-sizing: border-box;
          margin-top: 2px;
        }
        .msg-content_chat-img-wrapper {
          &.reply-msg {
            padding: 3px;
            padding-left: 5px;
            border-radius: 3px;
            background: #2d2d2d;
          }
          // margin-left: -8px;
          padding-top: 8px;
          .msg-content_chat-img {
            vertical-align: middle;
            margin-right: 8px;
            cursor: pointer;
          }
        }
        .emoji-img {
          width: 24px;
          height: 24px;
        }
      }
      .msg-reward {
        min-width: 190px;
        height: 44px !important;
        border-top-left-radius: 22px;
        border-bottom-left-radius: 22px;
        color: #eee;
        background: #202020;
        box-sizing: border-box;
        padding: 4px 15px;
        position: relative;
        font-size: 12px;

        &.purpose {
          background: linear-gradient(221deg, rgba(184, 58, 244, 0) 0%, #6950fb 100%);
        }

        &.red {
          background: linear-gradient(227deg, rgba(255, 137, 96, 0) 0%, #ff6267 100%);
        }

        .user-name,
        .gift-name {
          margin-top: 2px;
          display: block;
        }

        .gift-img,
        .award-img {
          display: inline-block;
          width: 40px !important;
          height: 40px !important;
          border-radius: 20px !important;
          position: absolute;
          top: 4px;
          right: -10px;
          object-fit: scale-down;
          background: #f7f7f7;
        }
        .award-img {
          border-radius: 0;
        }
        &.gift {
          height: auto;
        }
      }
      .msg-reward-pay {
        width: 100%;
        height: 44px !important;
        color: #eee;
        background: #202020;
        border-radius: 22px;
        box-sizing: border-box;
        padding: 7px 10px;
        position: relative;
        font-size: 12px;
        text-align: center;
        .name {
          color: rgb(77, 161, 255);
        }
        .red-bag {
          display: inline-block;
          width: 16px;
          height: 16px;
          background: url('../images/red.png') no-repeat center;
        }
      }
    }
  }
</style>
