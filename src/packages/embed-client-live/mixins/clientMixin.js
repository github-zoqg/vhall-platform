import { useChatServer, useMsgServer, useGroupServer } from 'middle-domain';
import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
export const clientMixin = {
  mounted() {
    // EventBus.$on('Join', msg => {
    //   this.$emit('assistantMsg', msg.data.type, msg);
    // });
    // EventBus.$on('Leave', msg => {
    //   this.$emit('assistantMsg', msg.data.type, msg);
    // });
    // // 禁言某个用户
    // EventBus.$on('disable', msg => {
    //   this.$emit('assistantMsg', msg.data.type, msg);
    // });
    // // 取消禁言某个用户
    // EventBus.$on('permit', msg => {
    //   this.$emit('assistantMsg', msg.data.type, msg);
    // });
    // // 取消禁言某个用户
    // EventBus.$on('chatFilterUrl', url => {
    //   this.$emit('assistantMsg', 'filterUrl', url);
    // });
    // // 图片预览
    // EventBus.$on('imgPreview', imgs => {
    //   this.$emit('assistantMsg', 'imgPreview', imgs);
    // });
    // // 客户端踢出操作
    // EventBus.$on('assistantKickout', msg => {
    //   this.$emit('assistantMsg', 'kickout', msg);
    // });
    // // 支付宝红包打开支付页面
    // EventBus.$on('alipayCashier', url => {
    //   this.$emit('assistantMsg', 'red_url', url);
    // });
    // // 左侧栏选中白板
    // EventBus.$on('doc_loaded', url => {
    //   this.$emit('assistantMsg', 'page', url);
    // });
    // // 开启问答
    // EventBus.$on('open_Qa', url => {
    //   this.$emit('assistantMsg', 'qa', url);
    // });
  },
  methods: {
    initListener() {
      this.msgServer = useMsgServer();
      this.chatServer = useChatServer();
      this.msgServer.$onMsg('JOIN', msg => {
        this.assistantMsg(msg.data.type, msg);
      });
      this.msgServer.$onMsg('LEFT', msg => {
        this.assistantMsg(msg.data.type, msg);
      });
      // 禁言/取消禁言某个用户;
      this.chatServer.$on('banned', msg => {
        this.assistantMsg(msg.data.type, msg);
      });
      //将某人踢出房间
      this.chatServer.$on('roomKickout', msg => {
        this.assistantMsg('kickout', msg);
      });
    },
    //预览图片
    preivewImage(params) {
      this.assistantMsg('imgPreview', params);
    },
    //打开问答管理页面
    openQAAdmin(url) {
      this.assistantMsg('qa', url);
    },
    //打开聊天审核管理页面
    openChatFilterUrl(url) {
      this.assistantMsg('filterUrl', url);
    },
    // 支付宝红包打开支付页面
    openAlipayCashier(url) {
      this.assistantMsg('red_url', url);
    },
    handleAssitant(type) {
      // 获取文档dom
      let container = '';
      try {
        container = document.querySelector('.vhall-document-container');
      } catch (error) {
        console.log(error);
      }
      switch (type) {
        case 1: // 文档
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emiSwitchTo', ['document'])
          );
          break;
        case 2: // 白板
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emiSwitchTo', ['board']));
          break;
        case 3: // 问卷
          this.showAssistantTools('questionnaire');
          this.$refs.questionnaire.open();
          break;
        case 4: // 抽奖
          this.showAssistantTools('lottery');
          this.$refs.lottery.open();
          break;
        case 5: // 签到
          this.showAssistantTools('signLive');
          this.$refs.signLive.openSign();
          break;
        case 6: // 答题
          this.showAssistantTools('qa');
          this.$refs.qa.handleQAPopup();
          break;
        case 7: // 隐藏文档
          container && (container.style.opacity = 0);
          break;
        case 8: // 显示文档
          container && (container.style.opacity = 1);
          break;
        case 9: // 文档最小化
          this.exitFullscreen('#vhall-document-container');
          break;
        case 11: // 打开红包
          this.showAssistantTools('redPacketLive');
          this.$refs.redPacketLive.open();
          break;
        case 12: // 通知文档调用doc.sdk.start
          // EventBus.$emit('live_start');
          break;
        // case 13: // 退出全屏
        //   break;
        // case 14: // 全屏
        //   break;
        case 15: // 计时器
          this.showAssistantTools('lottery');
          this.$refs.lottery.open();
          break;
      }
    },
    handleAssitantDocTool(type) {
      switch (type) {
        case 0: // 隐藏工具栏
          // EventBus.$emit('vhallLayoutExchange', 'doc');
          break;
        case 1: // 显示工具栏
          // EventBus.$emit('vhallLayoutExchange', 'video');
          break;
      }
    },
    handleAssitantKickout(msg, type) {
      delete msg.confirmText;
      // EventBus.$emit('assistantKickoutCallback', { data: msg, type });
    },
    handleAssitantDocFocus(msg) {
      this.$refs.doc && this.$refs.doc.$el.focus();
      this.$refs.doc && this.$refs.doc.$el.click();
    },
    closeAssistantTools() {
      this.closeRedPacketPopup();
      this.closeQuestionarie();
      this.closeQAPopup();
      this.$refs.lotterySon && this.$refs.lotterySon.close();
      this.$refs.signin && this.$refs.signin.closeAutoSignin('client');
    }
  }
};
