import { user } from 'middle-domain';
console.log('ssoAutoLogin:', user.ssoAutoLogin);
let loaded = false; // 是否已加载

export default () => {
  if (loaded) return Promise.resolve(); // 已经请求过了, 则不再执行后续逻辑
  return new Promise(resolve => {
    user
      .ssoAutoLogin()
      .then(res => {
        if (res.code === 200 && res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
      })
      .finally(() => {
        loaded = true; // 不管接口是否成功, 往下执行
        resolve();
      });
  });
};
