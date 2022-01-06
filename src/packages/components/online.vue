<template>
  <span class="vmp-online">
    {{ onlineNum }}
  </span>
</template>
<script>
  export default {
    name: 'VmpOnline',
    data() {
      return {
        uvOnline: 1, // 真实人数
        virtualOnline: 0
      };
    },
    computed: {
      onlineNum() {
        return Number(this.uvOnline) + Number(this.virtualOnline);
      }
    }
  };
</script>
