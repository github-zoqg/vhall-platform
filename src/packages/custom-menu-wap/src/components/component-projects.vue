<template>
  <div class="lives-wrapbox">
    <project-list :checked-list="info.subjects" @link="linkWatch" />
  </div>
</template>
<script>
  /**
   * 专题自定义菜单
   */
  import projectList from './project-list';
  export default {
    name: 'component-projects',
    components: {
      projectList
    },
    props: {
      info: {
        required: false
      }
    },
    data() {
      return {};
    },
    watch: {
      info: {
        handler() {},
        immediate: true,
        deep: true
      }
    },
    methods: {
      linkWatch() {
        window.location.open(
          window.location.protocol +
            process.env.VUE_APP_WAP_WATCH +
            process.env.VUE_APP_WEB_KEY +
            `/lives/watch/${this.$route.params.il_id}`
        );
      }
    }
  };
</script>
<style lang="less">
  .lives-wrapbox {
    width: 100%;
    margin-bottom: 80px;
  }
</style>
