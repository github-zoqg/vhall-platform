import EventBus from '../js/Events';
import Msg from '../js/msg-class';
import { throttle } from 'lodash';
import { useMsgServer } from 'middle-domain';

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
      // const throttleChatMsg = throttle(() => {
      //   let num = 200;
      //   if ([1, '1'].includes(this.configList['ui.hide_chat_history'])) {
      //     num = 50;
      //   }
      //   if (this.chatList.length > num) {
      //     this.chatList = this.chatList.slice(-num);
      //   }
      // }, 2000);

      //判断直播类型
      // if ([1, '1'].includes(this.playerType) || this.roleName != 2) {
      //   // 接受房间消息
      //   this.msgServer.$on('ROOM_MSG', rawMsg => {
      //     let msg = parseNormalMsg(rawMsg);
      //     msg = Object.assign({}, msg, msg.data);
      //     setTimeout(() => {
      //       if (msg.type === 'live_start') {
      //         EventBus.$emit('startPlay', true);
      //       }
      //     }, 200);
      //     //todo 加入分组讨论逻辑

      //     // 发起抽奖
      //     if (msg.type === 'lottery_push' && [2, '2'].includes(this.roleName)) {
      //       const data = new Msg({
      //         nickname: this.$t('interact_tools.interact_tools_1003'),
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: this.$t('interact_tools.interact_tools_1021')
      //         },
      //         interactStatus: true,
      //         type: msg.type
      //       });
      //       this.chatList.push(data);
      //     }

      //     // 抽奖结果
      //     if (msg.type === 'lottery_result_notice' && [2, '2'].includes(this.roleName)) {
      //       let _localLotteryId = localStorage.getItem(msg.lottery_id);

      //       if (_localLotteryId && (_localLotteryId + '').indexOf(msg.lottery_winners) == -1) {
      //         localStorage.setItem(msg.lottery_id, _localLotteryId + ',' + msg.lottery_winners);
      //       } else {
      //         localStorage.setItem(msg.lottery_id, msg.lottery_winners);
      //       }
      //       _localLotteryId = localStorage.getItem(msg.lottery_id);
      //       if (msg.lottery_winners !== '') {
      //         if (!this.delayFun) {
      //           msg.lottery_winners = _localLotteryId;
      //           console.warn('this.delayFun-----', this.delayFun);
      //           this.delayFun = window.setTimeout(() => {
      //             clearTimeout(this.delayFun);
      //             setTimeout(() => {
      //               //todo 替换为domain的方法
      //               this.$fetch('v3CheckLottery', {}).then(res => {
      //                 const data = new Msg({
      //                   nickname: '抽奖',
      //                   avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //                   content: {
      //                     text_content:
      //                       res.data.lottery_status == 1 && res.data.win == 1
      //                         ? this.$t('interact_tools.interact_tools_1023')
      //                         : this.$t('interact_tools.interact_tools_1022'),
      //                     msg: msg,
      //                     userId: this.userId,
      //                     Show: res.data.lottery_status == 1 && res.data.win == 1
      //                   },
      //                   type: msg.type,
      //                   interactStatus: true,
      //                   isCheck: res.data.lottery_status == 1 && res.data.win == 1
      //                 });
      //                 this.chatList.push(data);
      //               });
      //             }, Math.random() * 5);
      //           }, 5000);
      //         }
      //         if (
      //           _localLotteryId &&
      //           _localLotteryId.split(',').length == msg.actual_lottery_number
      //         ) {
      //           msg.lottery_winners = _localLotteryId;
      //           if (this.delayFun) {
      //             window.clearTimeout(this.delayFun);
      //           }
      //         }
      //       }
      //       const index = (_localLotteryId + '').indexOf(this.userId);
      //       const data = new Msg({
      //         nickname: '',
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content:
      //             index >= 0
      //               ? this.$t('interact_tools.interact_tools_1023')
      //               : this.$t('interact_tools.interact_tools_1022'),
      //           msg: msg,
      //           userId: this.userId,
      //           Show: index >= 0
      //         },
      //         type: msg.type,
      //         interactStatus: true,
      //         isCheck: index >= 0
      //       });
      //       this.chatList.push(data);
      //       //todo 可能有个埋点
      //     }
      //     // 打赏成功
      //     if (msg.data.type === 'reward_pay_ok') {
      //       const data = new Msg({
      //         avatar: getAvatar(msg.data.rewarder_avatar),
      //         nickname:
      //           msg.data.rewarder_nickname.length > 8
      //             ? msg.data.rewarder_nickname.substr(0, 8) + '...'
      //             : msg.data.rewarder_nickname,
      //         type: 'reward_pay_ok',
      //         content: {
      //           text_content: msg.data.reward_describe
      //             ? msg.data.reward_describe
      //             : this.$t('chat.chat_1037'),
      //           num: msg.data.reward_amount
      //         },
      //         sendId: this.userId,
      //         roleName: this.roleName,
      //         interactToolsStatus: true
      //       });
      //       this.chatList.push(data);
      //       this.addSpecialEffect(data);
      //     }
      //     // 礼物
      //     if (msg.data.type === 'gift_send_success') {
      //       const data = new Msg({
      //         nickname:
      //           msg.gift_user_nickname.length > 8
      //             ? msg.gift_user_nickname.substr(0, 8) + '...'
      //             : msg.gift_user_nickname,
      //         avatar: msg.gift_user_avatar,
      //         content: {
      //           gift_name: msg.gift_name,
      //           gift_url: `${msg.gift_image_url}`,
      //           source_status: msg.data.source_status
      //         },
      //         type: msg.type,
      //         interactToolsStatus: true
      //       });
      //       this.chatList.push(data);
      //       this.addSpecialEffect(data);
      //     }
      //     // 开启问答
      //     if (msg.type === 'question_answer_open') {
      //       EventBus.$emit('open_qa');
      //       const data = new Msg({
      //         nickname: msg.nick_name,
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: this.$t('chat.chat_1026')
      //         },
      //         roleName: msg.data.role_name,
      //         type: msg.type,
      //         interactStatus: true
      //       });
      //       this.chatList.push(data);
      //       //todo 重置一下接收到私聊消息
      //     }
      //     // 关闭问答
      //     if (msg.type === 'question_answer_close') {
      //       EventBus.$emit('close_qa');
      //       const data = new Msg({
      //         nickname: this.$t('common.common_1004'),
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: `${msg.nick_name}${this.$t('chat.chat_1081')}`
      //         },
      //         type: msg.type,
      //         interactStatus: true
      //       });
      //       this.chatList.push(data);
      //     }
      //     // 推送问卷
      //     if (msg.type === 'questionnaire_push') {
      //       EventBus.$emit('questionnaireCheck', msg.questionnaire_id);
      //       const data = new Msg({
      //         nickname: msg.nick_name,
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: this.$t('chat.chat_1030'),
      //           questionnaire_id: msg.questionnaire_id
      //         },
      //         roleName: msg.data.room_role,
      //         type: msg.type,
      //         interactStatus: true,
      //         isCheck: true
      //       });
      //       this.chatList.push(data);
      //     }
      //     // 发起签到
      //     if (msg.type === 'sign_in_push') {
      //       const data = new Msg({
      //         roleName: msg.role_name,
      //         nickname: msg.data.sign_creator_nickname,
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: this.$t('chat.chat_1027')
      //         },
      //         type: msg.type,
      //         interactStatus: true
      //       });
      //       this.chatList.push(data);
      //     }
      //     // 结束签到
      //     if (msg.type === 'sign_end') {
      //       const text = msg.data.sign_creator_nickname || this.$t('chat.chat_1022');
      //       const data = new Msg({
      //         roleName: msg.role_name,
      //         nickname: text,
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: this.$t('chat.chat_1028')
      //         },
      //         type: msg.type,
      //         interactStatus: true
      //       });
      //       this.chatList.push(data);
      //     }
      //     // 发起计时
      //     if (msg.type === 'timer_start') {
      //       const text = returnName(msg.data.role_name);
      //       const data = new Msg({
      //         nickname: '计时器', // TODO: 缺翻译
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: `${text}发起了计时器` // TODO：缺翻译
      //         },
      //         type: msg.type,
      //         interactStatus: true
      //       });
      //       console.warn(data);
      //       this.chatList.push(data);
      //     }
      //     // 计时结束
      //     if (msg.type === 'timer_end') {
      //       const text = returnName(msg.data.role_name);
      //       const data = new Msg({
      //         nickname: '计时器',
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: `${text}关闭了计时器`
      //         },
      //         type: msg.type,
      //         interactStatus: true
      //       });
      //       console.warn(data);
      //       this.chatList.push(data);
      //     }
      //     // 计时暂停
      //     if (msg.type === 'timer_pause') {
      //       const text = returnName(msg.data.role_name);
      //       const data = new Msg({
      //         nickname: '计时器',
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: `${text}暂停了计时器`
      //         },
      //         type: msg.type,
      //         interactStatus: true
      //       });
      //       console.warn(data);
      //       this.chatList.push(data);
      //     }
      //     // 计时重置
      //     if (msg.type === 'timer_reset') {
      //       const text = returnName(msg.data.role_name);
      //       const data = new Msg({
      //         nickname: '计时器',
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: `${text}重置了计时器`
      //         },
      //         type: msg.type,
      //         interactStatus: true
      //       });
      //       console.warn(data);
      //       this.chatList.push(data);
      //     }
      //     // 计时继续
      //     if (msg.type === 'timer_resume') {
      //       const text = returnName(msg.data.role_name);
      //       const data = new Msg({
      //         nickname: '计时器',
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           text_content: `${text}继续了计时器`
      //         },
      //         type: msg.type,
      //         interactStatus: true
      //       });
      //       console.warn(data);
      //       this.chatList.push(data);
      //     }

      //     if (msg.data.type === 'chat_delete') {
      //       const _index = this.chatList.findIndex(item => item.msgId !== msg.data.msg_id);
      //       _index !== -1 && this.chatList.splice(_index, 1);
      //     }
      //     EventBus.$emit(msg.type, msg);
      //   });
      // } else if (![1, '1'].includes(this.playerType)) {
      //   this.msgServer.$on('ROOM_MSG', msg => {
      //     if (typeof msg !== 'object') {
      //       msg = JSON.parse(msg);
      //     }
      //     try {
      //       if (msg.data && typeof msg.data !== 'object') {
      //         msg.data = JSON.parse(msg.data);
      //       }
      //     } catch (e) {
      //       console.log(e);
      //     }
      //     console.log('==========房间消息========2222===', msg);
      //     Object.assign(msg, msg.data);
      //     console.log(1, msg);
      //     // 回放礼物打赏消息通知
      //     if (msg.data.type === 'gift_send_success') {
      //       EventBus.$emit('gift_send_success', msg);
      //       const giftData = new Msg({
      //         nickname: msg.gift_user_nickname,
      //         avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //         content: {
      //           gift_name: msg.gift_name,
      //           gift_url: `${msg.gift_image_url}`
      //         },
      //         type: msg.type,
      //         interactToolsStatus: true
      //       });
      //       this.chatList.push(giftData);
      //       this.addSpecialEffect(giftData);
      //     }
      //     if (msg.data.type === 'reward_pay_ok') {
      //       EventBus.$emit('reward_pay_ok', msg);
      //       const rewardData = new Msg({
      //         avatar: getAvatar(msg.data.rewarder_avatar),
      //         nickname:
      //           msg.data.rewarder_nickname.length > 8
      //             ? msg.data.rewarder_nickname.substr(0, 8) + '...'
      //             : msg.data.rewarder_nickname,
      //         type: 'reward_pay_ok',
      //         content: {
      //           text_content: msg.data.reward_describe
      //             ? msg.data.reward_describe
      //             : this.$t('chat.chat_1037'),
      //           num: msg.data.reward_amount
      //         },
      //         sendId: this.userId,
      //         roleName: this.roleName,
      //         interactToolsStatus: true
      //       });
      //       this.chatList.push(rewardData);
      //       this.addSpecialEffect(rewardData);
      //     }
      //   });
      // }
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
        const text =
          msg.data.role_name == 3
            ? this.$t('chat.chat_1024')
            : msg.data.role_name == 1
            ? this.$t('chat.chat_1022')
            : this.$t('chat.chat_1023');
        const data = new Msg({
          nickname: '计时器',
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
        let nickname =
          msg.data.nickname.length > 8 ? msg.data.nickname.substr(0, 8) + '...' : msg.data.nickname;

        return new Msg({
          nickname: nickname,
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
