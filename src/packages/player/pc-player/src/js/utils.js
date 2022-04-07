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
