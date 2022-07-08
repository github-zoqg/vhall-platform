<template>
  <div class="private-wrap clearFix">
    <div class="private-title">
      <p>
        <span class="title">私聊</span>
        <span class="nickname">
          {{ activeName || (userList[0] && userList[0].nickname) || '' }}
        </span>
      </p>
      <p class="private-head-close" @click="handleClosePrivate">
        <span></span>
      </p>
    </div>
    <div class="private-dom-wrap">
      <ul class="list-name">
        <li
          v-for="(ite, index) in userList"
          :key="index"
          :class="{ 'active-name': acrivePrivate == index }"
          @click="selectUser(ite, index)"
        >
          <span class="avatar-img">
            <img v-if="ite.avatar" class="private-avatar" :src="ite.avatar" alt="" />
            <img v-else class="private-avatar" src="../../images/answer_default.png" alt="" />
            <span
              v-show="acrivePrivate != index && newMessageIds[ite.account_id]"
              class="red-dot"
            ></span>
          </span>
          <span class="ellsips">
            {{ ite.nickname | overHidden(8) }}
          </span>
          <i @click.stop="closeUser(ite, index)" class="iconfont iconguanbichabo_icon close"></i>
        </li>
      </ul>
      <div class="list-content">
        <ul class="private-content">
          <li class="private-content-li" v-for="(item, index) in chatList" :key="index">
            <div class="private-content-li-content">
              <div>
                <img
                  v-if="
                    hostInfo && hostInfo.third_party_user_id == item.sender_id && hostInfo.avatar
                  "
                  :src="hostInfo.avatar"
                  alt=""
                />
                <img v-else-if="item.context && item.context.avatar" :src="item.context.avatar" />
                <img v-else src="../../images/answer_default.png" alt="" />
                <span
                  v-if="hostInfo && hostInfo.third_party_user_id == item.sender_id"
                  class="private-content-li-content-name ellsips"
                >
                  {{ hostInfo.nickname | overHidden(8) }}
                </span>
                <span v-else class="private-content-li-content-name ellsips">
                  {{ item.context.nick_name | overHidden(8) }}
                </span>
                <span
                  class="priveta-role"
                  v-if="item.context && item.context.role_name != 2"
                  :class="{
                    assistantRole: item.context.role_name == 4 || item.context.role_name == 3
                  }"
                >
                  {{ item.context.role_name | roleFilter }}
                </span>
              </div>
              <span class="private-content-li-content-time">
                {{ filterTime(item.create_time || item.date_time) }}
              </span>
            </div>
            <p
              class="main-content"
              v-html="(item.data && item.data.text_content) || item.text_content"
            ></p>
          </li>
        </ul>
        <div class="private-footer">
          <div class="emoji-wrap">
            <i class="iconfont iconbiaoqing" @click.stop="toggleEmoji"></i>
          </div>
          <div class="private-send-wrap">
            <div class="send-wrap-text">
              <el-input
                type="textarea"
                :rows="2"
                show-word-limit
                placeholder="说点什么吧..."
                v-model="privateValue"
              ></el-input>
              <span class="len-tip">
                <i
                  :class="{
                    normal: privateValue.length > 0 && privateValue.length < 200,
                    err: privateValue.length >= 200
                  }"
                >
                  {{ privateValue.length }}
                </i>
                /
                <i>200</i>
              </span>
            </div>
            <div class="send-wrap">
              <img src="../../images/sendmsg.png" class="send-btn" @click="privateSend" alt="" />
            </div>
          </div>
        </div>
        <!-- 表情选择 -->
        <div class="emoji-wrapper">
          <small-emoji ref="emoji" @emojiInput="emojiInput"></small-emoji>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { useRoomBaseServer, useQaServer } from 'middle-domain';
  import smallEmoji from '@/packages/chat/src/components/emoji.vue';
  import { textToEmoji, textToEmojiText } from '@/packages/chat/src/js/emoji';

  import Vue from 'vue';

  export default {
    components: {
      smallEmoji
    },
    props: ['userInfo', 'onlyChatMess', 'priteChatList', 'webinar_id'],
    data() {
      return {
        newMessageIds: {},
        hostInfo: {
          avatar: '',
          nickname: ''
        },
        acrivePrivate: 0, // 当前私聊对象
        activeName: '',
        privateValue: '', // 私聊内容
        chatList: [] // 获取到
      };
    },
    watch: {
      'privateValue.length': {
        handler(val) {
          const str = this.privateValue;
          if (val >= 200) {
            this.privateValue = str.substring(0, 200);
          } else {
            this.privateValue = str;
          }
        },
        immediate: true
      },
      onlyChatMess: {
        handler(newValue) {
          if (newValue && newValue.type) {
            this.$nextTick(async () => {
              const isFlag = this.userList.some((ele, index) => {
                this.acrivePrivate = index;
                return ele.account_id == newValue.item.account_id;
              });
              if (!isFlag) {
                if (newValue.item) {
                  newValue.user_id = newValue.item.account_id;
                }
                this.userList.push(newValue);
                this.acrivePrivate = this.userList.length - 1;
              }
              this.activeName = newValue.nickname;
              const _testData = await this.getDefaultContent(newValue.item.account_id);
              this.delCom(_testData);
            });
          }
        },
        deep: true,
        immediate: true
      }
    },
    computed: {
      filterTime() {
        return function (time) {
          return time;
        };
      },
      userList() {
        return this.priteChatList;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.qaServer = useQaServer();
    },
    beforeDestroy() {},
    mounted() {
      const sessionUser = sessionStorage.getItem('userInfo');
      const userInfo = sessionUser ? JSON.parse(sessionUser) : null;
      if (!userInfo) return;
      this.hostInfo = {
        avatar: userInfo.avatar,
        nickname: userInfo.nickname,
        third_party_user_id: userInfo.third_party_user_id
      };
      console.log(99999990, userInfo);
    },
    methods: {
      handleClosePrivate() {
        this.$emit('close');
        this.newMessageId = '';
      },
      scrollBottom() {
        try {
          this.$nextTick(() => {
            document.getElementsByClassName('private-content')[0].scrollTop =
              document.getElementsByClassName('private-content')[0].scrollHeight;
          });
        } catch (e) {
          console.warn(e);
        }
      },
      listener() {
        this.qaServer.chatInstance.onChat(msg => {
          this.onChatMsg(msg);
        });
      },
      //处理聊天消息
      onChatMsg(msg) {
        if (typeof msg !== 'object') {
          msg = JSON.parse(msg);
        }
        try {
          if (typeof msg.context !== 'object') {
            msg.context = JSON.parse(msg.context);
          }
          if (msg.context.form == 'self') {
            return;
          }
        } catch (e) {
          console.log(e);
        }
        msg.text_content = textToEmojiText(msg.text_content);
        if (
          msg.user_id &&
          !Object.prototype.hasOwnProperty.call(this.newMessageIds, msg.user_id) &&
          this.userList[this.acrivePrivate].user_id != msg.user_id
        ) {
          Vue.set(this.newMessageIds, msg.user_id, msg.user_id);
        }
        if (
          (this.userList[this.acrivePrivate].account_id ||
            this.userList[this.acrivePrivate].user_id) == msg.user_id
        ) {
          const newCurrentUserInList = this.userList[this.acrivePrivate];
          // 根据消息中的最新昵称和头像与当前用户保持一致
          newCurrentUserInList.nickname = msg.context.nick_name;
          newCurrentUserInList.avatar = msg.context.avatar;
          this.$set(this.userList, this.acrivePrivate, newCurrentUserInList);
          if (msg.context.to && msg.context.to != '') {
            const time = msg.date_time;
            if (time) {
              msg.date_time = moment(time).format('HH:mm:ss');
            }
            this.chatList.push(msg);
            this.scrollBottom();
          }
        }
      },
      delCom(val) {
        if (val.code != 200) {
          if (this.userList.length == 1) {
            this.userList = [];
            this.activeName = '';
          }
        }
      },
      getDefaultContent(toAccountID, _from) {
        if (_from == 'father') {
          toAccountID = this.priteChatList[this.acrivePrivate].account_id;
        }
        if (this.userList.length == 0 && this.onlyChatMess.id) {
          this.userList.push(this.onlyChatMess);
        }
        return new Promise((resolve, reject) => {
          const _data = {
            room_id: this.userInfo.interact.room_id,
            start_time: '',
            pos: 0,
            limit: 100,
            to_user: toAccountID,
            webinar_id: this.webinar_id
          };
          this.chatList = [];
          this.$fetch('v3GetPrivCon', _data).then(res => {
            if (res.code == 200) {
              res.data.list.forEach(ele => {
                ele.data.text_content = textToEmojiText(ele.data.text_content);
              });
              this.chatList = res.data.list;

              this.scrollBottom();
              resolve(res);
            } else {
              resolve(res);
              this.$message.warning(res.msg);
            }
          });
        });
      },
      closeUser(user, index) {
        this.userList.splice(index, 1);
        this.chatList = [];
        this.activeName = '';
      },
      // 切换表情显示
      toggleEmoji() {
        console.log(2);
        this.$refs.emoji.toggleShow();
      },
      // 子组件输入表情
      emojiInput(value) {
        this.privateValue += value;
      },
      async selectUser(user, index) {
        if (this.newMessageIds[user.account_id]) {
          delete this.newMessageIds[user.account_id];
        }
        // 设置当前私聊title名字
        this.privateValue = '';
        this.activeName = user.nickname;
        this.acrivePrivate = index;
        const _testData = await this.getDefaultContent(
          this.userList[index].account_id || this.userList[index].user_id
        );
        this.delCom(_testData);
      },
      roleClassFilter(value) {
        return value == '1' ? 'host' : value == '3' ? 'assistant' : 'guest';
      },
      emojiToText(content) {
        console.warn(content, '789');
        return textToEmoji(content)
          .map(c => {
            return c.msgType == 'text'
              ? c.msgCont
              : `<img width="24" src="${c.msgImage}" border="0" />`;
          })
          .join(' ');
      },
      privateSend() {
        if (this.activeName == '') {
          if (this.userList.length != 0) {
            this.activeName =
              this.userList[this.acrivePrivate] && this.userList[this.acrivePrivate].nickname;
          } else {
            return this.$message.warning('请选择私聊人员');
          }
        }
        if (!this.privateValue.trim()) {
          return this.$message.warning('内容不能为空');
        }
        const data = {
          avatar: this.userInfo.join_info.avatar,
          target_id:
            this.userList[this.acrivePrivate].account_id ||
            this.userList[this.acrivePrivate].user_id,
          type: 'text',
          barrageTxt: this.privateValue
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>'),
          text_content: this.privateValue
        };
        // 为保持一致   故传了多个不同key  同value
        const context = {
          avatar: this.userInfo.join_info.avatar,
          to:
            this.userList[this.acrivePrivate].account_id ||
            this.userList[this.acrivePrivate].user_id,
          nickname: this.userInfo.join_info.nickname, // 昵称
          nick_name: this.userInfo.join_info.nickname,
          user_name: this.userInfo.join_info.nickname,
          role_name: this.userInfo.join_info.role_name, // 角色 1主持人2观众3助理4嘉宾   fix:30467  传值不应传过滤后的
          user_role: this.userInfo.join_info.role_name,
          // role_name: this.roleClassFilter(this.userInfo.join_info.role_name), // 角色 1主持人2观众3助理4嘉宾
          // user_role: this.roleClassFilter(this.userInfo.join_info.role_name),
          user_id: this.userInfo.join_info.third_party_user_id,
          // user_id: '16421384',
          app: 'vhall',
          form: 'self'
        };
        this.$nextTick(() => {
          this.$emit('sendMsg', data, context);
          if (
            !window.sessionStorage.getItem('localJoinList') ||
            window.sessionStorage
              .getItem('localJoinList')
              .indexOf(this.userList[this.acrivePrivate].join_id) == -1
          ) {
            window.sessionStorage.setItem(
              'localJoinList',
              JSON.stringify(this.userList[this.acrivePrivate].join_id)
            );
            this.$fetch('v3SetUser', {
              room_id: this.userInfo.interact.room_id,
              webinar_id: this.webinar_id,
              to: this.userList[this.acrivePrivate].join_id || this.userList[this.acrivePrivate].id
            })
              .then(res => {})
              .catch(err => {
                this.$message.error(err.msg);
              });
          } else {
            const _arr = window.sessionStorage.getItem('localJoinList');
            if (_arr.indexOf(this.userList[this.acrivePrivate].join_id) == -1) {
              window.sessionStorage.setItem(
                'localJoinList',
                `${_arr},${this.userList[this.acrivePrivate].join_id}`
              );
            }
          }
          const _data = {
            created_at: moment(new Date()).format('HH:mm:ss'),
            sender_id: this.userInfo.join_info.third_party_user_id,
            date_time: moment(new Date()).format('HH:mm:ss'),
            data: {
              text_content: this.emojiToText(this.privateValue)
            },
            context: {
              role_name: this.userInfo.join_info.role_name
            }
          };
          this.chatList.push(_data);
          this.scrollBottom();
          this.privateValue = '';
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .chat__emoji-tab {
    border: none;
    box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.1);
  }
  .private-wrap {
    position: fixed;
    width: 600px;
    height: 400px;
    right: 20px;
    bottom: 20px;
    background-color: #fff;
    border: 1px solid #f0f0f0;
    z-index: 2;
    overflow: hidden;
    box-shadow: 0px 12px 42px 0px rgba(51, 51, 51, 0.24);
    border-radius: 4px;
    .private-dom-wrap {
      display: flex;
      height: calc(100% - 60px);
    }
    .private-title {
      height: 60px;
      width: 100%;
      background: #fff;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 0px 0px 0px 33px;
      border-bottom: 1px solid #f0f0f0;
      .private-head-close {
        width: 48px;
        height: 48px;
        text-align: center;
        line-height: 44px;
        margin-right: 18px;
        span {
          display: inline-block;
          height: 2px;
          width: 14px;
          background: #666666;
          font-size: 14px;
          line-height: 39px;
        }
        &:hover {
          cursor: pointer;
        }
      }
      .title {
        color: #1a1a1a;
        width: auto;
        font-weight: 500;
      }
      .nickname {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #1a1a1a;
        line-height: 14px;
        margin-left: 16px;
      }
      p {
        width: 100%;
      }
      span {
        display: inline-block;
      }
    }
    .list-name {
      width: 200px;
      height: 100%;
      display: inline-block;
      border-right: 1px solid #f0f0f0;

      li {
        height: 48px;
        line-height: 48px;
        position: relative;
        color: #1a1a1a;
        font-size: 14px;
        text-align: left;
        padding-left: 10px;

        &:hover {
          cursor: pointer;
          background-color: #f7f7f7;
          .close {
            display: inline-block;
          }
        }
        span {
          width: 130px;
          display: inline-block;
        }
        .close {
          width: 20px;
          float: right;
          display: none;
          &:hover {
            cursor: pointer;
          }
        }
        .avatar-img {
          width: 30px;
          height: 30px;
          margin-right: 8px;
          position: relative;
          float: left;
          margin-top: 9px;
          img {
            width: 100%;
            height: 100%;
            border-radius: 15px;
          }
          .red-dot {
            width: 8px;
            height: 8px;
            display: inline-block;
            border-radius: 4px;
            background: #fb3a32;
            position: absolute;
            right: 0px;
            top: 0px;
          }
        }
      }
      .active-name {
        background-color: #f7f7f7;
      }
    }
    .list-content {
      display: inline-block;
      width: 400px;
      position: relative;
      height: 100%;
      // .private-head {
      //   width: 100%;
      //   height: 40px;
      //   color: #fff;
      //   background-color: #5095ff;
      //   font-size: 14px;
      //   line-height: 39px;
      //   text-align: center;
      //   .close {
      //     position: absolute;
      //     right: 10px;
      //     line-height: 39px;
      //     color: #fff;
      //     font-weight: normal;
      //     font-size: 24px;
      //     top: 3px;
      //   }
      // }
      .private-content {
        height: calc(100% - 110px);
        overflow-y: auto;
        &-li {
          width: 100%;
          box-sizing: border-box;
          font-size: 14px;
          color: #949393;
          border-bottom: 1px solid #fff;
          margin-top: 16px;
          padding-left: 10px;
          &-content {
            width: 100%;
            line-height: 22px;
            word-break: break-all;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;

            > div {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
            }
            img {
              display: inline-block;
              width: 30px;
              height: 30px;
              border-radius: 16px;
              margin-right: 8px;
            }
            .priveta-role {
              display: inline-block;
              width: 44px;
              height: 16px;
              background: rgba(251, 58, 50, 0.2);
              border-radius: 9px;
              font-size: 12px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #fb3a32;
              line-height: 16px;
              text-align: center;
              margin-left: 6px;
            }
            .assistantRole {
              background: #ade1ff;
              color: #0a7ff5;
            }
            &-name {
              display: inline-block;
              color: #666666;
            }
            &:nth-child(2) {
              color: #333;
            }
            &-time {
              display: inline-block;
              color: #666;
              font-size: 12px;
              margin-right: 32px;
            }
          }
          .main-content {
            width: 82%;
            min-height: 32px;
            background: #f7f7f7;
            border-radius: 0px 4px 4px 16px;
            margin-left: 40px;
            padding: 6px 12px;
            box-sizing: border-box;
            word-break: break-all;
            line-height: 22px;
            color: #1a1a1a;
          }
        }
      }
      .private-footer {
        height: 110px;
        border-top: 1px solid #f0f0f0;
        box-sizing: border-box;
        padding: 6px 16px 18px;
        .el-textarea {
          height: 58px;
          width: 346px;
          overflow: hidden;
          ::v-deep.el-textarea__inner {
            resize: none;
            // border: 1px solid #f3e1e1;
            border: none;
            color: #1a1a1a;
            padding-left: 0px !important;
            &::-webkit-input-placeholder {
              color: #999;
            }
            &::-moz-placeholder {
              color: #999;
            }
            &::-ms-input-placeholder {
              color: #999;
            }
          }
        }
        .private-send-wrap {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 8px;
          // /deep/ .el-textarea__inner {
          //   padding-left: 0px !important;
          // }
          .send-wrap {
            width: 40px;
            height: 40px;
            background: #f2f2f2;
            border-radius: 20px;
            text-align: center;
            margin-right: 6px;
            margin-bottom: 4px;
            &:hover {
              cursor: pointer;
            }
            .send-btn {
              width: 16px;
              height: 16px;
              display: inline-block;
              margin-top: 12px;
              margin-left: -4px;
            }
          }
          .send-wrap-text {
            width: 310px;
            height: 52px;
            position: relative;
            .el-textarea {
              width: 100%;
              height: 100%;
            }
            .len-tip {
              position: absolute;
              bottom: 4px;
              right: 4px;
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #999999;
              line-height: 24px;
              i {
                font-style: normal;
              }
              .normal {
                color: #3562fa;
              }
              .err {
                color: #fb2626;
              }
            }
          }
        }
      }
      .emoji-wrapper {
        width: 294px;
        position: absolute;
        bottom: 100px;
        left: 0;
      }
    }
  }
</style>
