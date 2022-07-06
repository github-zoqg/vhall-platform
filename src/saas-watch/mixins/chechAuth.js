import { useUserServer } from 'middle-domain';

export default {
  methods: {
    async initCheckAuth(watchPageType = 'watch') {
      console.log('initCheckAuth');
      const userAuthKey = this.$route.query.user_auth_key; // url上带的三方授权回调信息
      if (!userAuthKey) return false;
      const authTag = localStorage.getItem('vmp_auth_tag') || '';
      let sceneId = 1; // scene_id 场景id说明： 1登录 2提现绑定 3账户信息-账号绑定
      if (authTag.indexOf('bind') > -1) {
        sceneId = 3;
      }
      if (authTag === 'withdraw') {
        sceneId = 2;
      }
      // const sceneId = authTag === 'withdraw' ? 2 : (authTag && authTag.indexOf('bind') > -1 ? 3 : 1);  // scene_id 场景id说明： 1登录 2提现绑定 3账户信息-账号绑定
      const failure = res => {
        console.log('initCheckAuth, failure');
        if (!authTag) {
          this.$message({
            message: `${this.$t(res.code) || res.msg} || ${sceneId == 1 ? '登录失败' : '绑定失败'}`,
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          // 登录失败，清空所有缓存 [观看端，提现也是回调页面，因此也清除缓存]
          window.localStorage.clear();
          window.sessionStorage.clear();
        } else {
          // 非200情况下，若是账户信息-账号绑定（绑定QQ Or 绑定微信，scene_id = 3）等，判定code码是否等于511042，若是表示账号已被绑定过
          if (authTag.indexOf('bind') !== -1) {
            sessionStorage.setItem('bind_result', JSON.stringify(res));
            localStorage.setItem('user_auth_key', userAuthKey);
            if (res.code === 511042) {
              this.$message({
                message:
                  authTag === 'bindWx'
                    ? this.$t('account.account_1078')
                    : this.$t('account.account_1079'),
                showClose: true,
                type: 'warning',
                customClass: 'zdy-info-box'
              });
            }
          }
        }
        const st = setTimeout(() => {
          clearTimeout(st);
          const url = `${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/${watchPageType}/${this.$route.params.id}`;
          console.log('initCheckAuth, url', url);
          window.location.href = url; // 去除参数上的user_auth_key
        }, 3000);
      };
      await useUserServer()
        .oauthCallback({
          source: 2, // 1 控制塔 2观看端 3admin
          key: userAuthKey,
          scene_id: sceneId
        })
        .then(res => {
          if (res.code === 200) {
            if (sceneId === 1) {
              localStorage.setItem('token', res.data.token || '');
              localStorage.setItem('userInfo', JSON.stringify(res.data));
            }
            if (sceneId !== 2) {
              // 非提现功能时，绑定成功，界面初始化刷新(去掉user_auth_key参数)
              const url = `${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/${watchPageType}/${this.$route.params.id}`;
              window.location.href = url;
            }
          } else {
            failure(res);
          }
        })
        .catch(res => {
          failure(res);
        });
    }
  }
};
