import { setBaseUrl, setRequestHeaders } from 'vhall-sass-domain';
setBaseUrl(process.env.VUE_APP_MOCK_BASE_URL);

setRequestHeaders({
  platform: 10
});
