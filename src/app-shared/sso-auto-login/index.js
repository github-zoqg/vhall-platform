import { user } from 'middle-domain';
import { getCookie } from '@/app-shared/utils/tool';
const bizId = 2; // 化蝶的业务线id
const platform = 7; // pc观看端的平台配置
let loaded = false; // 是否已加载
/**
 * @description 验证cookie是否需要请求接口置换token
 * @returns true 需要, false 不需要
 */
function verifyCookie() {
  const ssoToken = getCookie('sso_token'); // 用户中心的用户token
  const ssoLoginStatus = getCookie('sso_login_status'); // 用户在用户中心的状态(1为登录)
  const ssoTokenOrigin = getCookie('sso_token_origin'); // 用户登录的业务线
  if (ssoLoginStatus === '0') {
    localStorage.removeItem('token');
    return false;
  }
  if (!ssoToken) return false;
  const currentOrigin = `${bizId}_${platform}`;
  const isSameOrigin = ssoTokenOrigin === currentOrigin; // 是否同业务线
  return !isSameOrigin;
}

export default () => {
  if (loaded || !verifyCookie()) return Promise.resolve();
  return new Promise(resolve => {
    user
      .ssoAutoLogin()
      .then(res => {
        if (res.code === 200) {
          const data = res.data;
          if (data.login_status === 0) return localStorage.removeItem('token'); // 登出操作
          data.token && localStorage.setItem('token', data.token);
        }
      })
      .finally(() => {
        loaded = true; // 不管接口是否成功, 往下执行
        resolve();
      });
  });
};
