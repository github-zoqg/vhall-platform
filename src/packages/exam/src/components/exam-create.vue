<template>
  <div class="exam-create-edit">
    <div ref="ExamCreate"></div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'ExamCreate',
    inject: ['examServer'],
    props: {
      currentExamId: {
        type: [String, Number],
        default() {
          return '';
        }
      }
    },
    mounted() {
      this.initComp();
    },
    beforeDestroy() {
      this.examServer.$off(this.examServer.events['SUBMITEDIT'], this.createSuccess);
    },
    methods: {
      initComp() {
        const el = this.$refs.ExamCreate;
        const { watchInitData } = useRoomBaseServer().state;
        this.examServer.mount({
          componentName: 'examedit',
          examId: this.currentExamId,
          el,
          configs: {
            role: 1,
            source_id: watchInitData?.webinar?.id,
            source_type: 1,
            client: 'live'
          }
        });
        console.log(this.examServer);
        this.examServer.examInstance.$on(
          this.examServer.examInstance.events['SUBMITEDIT'],
          this.createSuccess
        );
      },
      createSuccess() {
        alert('保存成功');
      }
    }
  };
</script>
