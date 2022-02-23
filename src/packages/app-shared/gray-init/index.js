import { gray } from 'middle-domain';

export default function grayInit(options) {
  return new Promise(resolve => {
    if (options.meta.grayType == 'webinar') {
      gray
        .initGrayWebinar({
          webinar_id: options.params.id
        })
        .then(res => {
          if (res.code == 200 && res.data) {
            window.sessionStorage.setItem('initGrayId', res.data.user_id);
          } else {
            window.sessionStorage.setItem('initGrayId', null);
          }
          resolve();
        })
        .catch(resolve);
    } else if (options.meta.grayType == 'subject') {
      gray
        .initGraySubject({
          subject_id: options.query.id
        })
        .then(res => {
          if (res.code == 200 && res.data) {
            window.sessionStorage.setItem('initGrayId', res.data.user_id);
          } else {
            window.sessionStorage.setItem('initGrayId', null);
          }
          resolve();
        })
        .catch(resolve);
    } else if (options.meta.grayType == 'user') {
      if (options.params.id) {
        window.sessionStorage.setItem('initGrayId', options.params.id);
      } else {
        window.sessionStorage.setItem('initGrayId', null);
      }
      resolve();
    } else {
      window.sessionStorage.setItem('initGrayId', null);
      resolve();
    }
  });
}
