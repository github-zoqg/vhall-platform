<template>
  <div class="exam-create-edit">
    <div ref="ExamCreate"></div>
  </div>
</template>
<script>
  export default {
    name: 'ExamCreate',
    inject: ['examServer'],
    data() {
      return {};
    },
    mounted() {
      this.initComp();
    },
    methods: {
      initComp() {
        const el = this.$refs.ExamCreate;
        this.examServer.mount({
          type: 'edit',
          id: '12371937',
          el,
          props: {
            id: '12371937',
            client: 'live'
          }
        });
      }
    }
  };
</script>
