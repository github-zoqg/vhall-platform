export function computeRecordTime(val) {
  const s = val; // 秒
  let m = 0; // 分
  if (s > 59) {
    m = s / 60;
  }
  return parseInt(m);
}

export function sleep(ms = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function secondToDateZH(result) {
  function mat(ms) {
    const val = ms + '';
    if (val.length < 2) {
      return '0' + val;
    }
    return val;
  }
  const h = mat(Math.floor(result / 3600));
  const m = mat(Math.floor((result / 60) % 60));
  const s = mat(Math.floor(result % 60));

  // let _h = h > 0 ? h + "时" : '';
  // let _m = m > 0 ? m + "分" : '';
  // let _s = s > 0 ? s + "秒" : '';
  if (h <= 0) {
    return `${m}:${s}`;
  } else {
    return `${h}:${m}:${s}`;
  }
}
export function isIE() {
  return (
    !!window.ActiveXObject || 'ActiveXObject' in window || navigator.userAgent.indexOf('Edge') > -1
  );
}

export function windowVersion() {
  const version = navigator.userAgent;
  if (version.indexOf('Windows') != -1) {
    if (version.indexOf('Windows NT 10.0') != -1) {
      return 'win10';
    } else if (version.indexOf('Windows NT 6.2') != -1) {
      return 'win8';
    } else if (version.indexOf('Windows NT 6.1') != -1) {
      return 'win7';
    }
  } else {
    return 'ios';
  }
}

export function resize() {
  if (isIE()) {
    var evt = window.document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);
  } else {
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
  }
}
