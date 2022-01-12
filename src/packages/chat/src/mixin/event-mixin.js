import EventBus from '../js/Events';
import Msg from '../js/msg-class';
import { textToEmojiText } from '../js/emoji';
import { handleTime } from '../js/handle-time';
import getAvatar from '../js/get-avatar';
import { throttle } from 'lodash';
import { useMsgServer } from 'middle-domain';

const pcDevice = ['pc_browser', 'desktop'];

const identity = [
  {
    name: '主持人',
    code: 1
  },
  {
    name: '观众',
    code: 2
  },
  {
    name: '助理',
    code: 3
  },
  {
    name: '嘉宾',
    code: 4
  }
];

function returnName(data) {
  const obj = identity.find(item => item.code == data);
  return obj.name ? obj.name : data;
}

const eventMixin = {
  beforeCreate() {
    this.msgServer = useMsgServer();
  },
  methods: {
    //todo 绝大部分都可以挪到domain里，因为视图数据（chatList）已经由domain接管了，这些事件传递的消息也可以交由其处理
    listenEvents() {
      //节流的方法
      const throttleChatMsg = throttle(() => {
        let num = 200;
        if ([1, '1'].includes(this.configList['ui.hide_chat_history'])) {
          num = 50;
        }
        if (this.chatList.length > num) {
          this.chatList = this.chatList.slice(-num);
        }
      }, 2000);

      this.msgServer.$on('CHAT', rawMsg => {
        let msg = parseMsg(rawMsg);
        console.log('============收到聊天消息===============');
        console.log(msg);
        EventBus.$emit('receiveMsg', msg);

        if (['text', 'image'].includes(msg.data.type)) {
          // 问答私聊消息，不添加到聊天列表里面
          if (msg.data.target_id) {
            return;
          }

          // 如果是观众，并且接受到的消息是自己发的，不显示
          if (this.roleName === 2 && msg.sender_id === this.userId) {
            return;
          }

          let item = {};
          if (this.chatList.length) {
            item = this.chatList[this.chatList.length - 1];
          }
          // 获取聊天区域当前滚动条的状态
          const osInstanceScrollStatus = this.osInstance.scroll();
          if (msg.context.atList && msg.context.atList.length && msg.data.text_content) {
            msg.context.atList.forEach(a => {
              msg.data.text_content = msg.data.text_content.replace(
                `***${a.nickName}`,
                `@${a.nickName}`
              );
              // 判断是否是 @ 当前用户得消息
              if (
                osInstanceScrollStatus.max.y !== 0 &&
                osInstanceScrollStatus.ratio.y !== 1 &&
                this.userId === a.accountId
              ) {
                if (this.tipMsgTimer) {
                  clearTimeout(this.tipMsgTimer);
                  this.tipMsgTimer = null;
                }
                this.isHasUnreadAtMeMsg = true;
                // 如果有未读普通消息或者未读回复消息，就显示有 x 条消息未读
                this.tipMsg =
                  this.isHasUnreadNormalMsg || this.isHasUnreadReplyMsg
                    ? `有${this.unReadMessageCount + 1}条未读消息`
                    : '有人@你';
                if (this.tipMsg === '有人@你') {
                  // 如果结果是 @ 清除之前的定时器并开启一个新的定时器，10秒后删除
                  this.tipMsgTimer = setTimeout(() => {
                    this.unReadMessageCount = 0;
                    this.isHasUnreadAtMeMsg = false;
                    this.tipMsgTimer = null;
                  }, 10000);
                }
              }
            });
          } else if (
            osInstanceScrollStatus.max.y !== 0 &&
            osInstanceScrollStatus.ratio.y !== 1 &&
            msg.context.replyMsg &&
            msg.context.replyMsg.content &&
            this.userId === msg.context.replyMsg.sendId
          ) {
            // 如果是否是回复当前观众的消息
            if (this.tipMsgTimer) {
              clearTimeout(this.tipMsgTimer);
              this.tipMsgTimer = null;
            }
            this.isHasUnreadReplyMsg = true;
            // 如果有未读普通消息或者未读回复消息，就显示有 x 条消息未读
            this.tipMsg =
              this.isHasUnreadNormalMsg || this.isHasUnreadAtMeMsg
                ? `有${this.unReadMessageCount + 1}条未读消息`
                : `有人回复你`;
            if (this.tipMsg === '有人回复你') {
              // 如果结果是 回复 清除之前的定时器并开启一个新的定时器，10秒后删除
              this.tipMsgTimer = setTimeout(() => {
                this.unReadMessageCount = 0;
                this.isHasUnreadReplyMsg = false;
                this.tipMsgTimer = null;
              }, 10000);
            }
          } else if (osInstanceScrollStatus.max.y !== 0 && osInstanceScrollStatus.ratio.y !== 1) {
            // 如果是除回复、 @之外的普通消息
            if (this.tipMsgTimer) {
              clearTimeout(this.tipMsgTimer);
              this.tipMsgTimer = null;
            }
            this.isHasUnreadNormalMsg = true;
            this.tipMsg = `有${this.unReadMessageCount + 1}条未读消息`;
          }
          throttleChatMsg(); // 解决17618
          const data = new Msg({
            avatar: getAvatar(msg.context.avatar),
            nickName: msg.context.nickname,
            type: msg.data.type,
            content: msg.data,
            sendId: msg.sender_id,
            sendTime: msg.date_time,
            roleName: msg.context.role_name,
            client: pcDevice.includes(msg.client) ? 'pc' : 'mobile',
            showTime: handleTime(item, msg),
            replyMsg: msg.context.replyMsg || {},
            atList: msg.context.atList || [],
            msgId: msg.msg_id,
            channel: msg.channel
          });
          this.chatList.push(data);
        }
        // 免费礼物
        if (msg.data.type === 'free_gift_send') {
          let data = generateGiftMessage(msg);
          this.chatList.push(data);
          this.addSpecialEffect(data);
          console.log(this.chatList, 'list-----------------');
        }

        // 禁言某个用户
        if (msg.data.type === 'disable') {
          //todo 待移除 或者其他方式替代
          EventBus.$emit('disable', msg);
          //todo 要设法兼容分组
          if (msg.data.target_id === this.userId) {
            this.isBanned = true;
            this.initInputStatus();
          }
        }
        // 取消禁言某个用户
        if (msg.data.type === 'permit') {
          EventBus.$emit('permit', msg);
          //todo 要设法兼容分组
          if (msg.data.target_id === this.userId && !this.allBanned) {
            this.isBanned = false;
            this.initInputStatus();
          }
        }

        // 开启全体禁言
        if (msg.data.type === 'disable_all') {
          EventBus.$emit('disable_all', msg);
          this.allBanned = true;
          this.initInputStatus();
        }
        // 关闭全体禁言
        if (msg.data.type === 'permit_all') {
          EventBus.$emit('permit_all', msg);
          this.allBanned = false;
          this.initInputStatus();
        }
      });

      //判断直播类型
      if ([1, '1'].includes(this.playerType) || this.roleName != 2) {
        // 接受房间消息
        this.msgServer.$on('ROOM_MSG', rawMsg => {
          let msg = parseNormalMsg(rawMsg);
          msg = Object.assign({}, msg, msg.data);
          setTimeout(() => {
            if (msg.type === 'live_start') {
              EventBus.$emit('startPlay', true);
            }
          }, 200);
          //todo 加入分组讨论逻辑

          // 发起抽奖
          if (msg.type === 'lottery_push' && [2, '2'].includes(this.roleName)) {
            const data = new Msg({
              nickName: '抽奖',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: '正在进行抽奖环节'
              },
              interactStatus: true,
              type: msg.type
            });
            this.chatList.push(data);
          }

          // 抽奖结果
          if (msg.type === 'lottery_result_notice' && [2, '2'].includes(this.roleName)) {
            let _localLotteryId = localStorage.getItem(msg.lottery_id);

            if (_localLotteryId && (_localLotteryId + '').indexOf(msg.lottery_winners) == -1) {
              localStorage.setItem(msg.lottery_id, _localLotteryId + ',' + msg.lottery_winners);
            } else {
              localStorage.setItem(msg.lottery_id, msg.lottery_winners);
            }
            _localLotteryId = localStorage.getItem(msg.lottery_id);
            if (msg.lottery_winners !== '') {
              if (!this.delayFun) {
                msg.lottery_winners = _localLotteryId;
                console.warn('this.delayFun-----', this.delayFun);
                this.delayFun = window.setTimeout(() => {
                  clearTimeout(this.delayFun);
                  setTimeout(() => {
                    //todo 替换为domain的方法
                    this.$fetch('v3CheckLottery', {}).then(res => {
                      const data = new Msg({
                        nickName: '抽奖',
                        avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
                        content: {
                          text_content:
                            res.data.lottery_status == 1 && res.data.win == 1
                              ? '恭喜您中奖了！'
                              : '很遗憾，您没有中奖！',
                          msg: msg,
                          userId: this.userId,
                          Show: res.data.lottery_status == 1 && res.data.win == 1
                        },
                        type: msg.type,
                        interactStatus: true,
                        isCheck: res.data.lottery_status == 1 && res.data.win == 1
                      });
                      this.chatList.push(data);
                    });
                  }, Math.random() * 5);
                }, 5000);
              }
              if (
                _localLotteryId &&
                _localLotteryId.split(',').length == msg.actual_lottery_number
              ) {
                msg.lottery_winners = _localLotteryId;
                if (this.delayFun) {
                  window.clearTimeout(this.delayFun);
                }
              }
            }
            const index = (_localLotteryId + '').indexOf(this.userId);
            const data = new Msg({
              nickName: '',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: index >= 0 ? '恭喜您中奖了！' : '很遗憾，您没有中奖！',
                msg: msg,
                userId: this.userId,
                Show: index >= 0
              },
              type: msg.type,
              interactStatus: true,
              isCheck: index >= 0
            });
            this.chatList.push(data);
            //todo 可能有个埋点
          }
          // 打赏成功
          if (msg.data.type === 'reward_pay_ok') {
            const data = new Msg({
              avatar: getAvatar(msg.data.rewarder_avatar),
              nickName:
                msg.data.rewarder_nickname.length > 8
                  ? msg.data.rewarder_nickname.substr(0, 8) + '...'
                  : msg.data.rewarder_nickname,
              type: 'reward_pay_ok',
              content: {
                text_content: msg.data.reward_describe
                  ? msg.data.reward_describe
                  : '很精彩，赞一个！',
                num: msg.data.reward_amount
              },
              sendId: this.userId,
              roleName: this.roleName,
              interactToolsStatus: true
            });
            this.chatList.push(data);
            this.addSpecialEffect(data);
          }
          // 礼物
          if (msg.data.type === 'gift_send_success') {
            const data = new Msg({
              nickName:
                msg.gift_user_nickname.length > 8
                  ? msg.gift_user_nickname.substr(0, 8) + '...'
                  : msg.gift_user_nickname,
              avatar: msg.gift_user_avatar,
              content: {
                gift_name: msg.gift_name,
                gift_url: `${msg.gift_image_url}`,
                source_status: msg.data.source_status
              },
              type: msg.type,
              interactToolsStatus: true
            });
            this.chatList.push(data);
            this.addSpecialEffect(data);
          }
          // 开启问答
          if (msg.type === 'question_answer_open') {
            EventBus.$emit('open_qa');
            const data = new Msg({
              nickName: msg.nick_name,
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: '开启了问答'
              },
              roleName: msg.data.role_name,
              type: msg.type,
              interactStatus: true
            });
            this.chatList.push(data);
            //todo 重置一下接收到私聊消息
          }
          // 关闭问答
          if (msg.type === 'question_answer_close') {
            EventBus.$emit('close_qa');
            const data = new Msg({
              nickName: '问答',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${msg.nick_name}关闭了问答`
              },
              type: msg.type,
              interactStatus: true
            });
            this.chatList.push(data);
          }
          // 推送问卷
          if (msg.type === 'questionnaire_push') {
            EventBus.$emit('questionnaireCheck', msg.questionnaire_id);
            const data = new Msg({
              nickName: msg.nick_name,
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: '发起了问卷',
                questionnaire_id: msg.questionnaire_id
              },
              roleName: msg.data.room_role,
              type: msg.type,
              interactStatus: true,
              isCheck: true
            });
            this.chatList.push(data);
          }
          // 发起签到
          if (msg.type === 'sign_in_push') {
            const data = new Msg({
              roleName: msg.role_name,
              nickName: msg.data.sign_creator_nickname,
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: '发起了签到'
              },
              type: msg.type,
              interactStatus: true
            });
            this.chatList.push(data);
          }
          // 结束签到
          if (msg.type === 'sign_end') {
            const text = msg.data.sign_creator_nickname || '主持人';
            const data = new Msg({
              roleName: msg.role_name,
              nickName: text,
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: '结束了签到'
              },
              type: msg.type,
              interactStatus: true
            });
            this.chatList.push(data);
          }
          // 发起计时
          if (msg.type === 'timer_start') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}发起了计时器`
              },
              type: msg.type,
              interactStatus: true
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 计时结束
          if (msg.type === 'timer_end') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}关闭了计时器`
              },
              type: msg.type,
              interactStatus: true
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 计时暂停
          if (msg.type === 'timer_pause') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}暂停了计时器`
              },
              type: msg.type,
              interactStatus: true
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 计时重置
          if (msg.type === 'timer_reset') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}重置了计时器`
              },
              type: msg.type,
              interactStatus: true
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 计时继续
          if (msg.type === 'timer_resume') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}继续了计时器`
              },
              type: msg.type,
              interactStatus: true
            });
            console.warn(data);
            this.chatList.push(data);
          }

          if (msg.data.type === 'chat_delete') {
            const _index = this.chatList.findIndex(item => item.msgId !== msg.data.msg_id);
            _index !== -1 && this.chatList.splice(_index, 1);
          }
          EventBus.$emit(msg.type, msg);
        });
      } else if (![1, '1'].includes(this.playerType)) {
        this.msgServer.$on('ROOM_MSG', msg => {
          if (typeof msg !== 'object') {
            msg = JSON.parse(msg);
          }
          try {
            if (msg.data && typeof msg.data !== 'object') {
              msg.data = JSON.parse(msg.data);
            }
          } catch (e) {
            console.log(e);
          }
          console.log('==========房间消息========2222===', msg);
          Object.assign(msg, msg.data);
          console.log(1, msg);
          // 回放礼物打赏消息通知
          if (msg.data.type === 'gift_send_success') {
            EventBus.$emit('gift_send_success', msg);
            const giftData = new Msg({
              nickName: msg.gift_user_nickname,
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                gift_name: msg.gift_name,
                gift_url: `${msg.gift_image_url}`
              },
              type: msg.type,
              interactToolsStatus: true
            });
            this.chatList.push(giftData);
            this.addSpecialEffect(giftData);
          }
          if (msg.data.type === 'reward_pay_ok') {
            EventBus.$emit('reward_pay_ok', msg);
            const rewardData = new Msg({
              avatar: getAvatar(msg.data.rewarder_avatar),
              nickName:
                msg.data.rewarder_nickname.length > 8
                  ? msg.data.rewarder_nickname.substr(0, 8) + '...'
                  : msg.data.rewarder_nickname,
              type: 'reward_pay_ok',
              content: {
                text_content: msg.data.reward_describe
                  ? msg.data.reward_describe
                  : '很精彩，赞一个！',
                num: msg.data.reward_amount
              },
              sendId: this.userId,
              roleName: this.roleName,
              interactToolsStatus: true
            });
            this.chatList.push(rewardData);
            this.addSpecialEffect(rewardData);
          }
        });
      }
      //todo 考虑移出chat模块，这部分应该由domain负责
      // 接受加入房间消息
      this.msgServer.$on('JOIN', msg => {
        if (typeof msg !== 'object') {
          msg = JSON.parse(msg);
        }
        try {
          if (msg.context && typeof msg.context !== 'object') {
            msg.context = JSON.parse(msg.context);
          }
          if (msg.data && typeof msg.data !== 'object') {
            msg.data = JSON.parse(msg.data);
          }
        } catch (e) {
          console.log(e);
        }

        console.log('********加入房间消息*********');
        console.log(msg);
        if (window.sessionStorage.getItem('ssoEnabled') == 1) {
          const kickId = window.sessionStorage.getItem('kickId');
          const kickMark = `${window.sessionStorage.getItem('kickMark')}${
            this.$route.params.il_id
          }`;
          console.log(
            kickMark,
            kickId,
            msg.context.kick_id,
            msg.context.kick_mark,
            '账号相同，需要踢出之前的账号11111111111'
          );
          if (kickId == msg.context.kick_id && kickMark != msg.context.kick_mark) {
            this.$emit('singleLogin');
          }
        }
        EventBus.$emit(msg.data.type, msg);
        const baseOnlineNumber = sessionStorage.getItem('baseOnlineNumber');
        this.onlineUsers = Number(baseOnlineNumber) + Number(msg.uv);
      });
      // 接受离开房间消息
      this.msgServer.$on('LEFT', msg => {
        if (typeof msg !== 'object') {
          msg && (msg = JSON.parse(msg));
        }
        try {
          if (msg.context && typeof msg.context !== 'object') {
            msg.context = JSON.parse(msg.context);
          }
          if (msg.data && typeof msg.data !== 'object') {
            msg.data = JSON.parse(msg.data);
          }
        } catch (e) {
          console.log(e);
        }
        console.log('********离开房间消息*********');
        console.log(msg);
        EventBus.$emit(msg.data.type, msg);
        const baseOnlineNumber = sessionStorage.getItem('baseOnlineNumber');
        this.onlineUsers = Number(baseOnlineNumber) + Number(msg.uv);
      });
      // 自定义消息
      this.msgServer.$on('CUSTOM_MSG', msg => {
        if (typeof msg !== 'object') {
          msg && (msg = JSON.parse(msg));
        }
        try {
          if (msg.data && typeof msg.data !== 'object') {
            msg.data = JSON.parse(msg.data);
          }
        } catch (e) {
          console.log(e);
        }
        console.log('********自定义消息***测试不存在 自定义消息不存在type值******');
        console.log(msg);
        if (msg.data.type) {
          EventBus.$emit(msg.data.type, msg);
        }
      });
      EventBus.$on('timer_pause', msg => {
        const text = msg.data.role_name == 3 ? '助理' : msg.data.role_name == 1 ? '主持人' : '嘉宾';
        const data = new Msg({
          nickName: '计时器',
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: `${text}暂停了计时器`
          },
          type: msg.type,
          interactToolsStatus: true
        });
        console.warn(data);
        this.chatList.push(data);
      });
      EventBus.$on('room_channel_change', this.handleChannelChange);
      //解压消息
      function parseMsg(msg) {
        if (typeof msg !== 'object') {
          msg = JSON.parse(msg);
        }
        try {
          if (typeof msg.context !== 'object') {
            msg.context = JSON.parse(msg.context);
          }
          if (typeof msg.data !== 'object') {
            msg.data = JSON.parse(msg.data);
          }
        } catch (e) {
          console.log(e);
        }

        if (!msg.data.barrageTxt && msg.data.text_content) {
          msg.data.barrageTxt = msg.data.text_content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>');
        }

        // 判断消息中是否可能存在表情，如果可能存在，则转为对应的 img 显示
        if (msg.data.text_content && msg.data.text_content.indexOf('[') > -1) {
          msg.data.text_content = textToEmojiText(msg.data.text_content);
        }

        // 如果 type 为 permit, event_type 为 customPraise 设置 type = customPraise
        if (msg.data.type === 'permit' && msg.data.event_type === 'customPraise') {
          msg.data.type = 'customPraise';
        }

        // 如果 type 为 permit, event_type 为 free_gift_send 设置 type = free_gift_send
        if (msg.data.type === 'permit' && msg.data.event_type === 'free_gift_send') {
          msg.data.type = 'free_gift_send';
        }

        return msg;
      }
      //解压普通消息
      function parseNormalMsg(rawMsg) {
        let msg = rawMsg;
        if (typeof msg !== 'object') {
          msg = JSON.parse(msg);
        }
        try {
          if (typeof msg.context !== 'object') {
            msg.context = JSON.parse(msg.context);
          }
          if (typeof msg.data !== 'object') {
            msg.data = JSON.parse(msg.data);
          }
        } catch (e) {
          console.log(e);
        }
        return msg;
      }
      //组装礼物消息
      function generateGiftMessage(msg) {
        let nickName =
          msg.data.nickname.length > 8 ? msg.data.nickname.substr(0, 8) + '...' : msg.data.nickname;

        return new Msg({
          nickName: nickName,
          avatar: msg.data.avatar,
          content: {
            gift_name: msg.data.gift_name,
            gift_url: `${msg.data.gift_url}`,
            source_status: msg.data.source_status
          },
          type: 'gift_send_success',
          interactToolsStatus: true
        });
      }
    }
  }
};
export default eventMixin;
