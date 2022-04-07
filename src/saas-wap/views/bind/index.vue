<template>
  <div class="binding">
    <span :class="isSuccess ? 'success' : 'error'">{{ bindingText || '' }}</span>
  </div>
</template>
<script>
  import { useUserServer } from 'middle-domain';
  import { getQueryString } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'bind',
    data() {
      return {
        isSuccess: true,
        bindingText: null,
        useUserServer: null
      };
    },
    created() {
      this.useUserServer = useUserServer();
      this.getUserInfo();
    },
    methods: {
      getUserInfo() {
        const open_id = getQueryString('open_id');
        const user_auth_key = getQueryString('user_auth_key');
        const params = {
          key: user_auth_key,
          scene_id: 2,
          // source: 1,
          force: 0, // 是否强制绑定微信，0 不强制 1 强制绑定
          mark: this.$route.params.id,
          biz_id: 2,
          channel: 'C'
        };
        // 如果地址栏存在open_id, 更新本地的值
        if (open_id) {
          sessionStorage.setItem('open_id', open_id);
          params.open_id = open_id;
        } else {
          const new_open_id = sessionStorage.getItem('open_id');
          if (new_open_id) {
            params.open_id = open_id;
          }
        }
        if (this.$route.path.indexOf('/lives/bindB') != -1) {
          params.channel = 'B';
        }
        this.useUserServer
          .oauthCallback(params)
          .then(res => {
            if (res && res.code == 200) {
              this.bindingText = this.$t('account.account_1053');
              this.isSuccess = true;
            } else {
              this.bindingText = this.$t('account.account_1054');
              this.isSuccess = false;
            }
          })
          .catch(err => {
            console.log(err);
            this.bindingText = this.$t('account.account_1054');
            this.isSuccess = false;
          });
      }
    }
  };
</script>
<style lang="less" scoped>
  .binding {
    font-size: 40px;
    margin-top: 40%;
    text-align: center;
    .success {
      color: #3b67f9;
    }
    .error {
      color: #fb3a32;
    }
  }
</style>
