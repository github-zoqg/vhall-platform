<template>
  <span class="vmp-hot">
    {{ hotNum }}
  </span>
</template>
<script>
  export default {
    name: 'VmpHot',
    data() {
      return {
        uvHot: 1, // 真实热度
        virtualHot: 0
      };
    },
    computed: {
      hotNum() {
        return Number(this.uvHot) + Number(this.virtualHot);
      }
    }
  };
</script>
