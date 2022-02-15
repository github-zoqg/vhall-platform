<template>
  <section class="vmp-rebroadcast">
    <saas-dialog :visible="isShow" title="转播" width="800px" style="min-width: 800px">
      <rebroadcast />
    </saas-dialog>
  </section>
</template>

<script>
  import SaasDialog from '@/packages/pc-alert/src/dialog.vue';
  import Rebroadcast from './rebroadcast.vue';

  export default {
    name: 'VmpRebroadcast',
    components: {
      SaasDialog,
      Rebroadcast
    },
    data() {
      return {
        isShow: true
      };
    },
    created() {
      window.rebroadcast = this;
    },
    methods: {
      showRebroadcast() {
        this.isShow = false;
      }
    }
  };
</script>

<style></style>
