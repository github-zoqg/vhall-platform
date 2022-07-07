<template>
  <chrome v-if="downloadChrome" :type="'master'"></chrome>
  <tip v-else-if="tipMsg" :text="tipMsg"></tip>
  <vmp-air-container cuid="embedClientRoot" :oneself="true" v-else></vmp-air-container>
</template>

<script>
  import { browserSupport } from '@/app-shared/utils/getBrowserType.js';
  import chrome from '../Chrome.vue';
  import tip from '../MsgTip.vue';
  export default {
    components: {
      chrome,
      tip
    },
    data() {
      return {
        downloadChrome: !browserSupport(),
        tipMsg: '' // info接口返回的错误信息
      };
    },
    created() {}
  };
</script>
