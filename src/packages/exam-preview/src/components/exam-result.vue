<template>
  <div class="exam-result">
    <div class="exam-result__score">满分！</div>
    <div class="exam-result__img"><img src="../img/cup.jpeg" /></div>
    <div class="exam-result__remark">太棒了，全部答对了！</div>
    <div class="exam-result__btn">
      <el-button type="primary" round size="medium" @click="showExamVal">查看答案</el-button>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpExamResult',
    data() {
      return {};
    },
    methods: {
      showExamVal() {
        this.$emit('model', 'show');
      },
      initComp() {}
    },
    created() {
      this.initComp();
    }
  };
</script>
<style lang="less" scoped>
  .exam-result {
    &__score {
      font-size: 24px;
      text-align: center;
      color: #2b2b2b;
      margin-bottom: 16px;
      margin-top: 24px;
    }
    &__img {
      width: 200px;
      height: 200px;
      margin: 0 auto 16px auto;
      display: block;
      img {
        width: 200px;
        height: 200px;
        margin: 0 auto;
        display: block;
      }
    }
    &__remark {
      text-align: center;
      margin-bottom: 16px;
    }
    &__btn {
      text-align: center;
    }
  }
</style>
