<template>
  <div class="exam-list-panel">
    <!-- tab切换 -->
    <div class="exam-tabs-layout">
      <vh-tabs v-model="tabType" class="live-reset-tabs">
        <vh-tab-pane label="列表" name="table">
          <exam-list
            ref="examListPanel"
            @examBtnClick="handleExamBtnClick"
            @changeView="handleChangeView"
          />
        </vh-tab-pane>
        <vh-tab-pane label="用户信息" name="user">
          <exam-user-info />
        </vh-tab-pane>
      </vh-tabs>
    </div>
    <!-- 快问快答 内容区域 -->
  </div>
</template>
<script>
  import ExamList from './exam-list.vue';
  import ExamUserInfo from './exam-user-info.vue';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  import changeView from '../common/mixins/changeView.js';

  export default {
    name: 'VmpExamPanel',
    mixins: [changeView],
    components: {
      ExamList,
      ExamUserInfo
    },
    data() {
      return {
        tabType: 'table',
        childrenComp: [],
        currentRow: null
      };
    },
    methods: {
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
      // async initPage() {
      //   await this.$nextTick(() => {});
      //   if (this.tabType == 'user') {
      //     this.$refs.examUserPanel && this.$refs.examUserPanel.initComp();
      //   } else {
      //     this.$refs.examListPanel && this.$refs.examListPanel.initComp();
      //   }
      // },
      handleChangeView(view) {
        console.log('🚀 ~ file: exam-panel.vue ~ line 68 ~ handleChangeView ~ view', view);
        this.$emit('changeView', view);
      }
    }
  };
</script>
<style lang="less">
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
</style>
