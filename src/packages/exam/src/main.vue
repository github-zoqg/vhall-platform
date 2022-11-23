<template>
  <div class="vmp-exam-list">
    <vh-dialog
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      title="快问快答"
      @open="open"
      :width="createPanel ? '1030px' : '951px'"
      draggable
      custom-class="vmp-exam-dialog"
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
        :is="componentView"
        @changeView="handleChangeView"
        :currentExamId="currentExamId"
      />
    </vh-dialog>
  </div>
</template>
<script>
  import { useExamServer } from 'middle-domain';
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
    methods: {
      /**
       * 对话框打开事事件
       */
      open() {
        this.dialogVisible = true;
      },
      handleClose() {
        this.dialogVisible = false;
      },
      handleChangeView(payload) {
        const { view, examId } = payload;
        this.currentExamId = examId;
        this.componentView = view;
      }
    }
  };
</script>
<style lang="less">
  .vmp-exam-dialog {
    height: 558px;
  }
</style>
