

import { useUserServer } from 'middle-domain';

export default {
  methods: {
    async initCheckAuth() {
      const userAuthKey = this.$route.query.user_auth_key // url上带的三方授权回调信息
      console.log("🚀 ~ file: chechAuth.js ~ line 6 ~ initCheckAuth ~ userAuthKey", userAuthKey)
      if (!userAuthKey) return false
      const authTag = localStorage.getItem('vmp_auth_tag') || ''
      let sceneId = 1  // scene_id 场景id说明： 1登录 2提现绑定 3账户信息-账号绑定
      if (authTag.indexOf('bind') > -1) {
        sceneId = 3
      }
      if (authTag === 'withdraw') {
        sceneId = 2
      }
      // const sceneId = authTag === 'withdraw' ? 2 : (authTag && authTag.indexOf('bind') > -1 ? 3 : 1);  // scene_id 场景id说明： 1登录 2提现绑定 3账户信息-账号绑定
      const failure = (res) => {
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
            sessionStorage.setItem('bind_result', JSON.stringify(res))
            localStorage.setItem('user_auth_key', userAuthKey)
            if (res.code === 511042) {
              this.$message({
                message: authTag === 'bindWx' ? this.$t('account.account_1078') : this.$t('account.account_1079'),
                showClose: true,
                type: 'warning',
                customClass: 'zdy-info-box'
              });
            }
          }
        }
      }
      await useUserServer().callbackUserInfo({
        source: 2, // 1 控制塔 2观看端 3admin
        key: userAuthKey,
        scene_id: sceneId
      }).then(res => {
        console.log('ok>>>callbackUserInfo回调one结果[成功or失败]', res);
        if (res.code === 200) {
          if (sceneId === 1) {
            localStorage.setItem('token', res.data.token || '');
            localStorage.setItem('userInfo', JSON.stringify(res.data));
          }
          if (sceneId !== 2) {
            console.log("🚀 ~ file: chechAuth.js ~ line 59 ~ awaituseUserServer ~ sceneId", sceneId)
            // 非提现功能时，绑定成功，界面初始化刷新(去掉user_auth_key参数)
            // TODO: url后续得改
            // const url = `${window.location.origin}${process.env.VUE_APP_ROUTE_BASE}/lives/watch/${this.$route.params.id}`
            const url = `${window.location.origin}/lives/watch/${this.$route.params.id}`
            console.log(url)
            window.location.href = url;
          }
        } else {
          failure(res)
        }
      }).catch(res => {
        failure(res)
      });
    }
  }
};
