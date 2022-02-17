<template>
  <section>
    <div v-html="info.content"></div>
  </section>
</template>

<script>
  export default {
    name: 'component-desimg',
    props: {
      info: {
        required: false
      },
      pagetype: {
        type: String,
        default: 'watch'
      }
    }
  };
</script>

<style lang="less"></style>
