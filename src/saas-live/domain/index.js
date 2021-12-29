import { setBaseUrl, setRequestHeaders } from 'vhall-sass-domain';
// setBaseUrl(process.env.VUE_APP_MOCK_BASE_URL);
setBaseUrl('https://t-saas-dispatch.vhall.com');

setRequestHeaders({
  platform: 10
});
