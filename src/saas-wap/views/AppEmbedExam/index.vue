<template>
  <div class="vmp-basic-layout vmp-basic-layout-app-exam-embed">
    <div class="vmp-basic-container">
      <div :class="`exam-core__container exam-theme--${theme}`">
        <!-- <i class="vh-iconfont vh-line-close exam-close" @click="close"></i> -->
        <div id="examAnswerWapSDK"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    useRoomBaseServer,
    useMsgServer,
    Domain,
    useExamServer,
    setRequestHeaders
  } from 'middle-domain';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  import { ImagePreview } from 'vh5-ui';
  export default {
    name: 'AppEmbedQuestion',
    data() {
      return {
        theme: 'red'
      };
    },
    computed: {
      examUserInfo() {
        return this.examServer.state.examUserInfo;
      }
    },
    async beforeCreate() {
      console.log('看看刷新，是否会触发');
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
        await new Domain({
          plugins: ['chat', 'report', 'exam'],
          isNotInitRoom: true, // 不需要初始化房间
          // 日志上报的参数
          devLogOptions: {
            namespace: 'saas', //业务线
            env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV)
              ? 'production'
              : 'test', // 环境
            method: 'post' // 上报方式
          }
        });
        this.roomBaseServer = useRoomBaseServer();
        this.msgServer = useMsgServer();
        this.initExamSdk();
        //上报日志
        // logRoomInitSuccess();
      } catch (e) {
        console.error('---初始化app-sdk问卷嵌入出现异常--', e);
        //上报日志
        // logRoomInitFailed({ error: e });
      }
    },
    methods: {
      async initExamSdk() {
        this.examServer = useExamServer({
          model: 'appSdk'
        });
        // 事件监听
        // this.initExamEvents();

        this.examServer.setExamExtends(this.params);
        setRequestHeaders({
          token: localStorage.getItem('token') || ''
        });
        await this.examServer.appSdkInit();
        // 打开弹窗
        this.open();
      },
      async open() {
        // 获取列表数据
        let result = await this.examServer.getExamPublishList({});
        // 打开弹窗
        let examItem = result?.data?.find(item => {
          if (item.paper_id == this.params.exam_id) return item;
        });
        if (examItem && examItem.is_end == 1 && examItem.status == 0) {
          // 已结束 && 未作答
          this.$toast('很遗憾，您已错过本次答题机会！');
        } else if (examItem && examItem.status == 1) {
          // 已作答
          this.renderPage('show');
        } else if (examItem && examItem.is_end == 0 && examItem.status == 0) {
          // 可作答
          this.renderPage('answer');
        }
      },

      listenExamWatchMsg(msg, that) {
        if (window.ExamTemplateServer) {
          // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
        }
        if (msg.data.type === that.examServer.EVENT_TYPE.EXAM_PAPER_SEND) {
          //  触发自动弹出 - 快问快答答题
          console.log('收到推送快问快答消息', msg);
        } else if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_END) {
          // TODO 快问快答 - 收卷 —— 更新列表，便于更新小红点
          console.log('收到收卷消息，关闭', msg);
          that.close();
        } else if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_END) {
          // TODO 快问快答 - 自动收卷 —— 更新列表，便于更新小红点
          console.log('收到自动收卷消息，关闭', msg);
          that.close();
        } else if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_SEND_RANK) {
          // TODO 快问快答 - 公布成绩
          console.log('收到公布成绩消息', msg);
        } else if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_SEND_RANK) {
          // TODO 快问快答 - 自动公布成绩
          console.log('收到自动公布成绩消息', msg);
        } else if (msg.data.type == 'live_over') {
          // 结束直播
          that.close();
        }
      },
      initExamEvents() {
        // 监听快问快答消息
        let that = this;
        this.examServer.$on(that.examServer.EVENT_TYPE.EXAM_PAPER_SEND_RANK, msg => {
          alert(1);
          this.listenExamWatchMsg(msg, that);
        });
      },
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
      //图片预览
      previewImg(...args) {
        if ((Array.isArray(args[1]) && !args[1].length) || args[0] < 0) {
          return;
        }
        const newList = JSON.parse(JSON.stringify(args[1]));
        const clientW = document.body.clientWidth;
        const clientH = document.body.clientHeight;
        const ratio = 2;
        for (let i = 0; i < newList.length; i++) {
          if (newList[i].indexOf('?x-oss-process=image/resize') < 0) {
            newList[i] += `?x-oss-process=image/resize,w_${clientW * ratio},h_${
              clientH * ratio
            },m_lfit`;
          }
        }
        console.log('preview', newList);
        ImagePreview({
          images: newList,
          startPosition: args[0],
          lazyLoad: true,
          loop: false,
          getContainer: '.vmp-exam-answer-wap'
        });
      },
      renderPage(answerType) {
        this.$nextTick(() => {
          console.log('当前渲染情况', this.params.examId, answerType);
          // 未答题，直接答题(answerType == 'answer);已答题，查看个人成绩单结果（可以点击去查看答题结果）(answerType == 'score');
          this.examServer.mount({
            examId: this.params.exam_id,
            el: '#examAnswerWapSDK',
            componentName: 'examwap',
            lang: 'zh',
            configs: {
              role: 2,
              pageSize: 1,
              answerType: answerType == 'answer' ? 1 : 2,
              ...{
                userName: this.examUserInfo?.nickname || '',
                headImg: this.examUserInfo?.avatar || '',
                mobile: this.examUserInfo?.phone || ''
              },
              preview: true
            }
          });
          this.examServer.examInstance.$on('PREVIEW', this.previewImg);
        });
      }
    },
    beforeDestroy() {
      this.examServer?.examInstance?.$off('PREVIEW');
    }
  };
</script>
<style lang="less">
  .vmp-basic-layout-app-exam-embed {
    width: 100%;
    height: 100%;
    .exam-core__container {
      width: 100%;
      height: 100%;
      margin: 0 auto;
      overflow: hidden;
      position: relative;
      // 统一定位close
      .exam-close {
        position: absolute;
        right: 32px;
        top: 42px;
        font-size: 24px;
        z-index: 30;
        cursor: pointer;
      }
      .exam-execute-body {
        height: calc(100% - 100px) !important;
        max-height: calc(100% - 100px) !important;
      }
    }
    /** wap端成绩居中 */
    .exam-core__container {
      &.exam-computed-ctx-transcript {
        height: 100%;
        .exam-computed-transcript {
          display: flex;
          .vmp-transcripts-extreme {
            align-self: center;
            margin: -20px auto 0 auto;
          }
        }
      }
    }
  }
</style>
