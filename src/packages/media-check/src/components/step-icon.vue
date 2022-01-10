<template>
  <span class="iconfont" :class="[iconStyles]"></span>
</template>

<script>
  export default {
    props: {
      icon: {
        type: String,
        default: ''
      },
      item: {
        type: Object,
        default: () => ({})
      }
    },
    computed: {
      iconStyles() {
        if (this.item.status === 'fail') {
          return 'iconjianceshibai';
        }

        if (this.item.status === 'success') {
          return 'iconjiancechenggong';
        }

        return this.item.icon;
      }
    }
  };
</script>

<style></style>
