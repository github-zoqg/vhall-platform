import EventBus from '../js/Events';
import Msg from '../js/msg-class';
import { textToEmojiText } from '../js/emoji';
import { handleTime } from '../js/handle-time';
import getAvatar from '../js/get-avatar';
import { throttle } from 'lodash';
import { contextServer } from 'vhall-sass-domain';

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
    this.msgServer = contextServer.get('msgServer');
  },
  methods: {
    listenEvents() {
      const throttleChatMsg = throttle(() => {
        if (this.chatList.length > 200) {
          this.chatList = this.chatList.slice(-200);
        }
      }, 2000);
      this.msgServer.$on('CHAT', msg => {
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
        console.log('============收到聊天消息==============111=');
        console.log(msg);
        if (!msg.data.barrageTxt && msg.data.text_content) {
          msg.data.barrageTxt = msg.data.text_content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>');
        }
        if (msg.data.text_content) {
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

        EventBus.$emit('receiveMsg', msg);
        if (msg.data.type == 'text' || msg.data.type == 'image') {
          // 问答私聊消息，不添加到聊天列表里面
          if (msg.data.target_id) return;

          // 如果是观众，并且接受到的消息是自己发的，不显示
          if (this.roleName == 2 && msg.sender_id == this.userId) return;

          let item = {};
          if (this.chatList.length) {
            item = this.chatList[this.chatList.length - 1];
          }
          if (msg.context.atList && msg.context.atList.length && msg.data.text_content) {
            msg.context.atList.forEach(a => {
              msg.data.text_content = msg.data.text_content.replace(
                `***${a.nickName}`,
                `@${a.nickName}`
              );
            });
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
            showTime: handleTime(item.sendTime),
            replyMsg: msg.context.replyMsg || {},
            atList: msg.context.atList || [],
            msgId: msg.msg_id,
            channel: msg.channel
          });
          console.warn('回显个人发的消息---', data);
          this.chatList.push(data);
        }
        // 免费礼物
        if (msg.data.type == 'free_gift_send') {
          const data = new Msg({
            nickName: msg.data.nickname,
            avatar: msg.data.avatar,
            content: {
              gift_name: msg.data.gift_name,
              gift_url: `${msg.data.gift_url}`
            },
            type: 'gift_send_success'
          });
          this.chatList.push(data);
        }
        // 禁言某个用户
        if (msg.data.type == 'disable') {
          EventBus.$emit('disable', msg);
          if (msg.data.target_id == this.userId) {
            this.inputValue = '';
            this.inputStatus.disable = true;
            this.inputStatus.placeholder = '您已被禁言';
          }
        }
        // 取消禁言某个用户
        if (msg.data.type == 'permit') {
          EventBus.$emit('permit', msg);
          if (msg.data.target_id == this.userId && !this.allBanned) {
            this.inputValue = '';
            this.inputStatus.disable = false;
            this.inputStatus.placeholder = '参与聊天';
          }
        }

        // 取消禁言某个用户
        if (msg.data.type == 'disable_all') {
          EventBus.$emit('disable_all', msg);
          if (this.roleName == '2') {
            this.inputValue = '';
            this.inputStatus.disable = true;
            if (this.chatLoginStatus) {
              return;
            }
            this.inputStatus.placeholder = '全员禁言中';
          }
        }
        // 取消禁言某个用户
        if (msg.data.type == 'permit_all') {
          EventBus.$emit('permit_all', msg);
          if (this.roleName == '2') {
            if (this.isBanned) {
              this.inputValue = '';
              this.inputStatus.disable = true;
              this.inputStatus.placeholder = '您已被禁言';
              return;
            }
            this.inputValue = '';
            this.inputStatus.disable = false;
            if (this.chatLoginStatus) {
              return;
            }
            this.inputStatus.placeholder = '参与聊天';
          }
        }
      });
      if (this.playerType == 'live' || this.roleName != 2) {
        // 接受房间消息
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
          // console.log('==========房间消息========1===', msg);
          Object.assign(msg, msg.data);
          setTimeout(() => {
            if (msg.type == 'live_start') {
              EventBus.$emit('startPlay', true);
            }
          }, 200);

          if (this.splited) {
            EventBus.$emit('sendCmdToShadow', msg);
          }

          EventBus.$emit('roomAllInfo', msg);
          // 发起抽奖
          if (msg.type == 'lottery_push' && this.roleName == '2') {
            const data = new Msg({
              nickName: '抽奖',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: '正在进行抽奖环节'
              },
              type: msg.type
            });
            this.chatList.push(data);
          }
          // 抽奖结果
          if (msg.type == 'lottery_result_notice' && this.roleName == '2') {
            let _localLotteryId = localStorage.getItem(msg.lottery_id);
            if (_localLotteryId && _localLotteryId.indexOf(msg.lottery_winners) == -1) {
              localStorage.setItem(msg.lottery_id, _localLotteryId + ',' + msg.lottery_winners);
            } else {
              localStorage.setItem(msg.lottery_id, msg.lottery_winners);
            }
            _localLotteryId = localStorage.getItem(msg.lottery_id);
            if (msg.lottery_winners != '') {
              if (!this.delayFun) {
                msg.lottery_winners = _localLotteryId;
                console.warn('this.delayFun-----', this.delayFun);
                this.delayFun = window.setTimeout(() => {
                  clearTimeout(this.delayFun);
                  setTimeout(() => {
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
                        type: msg.type
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
            const index = _localLotteryId.indexOf(this.userId);
            const data = new Msg({
              nickName: '抽奖',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: index >= 0 ? '恭喜您中奖了！' : '很遗憾，您没有中奖！',
                msg: msg,
                userId: this.userId,
                Show: index >= 0
              },
              type: msg.type
            });
            this.chatList.push(data);
            window.vhallReport &&
              window.vhallReport.report('LOTTERY', {
                question_id: index >= 0 ? 1 : 0,
                answer_id: msg.lottery_id
              });
          }
          // 打赏成功
          if (msg.data.type == 'reward_pay_ok') {
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
              roleName: this.roleName
            });
            this.chatList.push(data);
          }
          // 礼物
          if (msg.data.type == 'gift_send_success') {
            const data = new Msg({
              nickName: msg.gift_user_nickname,
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                gift_name: msg.gift_name,
                gift_url: `${msg.gift_image_url}`
              },
              type: msg.type
            });
            this.chatList.push(data);
          }
          // 开启问答
          if (msg.type == 'question_answer_open') {
            EventBus.$emit('open_qa');
            const data = new Msg({
              nickName: '问答',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${msg.nick_name}开启了问答`
              },
              type: msg.type
            });
            this.chatList.push(data);
          }
          // 关闭问答
          if (msg.type == 'question_answer_close') {
            EventBus.$emit('close_qa');
            const data = new Msg({
              nickName: '问答',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${msg.nick_name}关闭了问答`
              },
              type: msg.type
            });
            this.chatList.push(data);
          }
          // 推送问卷
          if (msg.type == 'questionnaire_push') {
            EventBus.$emit('questionnaireCheck', msg.questionnaire_id);
            const text =
              msg.room_role == '3'
                ? `助理${msg.nick_name}`
                : msg.room_role == '4'
                ? `嘉宾${msg.nick_name}`
                : '主持人';
            const data = new Msg({
              nickName: '问卷',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}发起了问卷`,
                questionnaire_id: msg.questionnaire_id
              },
              roleName: this.roleName,
              type: msg.type
            });
            this.chatList.push(data);
          }
          // 发起签到
          if (msg.type == 'sign_in_push') {
            const text = msg.data.sign_creator_nickname || '主持人';
            const data = new Msg({
              nickName: '签到',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}发起了签到`
              },
              type: msg.type
            });
            this.chatList.push(data);
          }
          // 结束签到
          if (msg.type == 'sign_end') {
            const text = msg.data.sign_creator_nickname || '主持人';
            const data = new Msg({
              nickName: '签到',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}结束了签到`
              },
              type: msg.type
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 发起计时
          if (msg.type == 'timer_start') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}发起了计时器`
              },
              type: msg.type
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 计时结束
          if (msg.type == 'timer_end') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}关闭了计时器`
              },
              type: msg.type
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 计时暂停
          if (msg.type == 'timer_pause') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}暂停了计时器`
              },
              type: msg.type
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 计时重置
          if (msg.type == 'timer_reset') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}重置了计时器`
              },
              type: msg.type
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 计时继续
          if (msg.type == 'timer_resume') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}继续了计时器`
              },
              type: msg.type
            });
            console.warn(data);
            this.chatList.push(data);
          }
          // 分组完成
          if (msg.type == 'timer_resume') {
            const text = returnName(msg.data.role_name);
            const data = new Msg({
              nickName: '计时器',
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: `${text}继续了计时器`
              },
              type: msg.type
            });
            console.warn(data);
            this.chatList.push(data);
          }

          if (msg.data.type === 'chat_delete') {
            this.chatList = this.chatList.filter(item => item.msgId !== msg.data.msg_id);
          }
          if (msg.type == 'desktop_sharing_open') {
            EventBus.$emit('sharescreenopen');
          }
          if (msg.type == 'desktop_sharing_disable') {
            EventBus.$emit('sharescreenclose', msg);
          }
          // 进入/退出 小组讨论  event_type: "group_switch_start" status：enter进入小组 quit：退出小组
          if (msg.data.event_type === 'group_manager_enter' && msg.data.role == 1) {
            EventBus.$emit('group_manager_enter', msg);
          }
          // 分组消息
          if (msg.event_type == 'group_room_create') {
            EventBus.$emit('group_room_create', msg);
            return false;
          }
          if (msg.event_type == 'group_switch_start') {
            EventBus.$emit('group_switch_start', msg);
            return false;
          }
          if (msg.event_type == 'group_switch_end') {
            EventBus.$emit('group_switch_end', msg);
            return false;
          }
          if (msg.event_type == 'group_disband') {
            EventBus.$emit('group_disband', msg);
            return false;
          }
          if (msg.event_type == 'group_help') {
            EventBus.$emit('group_help', msg);
            return false;
          }
          if (msg.event_type == 'group_leader_change') {
            EventBus.$emit('group_leader_change', msg);
            return false;
          }
          if (msg.type == 'group_join_change') {
            EventBus.$emit('group_join_change', msg);
            return false;
          }
          if (msg.type == 'group_join_info') {
            EventBus.$emit('group_join_info', msg);
            return false;
          }
          // console.warn('派发的消息，查看数据类型和数据', msg, msg.type);
          if (msg.type == 'live_over') {
            // 直播结束消息进入小组需要保活，不在这里处理
            return;
          }
          EventBus.$emit(msg.type, msg);
        });
        this.msgServer.$on(
          'ROOM_MSG',
          msg => {
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
            // console.log('==========房间消息========1===', msg);
            Object.assign(msg, msg.data);
            if (msg.type == 'live_over') {
              // 直播结束消息进入小组需要保活，不在这里处理
              EventBus.$emit(msg.type, msg);
            }
          },
          true
        );
      } else if (this.playerType != 'live') {
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
          if (msg.data.type == 'gift_send_success') {
            EventBus.$emit('gift_send_success', msg);
            const giftData = new Msg({
              nickName: msg.gift_user_nickname,
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                gift_name: msg.gift_name,
                gift_url: `${msg.gift_image_url}`
              },
              type: msg.type
            });
            this.chatList.push(giftData);
          }
          if (msg.data.type == 'reward_pay_ok') {
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
              roleName: this.roleName
            });
            this.chatList.push(rewardData);
          }
        });
      }
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
      // @本用户的msgItem元素
      // EventBus.$on('scrollElement', el => {
      //   this.showTip = true;
      //   this.elements.push(el);
      //   this.tipMsg = this.replyElement ? '有多条未读消息' : '有人@你';
      // });
      // 关闭提示
      // EventBus.$on('closeTip', () => {
      //   this.showTip = false;
      //   this.tipMsg = '';
      // });
      // // 清空@列表
      // EventBus.$on('clearElements', () => {
      //   this.elements = [];
      //   this.showTip = false;
      //   this.tipMsg = '';
      //   this.replyElement = null;
      // });
      // 有人回复本用户
      // EventBus.$on('replyMsg', e => {
      //   if (this.userId != e.msg.sendId) return;
      //   this.showTip = true;
      //   this.tipMsg = this.elements.length ? '有多条未读消息' : '有人回复你';
      //   this.replyElement = e.el;
      // });
      // 计时暂停
      EventBus.$on('timer_pause', msg => {
        const text = msg.data.role_name == 3 ? '助理' : msg.data.role_name == 1 ? '主持人' : '嘉宾';
        const data = new Msg({
          nickName: '计时器',
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: `${text}暂停了计时器`
          },
          type: msg.type
        });
        console.warn(data);
        this.chatList.push(data);
      });
      EventBus.$on('room_channel_change', this.handleChannelChange);
    }
  }
};
export default eventMixin;
