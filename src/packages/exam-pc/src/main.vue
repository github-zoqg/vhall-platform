<template>
  <!-- 快问快答-鉴权 -->
  <vmp-air-container
    :oneself="true"
    :cuid="childrenCom[0]"
    v-if="isFirstAnswer"
  ></vmp-air-container>
  <vmp-air-container :oneself="true" :cuid="childrenCom[1]" v-else></vmp-air-container>
</template>
<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { useExamServer } from 'middle-domain';
  export default {
    name: 'VmpExamPc',
    data() {
      return {
        examId: null,
        isFirstAnswer: true, // 是否首次答题
        childrenCom: []
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    methods: {
      async open(examId) {
        this.examId = examId;
        // 判断当前是否首次答题，若是跳转首次答题区间；若不是，进入答题区间
        this.isFirstAnswer = false;
        await this.$nextTick(() => {});
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(
            this.cuid,
            this.isFirstAnswer ? 'emitExamCollectOpen' : 'emitExamAnswerOpen',
            [examId]
          )
        );
      }
    },
    created() {
      this.ExamServer = useExamServer();
      this.childrenCom = window.$serverConfig[this.cuid].children;
    }
  };
</script>
<style lang="less" scoped>
  .vmp-exam-wap {
    height: 844px;
    background: transparent;
    background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
    border-radius: 40px 40px 0px 0px;
    &__panel {
      text-align: center;
    }
  }
</style>
