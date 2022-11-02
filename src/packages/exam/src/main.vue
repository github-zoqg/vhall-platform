<template>
  <div class="vmp-exam-list">
    <el-dialog
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      title="快问快答"
      @open="open"
      top="12vh"
      width="943px"
      custom-class="vmp-exam-dialog"
    >
      <div class="exam-main-center">
        <!-- tab切换 -->
        <div id="examTabsDom" class="exam-tabs-layout">
          <el-tabs v-model="tabType" @tab-click="handleClick" class="live-reset-tabs">
            <el-tab-pane label="列表" name="table"></el-tab-pane>
            <el-tab-pane label="用户信息" name="user"></el-tab-pane>
          </el-tabs>
        </div>
        <!-- 快问快答 内容区域 -->
        <exam-list-panel
          ref="examListPanel"
          v-if="tabType == 'table'"
          @examBtnClick="handleExamBtnClick"
        ></exam-list-panel>
        <exam-user-panel ref="examUserPanel" v-else></exam-user-panel>
      </div>
    </el-dialog>
    <!-- 快问快答 - 预览 -->
    <vmp-air-container
      :cuid="childrenComp[0]"
      :oneself="true"
      v-show="currentRow"
    ></vmp-air-container>
  </div>
</template>
<script>
  import ExamListPanel from './components/exam-list-panel.vue';
  import ExamUserPanel from './components/exam-user-panel.vue';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpExam',
    components: {
      ExamListPanel,
      ExamUserPanel
    },
    data() {
      return {
        dialogVisible: false,
        tabType: 'table',
        childrenComp: [],
        currentRow: null
      };
    },
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    methods: {
      /**
       * 对话框打开事事件
       */
      open() {
        this.dialogVisible = true;
        this.initPage();
      },
      // 关闭对话框
      handleClose() {
        this.dialogVisible = false;
      },
      // 切换tab
      handleClick(tab, event) {
        this.initPage();
      },
      // 列表回调
      handleExamBtnClick(vo) {
        this.currentRow = vo?.currentRow || null;
        if (vo.type == 'preview') {
          // 预览
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitOpenPreview', [
              vo.currentRow ? JSON.stringify(vo.currentRow) : null
            ])
          );
        }
      },
      async initPage() {
        await this.$nextTick(() => {});
        if (this.tabType == 'user') {
          this.$refs.examUserPanel && this.$refs.examUserPanel.initComp();
        } else {
          this.$refs.examListPanel && this.$refs.examListPanel.initComp();
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-exam-dialog {
    height: 558px;
    .el-dialog__header {
      padding: 24px 32px 8px 32px;
    }
  }
  // element-ui el-tabs 样式重写
  /*-----------------------------------------重置Tab 开始 ---------------------------------------------*/
  .live-reset-tabs {
    .el-tabs__header {
      margin: 0 0;
    }
    .el-tabs__item {
      padding: 0 24px;
      box-sizing: border-box;
      display: inline-block;
      list-style: none;
      position: relative;
      font-size: 16px;
      font-family: @fontRegular;
      font-weight: 400;
      color: @font-light-second;
      line-height: 55px;
      height: 55px;

      &.is-active {
        color: @active-light-normal;
      }
    }
    .el-tabs--bottom .el-tabs__item.is-bottom:nth-child(2),
    .el-tabs--bottom .el-tabs__item.is-top:nth-child(2),
    .el-tabs--top .el-tabs__item.is-bottom:nth-child(2),
    .el-tabs--top .el-tabs__item.is-top:nth-child(2) {
      padding-left: 24px;
    }
    .el-tabs__nav-wrap::after {
      height: 1px;
      color: @font-dark-normal;
    }
    .el-tabs__active-bar {
      background-color: @active-light-normal;
    }
  }
  /*-----------------------------------------重置Tab 结束 ---------------------------------------------*/
</style>
