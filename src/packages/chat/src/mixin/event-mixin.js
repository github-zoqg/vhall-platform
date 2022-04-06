import { useMsgServer } from 'middle-domain';

const eventMixin = {
  beforeCreate() {
    this.msgServer = useMsgServer();
  },
  methods: {
    //todo 绝大部分都可以挪到domain里，因为视图数据（chatList）已经由domain接管了，这些事件传递的消息也可以交由其处理
    listenEvents() {
      //todo 考虑移出chat模块，这部分应该由domain负责
      // 接受加入房间消息
      // this.msgServer.$on('JOIN', msg => {
      //   if (typeof msg !== 'object') {
      //     msg = JSON.parse(msg);
      //   }
      //   try {
      //     if (msg.context && typeof msg.context !== 'object') {
      //       msg.context = JSON.parse(msg.context);
      //     }
      //     if (msg.data && typeof msg.data !== 'object') {
      //       msg.data = JSON.parse(msg.data);
      //     }
      //   } catch (e) {
      //     console.log(e);
      //   }
      //   console.log('********加入房间消息*********');
      //   console.log(msg);
      //   // 单点登录不在这里判断 所以注释
      //   // if (window.sessionStorage.getItem('ssoEnabled') == 1) {
      //   //   const kickId = window.sessionStorage.getItem('kickId');
      //   //   const kickMark = `${window.sessionStorage.getItem('kickMark')}${
      //   //     this.$route.params.il_id
      //   //   }`;
      //   //   console.log(
      //   //     kickMark,
      //   //     kickId,
      //   //     msg.context.kick_id,
      //   //     msg.context.kick_mark,
      //   //     '账号相同，需要踢出之前的账号11111111111'
      //   //   );
      //   //   if (kickId == msg.context.kick_id && kickMark != msg.context.kick_mark) {
      //   //     this.$emit('singleLogin');
      //   //   }
      //   // }
      //   EventBus.$emit(msg.data.type, msg);
      //   const baseOnlineNumber = sessionStorage.getItem('baseOnlineNumber');
      //   this.onlineUsers = Number(baseOnlineNumber) + Number(msg.uv);
      // });
      // // 接受离开房间消息
      // this.msgServer.$on('LEFT', msg => {
      //   if (typeof msg !== 'object') {
      //     msg && (msg = JSON.parse(msg));
      //   }
      //   try {
      //     if (msg.context && typeof msg.context !== 'object') {
      //       msg.context = JSON.parse(msg.context);
      //     }
      //     if (msg.data && typeof msg.data !== 'object') {
      //       msg.data = JSON.parse(msg.data);
      //     }
      //   } catch (e) {
      //     console.log(e);
      //   }
      //   console.log('********离开房间消息*********');
      //   console.log(msg);
      //   EventBus.$emit(msg.data.type, msg);
      //   const baseOnlineNumber = sessionStorage.getItem('baseOnlineNumber');
      //   this.onlineUsers = Number(baseOnlineNumber) + Number(msg.uv);
      // });
      // 自定义消息
      // this.msgServer.$on('CUSTOM_MSG', msg => {
      //   if (typeof msg !== 'object') {
      //     msg && (msg = JSON.parse(msg));
      //   }
      //   try {
      //     if (msg.data && typeof msg.data !== 'object') {
      //       msg.data = JSON.parse(msg.data);
      //     }
      //   } catch (e) {
      //     console.log(e);
      //   }
      //   console.log('********自定义消息***测试不存在 自定义消息不存在type值******');
      //   console.log(msg);
      //   if (msg.data.type) {
      //     EventBus.$emit(msg.data.type, msg);
      //   }
      // });
      // EventBus.$on('timer_pause', msg => {
      //   const text =
      //     msg.data.role_name == 3
      //       ? this.$t('chat.chat_1024')
      //       : msg.data.role_name == 1
      //       ? this.$t('chat.chat_1022')
      //       : this.$t('chat.chat_1023');
      //   const data = new Msg({
      //     nickname: '计时器',
      //     avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
      //     content: {
      //       text_content: `${text}暂停了计时器`
      //     },
      //     type: msg.type,
      //     interactToolsStatus: true
      //   });
      //   console.warn(data);
      //   this.chatList.push(data);
      // });
      // EventBus.$on('room_channel_change', this.handleChannelChange);
      //解压普通消息
    }
  }
};
export default eventMixin;
