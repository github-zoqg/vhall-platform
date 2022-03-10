// 音量等级
export function calculateAudioLevel(level) {
  let audioLevelValue = 1;
  if (level > 0 && level <= 0.04) {
    audioLevelValue = 1;
  } else if (level > 0.04 && level <= 0.16) {
    audioLevelValue = 2;
  } else if (level > 0.16 && level <= 0.36) {
    audioLevelValue = 3;
  } else if (level > 0.36 && level <= 0.64) {
    audioLevelValue = 4;
  } else if (level > 0.64 && level <= 1) {
    audioLevelValue = 5;
  }
  return audioLevelValue;
}
// 网络状态等级
export function calculateNetworkStatus(status) {
  let netWorkStatus = 2;
  if (status >= 0 && status <= 5) {
    netWorkStatus = 2; // 良
  } else if (status > 5 && status <= 20) {
    netWorkStatus = 1; // 中
  } else if (status > 20 && status <= 100) {
    netWorkStatus = 0; // 差
  } else {
    netWorkStatus = 0;
  }
  return netWorkStatus;
}

/**
 *兼容处理 role | nickname
 * @param {*} stream 流信息
 */
export function streamInfo(stream) {
  Object.prototype.hasOwnProperty.call(stream, 'attributes');
  if (
    stream &&
    Object.keys(stream).length !== 0 &&
    Object.prototype.hasOwnProperty.call(stream, 'attributes')
  ) {
    let arr = Object.keys(stream.attributes);
    if (!Object.prototype.hasOwnProperty.call(stream.attributes, 'roleName')) {
      let role = arr.filter(el => {
        if (el.toLowerCase().indexOf('role') != -1) {
          return el;
        }
      })[0];
      stream.attributes.roleName = stream.attributes[role];
    }
    if (!Object.prototype.hasOwnProperty.call(stream.attributes, 'nickname')) {
      let name = arr.filter(el => {
        if (el.toLowerCase().indexOf('nick') != -1) {
          return el;
        }
      })[0];
      stream.attributes.nickname = stream.attributes[name];
    }
  }
  return stream;
}
