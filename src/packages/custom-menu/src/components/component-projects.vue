<template>
  <div class="lives-wrapbox">
    <live-list :checked-list="info.subjects" :pagetype="pagetype" @link="linkWatch" />
  </div>
</template>
<script>
  /**
   * 专题自定义菜单
   */
  import liveList from './live-list';
  export default {
    name: 'component-projects',
    components: {
      liveList
    },
    props: {
      info: {
        required: false
      },
      pagetype: {
        type: String,
        default: 'watch'
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
  .lives-wrap {
    width: 100%;
    margin-bottom: 16px;
  }
</style>
