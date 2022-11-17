<template>
  <div class="vmp-exam-list">
    <vh-dialog
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      title="快问快答"
      @open="open"
      width="951px"
      custom-class="vmp-exam-dialog"
    >
      <div class="exam-main-center">
        <!-- tab切换 -->
        <div class="exam-tabs-layout">
          <vh-tabs v-model="tabType" @tab-click="handleClick" class="live-reset-tabs">
            <vh-tab-pane label="列表" name="table">
              <exam-list ref="examListPanel" @examBtnClick="handleExamBtnClick"></exam-list>
            </vh-tab-pane>
            <vh-tab-pane label="用户信息" name="user">
              <exam-user-info />
            </vh-tab-pane>
          </vh-tabs>
        </div>
        <!-- 快问快答 内容区域 -->
      </div>
    </vh-dialog>
    <!-- 快问快答 - 预览 -->
    <vmp-air-container
      :cuid="childrenComp[0]"
      :oneself="true"
      v-show="currentRow"
    ></vmp-air-container>
  </div>
</template>
<script>
  import ExamList from './components/exam-list.vue';
  import ExamUserInfo from './components/exam-user-info.vue';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpExam',
    components: {
      ExamList,
      ExamUserInfo
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
              vo.currentRow ? JSON.stringify(vo.currentRow) : null,
              'mock'
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
    .vh-dialog__header {
      padding: 24px 32px 8px 32px;
    }
  }
  // element-ui vh-tabs 样式重写
  /*-----------------------------------------重置Tab 开始 ---------------------------------------------*/
  .live-reset-tabs {
    .vh-tabs__header {
      margin: 0 0;
    }
    .vh-tabs__item {
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
    .vh-tabs--bottom .vh-tabs__item.is-bottom:nth-child(2),
    .vh-tabs--bottom .vh-tabs__item.is-top:nth-child(2),
    .vh-tabs--top .vh-tabs__item.is-bottom:nth-child(2),
    .vh-tabs--top .vh-tabs__item.is-top:nth-child(2) {
      padding-left: 24px;
    }
    .vh-tabs__nav-wrap::after {
      height: 1px;
      color: @font-dark-normal;
    }
    .vh-tabs__active-bar {
      background-color: @active-light-normal;
    }
  }
  /*-----------------------------------------重置Tab 结束 ---------------------------------------------*/
</style>
