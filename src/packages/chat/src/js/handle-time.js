const handleTime = date => {
  if (!date) {
    return '';
  }
  const preDate = new Date(date);
  const startTimeStamp = preDate.getTime();
  const diff = Date.now() - startTimeStamp;
  if (diff > 4 * 60 * 1000) {
    const newDate = new Date();
    const hour = newDate.getHours();
    const minutes = newDate.getMinutes();
    const time = `${padZero(hour)}:${padZero(minutes)}`;
    let desc = '';
    if (hour >= 0 && hour < 6) {
      desc = '凌晨';
    } else if (hour >= 6 && hour < 12) {
      desc = '早上';
    } else if (hour >= 12 && hour < 18) {
      desc = '下午';
    } else if (hour >= 18 && hour < 24) {
      desc = '晚上';
    } else {
      desc = '';
    }
    return desc ? `${desc} ${time}` : time;
  } else {
    return '';
  }
};
function padZero(str) {
  str = String(str);
  return str.length == 1 ? `0${str}` : str;
}
const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join('-') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  );
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};
export { handleTime, formatTime };
