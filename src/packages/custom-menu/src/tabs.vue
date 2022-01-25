<template>
  <section>
    <ul>
      <li v-for="item in menus" :key="item.id">{{ item.name }}</li>
    </ul>
  </section>
</template>

<script>
  export default {
    name: 'tabs',
    props: {
      menus: {
        type: Array,
        default: () => [],
        require: true
      }
    },
    methods: {}
  };
</script>

<style lang="less"></style>
