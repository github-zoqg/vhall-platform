<template>
  <Exam />
</template>

<script>
  import Exam from '@/packages/exam/src/main.vue';
  export default {
    components: {
      Exam
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
