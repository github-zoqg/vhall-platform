<template>
  <div class="exam-create-edit">
    <div ref="ExamCreate"></div>
  </div>
</template>
<script>
  import { useExamServer } from 'middle-domain';
  export default {
    name: 'ExamCreate',
    data() {
      return {};
    },
    mounted() {
      this.examServer = useExamServer();
      this.initComp();
    },
    methods: {
      initComp() {
        const el = this.$refs.ExamCreate;
        this.examServer.mount({
          componentName: 'examedit',
          id: '',
          el,
          configs: {
            role: 1,
            source_id: 863283088,
            source_type: 1
          }
        });
      }
    }
  };
</script>
