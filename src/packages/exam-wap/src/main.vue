<template>
  <!-- 快问快答-入口 -->
  <van-popup
    get-container="#otherPopupContainer"
    class="vmp-exam-wap"
    v-model="examVisible"
    position="bottom"
    @close="closeDialog"
    v-if="examVisible"
  >
    <div class="vmp-exam-wap__panel">入口</div>
  </van-popup>
</template>
<script>
  export default {
    name: 'VmpExamWap',
    data() {
      return {
        examVisible: false, // 快问快答-入口
        examId: null
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    methods: {
      // 关闭 快问快答-入口
      closeDialog() {
        this.examVisible = false;
      },
      async open(examId) {
        debugger;
        this.examVisible = true;
        this.examId = examId;
      }
    },
    beforeCreate() {}
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
