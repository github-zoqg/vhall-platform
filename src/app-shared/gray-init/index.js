import { roomSubjectApi, roomApi, setRequestHeaders } from 'middle-domain';

/**
 * 灰度初始化
 * @param {*} options
 * @returns
 */
export default function grayInit(options) {
  return new Promise(resolve => {
    if (options.meta.grayType == 'webinar') {
      roomApi.webinar
        .webinarInitBefore({
          webinar_id: options.params.id,
          source: options.source
        })
        .then(res => {
          const grayUserId = (res.code == 200 && res.data && res.data.user_id) || null;
          setGrayUserId(grayUserId);
          resolve(res);
        })
        .catch(res => {
          console.log('webinarInitBefore------->', res.response);
          resolve({
            code: res.response.status
          });
        });
    } else if (options.meta.grayType == 'subject') {
      roomSubjectApi.subject
        .subjectInitBefore({
          subject_id:
            options.path.indexOf('/subject/entryform/') != -1 ? options.params.id : options.query.id
        })
        .then(res => {
          const grayUserId = (res.code == 200 && res.data && res.data.user_id) || null;
          setGrayUserId(grayUserId);
          resolve(res);
        })
        .catch(res => {
          console.log('subjectInitBefore------->', res.response);
          resolve({
            code: res.response.status
          });
        });
    } else if (options.meta.grayType == 'user') {
      const grayUserId = options.params.id || null;
      setGrayUserId(grayUserId);
      resolve();
    } else {
      setGrayUserId(null);
      resolve();
    }
  });
}

/**
 * 设置灰度id
 */
function setGrayUserId(grayUserId) {
  // 存储到 session
  window.sessionStorage.setItem('initGrayId', grayUserId);
  // 设置 domain requestHeader
  setRequestHeaders({
    'gray-id': grayUserId
  });

  //添加性能监控判断
  if (window.saas_aegis) {
    if (Object.prototype.toString.call(grayUserId) != '[object Null]') {
      window.saas_aegis.setConfig({
        uin: `${grayUserId}`
      });
    }
  }
}
