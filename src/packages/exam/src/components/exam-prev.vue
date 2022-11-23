<template>
  <div class="exam-prev">
    <div ref="ExamCreate"></div>
  </div>
</template>
<script>
  export default {
    name: 'ExamCreate',
    inject: ['examServer'],
    props: {
      prevExamId: {
        type: [String, Number],
        default() {
          return '';
        }
      }
    },

    mounted() {
      this.initComp();
    },
    methods: {
      initComp() {
        const el = this.$refs.ExamCreate;
        console.log('🚀 ~ file: exam-create.vue ~ line 18 ~ currentExamId', this.currentExamId);
        this.examServer.mount({
          componentName: 'examedit',
          examId: this.currentExamId,
          el,
          configs: {
            role: 1,
            source_id: 863283088,
            source_type: 1,
            client: 'live'
          }
        });
      }
    }
  };
</script>
