<template>
  <div id="app">
    <router-view />
    <!-- 授权时遮罩 -->
    <div v-if="!unionid" class="weixin_auth" @click="goAuth"></div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        openId: '',
        unionid: ''
      };
    },
    mounted() {
      console.log('weixin_auth++++++++++++++++++++++++++', 222);
      this.openId = sessionStorage.getItem('open_id');
      this.unionid = localStorage.getItem('unionid');
    },
    methods: {
      goAuth() {
        let url = sessionStorage.getItem('weixin_auth_url');
        window.open(url);
      }
    }
  };
</script>

<style lang="less">
  .el-scrollbar .el-scrollbar__bar {
    // 为了解决ios兼容性问题，下拉框选择时，需要点击两次才能选中
    opacity: 1 !important;
  }
  .weixin_auth {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    position: absolute;
  }
</style>
