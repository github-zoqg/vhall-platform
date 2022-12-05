<template>
  <div class="vmp-exam-list">
    <vh-dialog
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      title="快问快答"
      @open="open"
      modal
      :close-on-click-modal="false"
      :width="createPanel ? '1030px' : '951px'"
      custom-class="vmp-exam-dialog"
      append-to-body
    >
      <label v-if="createPanel" slot="title">
        <i
          class="vh-iconfont vh-line-arrow-left cursor-pointer std-color-icon"
          @click="handleChangeView({ view: 'ExamListPanel' })"
        />
        <span class="std-panel-title m-l-8">
          {{ this.currentExamId ? '编辑' : '创建' }}
        </span>
      </label>
      <component
        v-if="dialogVisible"
        :is="componentView"
        @changeView="handleChangeView"
        :currentExamId="currentExamId"
      />
    </vh-dialog>
  </div>
</template>
<script>
  import { useExamServer, useChatServer } from 'middle-domain';
  const examServer = useExamServer();
  export default {
    name: 'VmpExam',
    components: {
      ExamListPanel: () => import('./components/exam-panel.vue'),
      ExamCreate: () => import('./components/exam-create.vue')
    },
    provide: { examServer },
    data() {
      return {
        dialogVisible: false,
        componentView: 'ExamListPanel',
        currentExamId: '' // 当前操作的
      };
    },
    computed: {
      createPanel() {
        return this.componentView === 'ExamCreate';
      }
    },
    async created() {
      this.initExamEvents();
      examServer.init(); // 先执行,防止打开弹窗加载时间太长
    },
    methods: {
      /**
       * 对话框打开事事件
       */
      open() {
        this.dialogVisible = true;
      },
      handleClose() {
        this.dialogVisible = false;
        this.componentView = 'ExamListPanel';
      },
      handleExam(flag) {
        flag ? this.open() : this.handleClose();
      },
      handleChangeView(payload) {
        const { view, examId } = payload;
        this.currentExamId = examId;
        this.componentView = view;
      },
      setChatItemData(msg, eventType) {
        let text = this.$getRoleName(msg.data.room_role);
        if (msg.room_role != 1) {
          text = `${text}${msg.data.nick_name}`;
        }
        text = '';
        let text_content = {
          paper_send: `${text}发起快问快答`, // 推送-快问快答
          paper_send_rank: `${text}公布成绩排行榜`, // 公布-快问快答-成绩
          paper_end: `${text}结束快问快答`, // 快问快答-收卷
          paper_auto_end: '快问快答已结束', // 快问快答-自动收卷
          paper_auto_send_rank: '快问快答已结束， 公布成绩排行榜' // 快问
        };
        return {
          nickname: msg.data.nick_name,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: text_content[eventType],
            exam_id: msg.data.paper_id,
            exam_title: msg.data.paper_title || ''
          },
          roleName: msg.data.role_name,
          type: eventType,
          interactStatus: true, // 消息样式 - 互动消息样式 还是 系统消息样式
          isCheck: false, // 消息是否-允许点击
          isLinkBtn: false // 是否具备点击查看等操作（发起端/PC观看端exam特殊化）
        };
      },
      initExamEvents() {
        // 监听快问快答消息
        let that = this;
        // 推送-快问快答
        examServer.$on(examServer.EVENT_TYPE.EXAM_PAPER_SEND, msg => {
          console.log('aaa', msg);
          useChatServer().addChatToList(that.setChatItemData(msg, msg.data.type));
        });
        // 公布-快问快答-成绩
        examServer.$on(examServer.EVENT_TYPE.EXAM_PAPER_SEND_RANK, msg => {
          console.log('ccccc', msg);
          useChatServer().addChatToList(that.setChatItemData(msg, msg.data.type));
        });
        // 快问快答-收卷
        examServer.$on(examServer.EVENT_TYPE.EXAM_PAPER_END, msg => {
          useChatServer().addChatToList(that.setChatItemData(msg, msg.data.type));
        });
        // 快问快答-自动收卷
        examServer.$on(examServer.EVENT_TYPE.EXAM_PAPER_AUTO_END, msg => {
          useChatServer().addChatToList(that.setChatItemData(msg, msg.data.type));
        });
        // 快问快答-自动公布成绩
        examServer.$on(examServer.EVENT_TYPE.EXAM_PAPER_AUTO_SEND_RANK, msg => {
          console.log('bbbb', msg);
          useChatServer().addChatToList(that.setChatItemData(msg, msg.data.type));
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-exam-dialog {
    height: 558px;
  }
</style>
