<template>
  <Rank />
</template>

<script>
  // import Exam from '@/packages/exam/src/main.vue';
  import Rank from '@/packages/exam-rank/src/rank-watch.vue';
  export default {
    components: {
      // Exam,
      Rank
    },
    data() {
      return {
        dialogVisible: true
      };
    },
    methods: {
      handleClose() {}
    }
  };
</script>

<style lang="less"></style>
