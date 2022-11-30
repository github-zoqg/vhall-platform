<template>
  <div class="vmp-basic-layout vmp-basic-layout-app-question-embed">
    <div class="vmp-basic-container">
      <div :class="`exam-core__container exam-theme--${theme}`">
        <i class="vh-iconfont vh-line-close exam-close" @click="close"></i>
        <div id="examAnswerWapSDK"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import { Domain, useExamServer } from 'middle-domain';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  export default {
    name: 'AppEmbedQuestion',
    data() {
      return {
        theme: 'red'
      };
    },
    async created() {
      try {
        this.params = this.$route.query;
        if (this.params && this.params.appId) {
          // 当前为app-sdk嵌入快问快答，更新互动token & token信息
          if (this.params && this.params.token) {
            window.localStorage.setItem('token', this.params.token);
          }
          if (this.params && this.params['interact-token']) {
            window.sessionStorage.setItem('interact_token', this.params['interact-token']);
          }
        }
        debugger;
        await new Domain({
          plugins: ['chat'],
          isNotInitRoom: true // 不需要初始化房间
        });
        debugger;
        this.examServer = useExamServer();
        this.$nextTick(() => {
          this.renderPage(this.params);
        });
        //上报日志
        // logRoomInitSuccess();
      } catch (e) {
        console.error('---初始化app-sdk问卷嵌入出现异常--', e);
        //上报日志
        // logRoomInitFailed({ error: e });
      }
    },
    methods: {
      // 关闭问卷
      close() {
        this.sendToNative();
      },
      // 通知SDK事件
      sendToNative(type, e) {
        const { system } = getBrowserType();
        // 如果是iOS
        if (system == 'ios') {
          // SKWebView
          try {
            window.webkit.messageHandlers.onWebEvent.postMessage(
              JSON.stringify({ event: 'close' })
            );
          } catch (error) {
            console.log(error);
          }
          return;
        } else {
          // 如果是安卓
          try {
            window.messageHandlers.onWebEvent(JSON.stringify({ event: 'close' }));
          } catch (error) {
            console.log(error);
          }
          return;
        }
      },
      renderPage(vo) {
        this.$nextTick(() => {
          // 未答题，直接答题(answerType == 'answer);已答题，查看个人成绩单结果（可以点击去查看答题结果）(answerType == 'score');
          this.examServer.mount({
            examId: vo.examId,
            el: '#examAnswerWapSDK',
            componentName: 'examwap',
            configs: {
              role: 2,
              pageSize: 1,
              answerType: vo.answerType,
              user_name: vo.nick_name || '',
              head_img: vo.avatar || '',
              mobile: vo.phone || ''
            }
          });
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-basic-layout-app-question-embed {
  }
</style>
