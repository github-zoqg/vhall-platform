<template>
  <div class="vmp-exam-list">
    <vh-dialog
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      title="快问快答"
      @open="open"
      width="951px"
      draggable
      custom-class="vmp-exam-dialog"
    >
      <label v-if="createPanel" slot="title">1212331212</label>
      <component :is="componentView" @changeView="handleChangeView" />
    </vh-dialog>
  </div>
</template>
<script>
  export default {
    name: 'VmpExam',
    components: {
      ExamListPanel: () => import('./components/exam-panel.vue'),
      ExamCreate: () => import('./components/exam-create.vue')
    },
    data() {
      return {
        // dialogVisible: false,
        dialogVisible: true,
        componentView: 'ExamListPanel'
      };
    },
    created() {
      // this.childrenComp = window.$serverConfig[this.cuid].children;
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
      handleChangeView(view) {
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
