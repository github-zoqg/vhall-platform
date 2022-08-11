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
      desc = '凌晨'; // webinar.webinar_1027
    } else if (hour >= 6 && hour < 12) {
      desc = '早上'; //  webinar.webinar_1028
    } else if (hour >= 12 && hour < 18) {
      desc = '下午'; // webinar.webinar_1029
    } else if (hour >= 18 && hour < 24) {
      desc = '晚上'; // webinar.webinar_1030
    } else {
      desc = '';
    }
    return desc ? `${desc} ${time}` : time;
  } else {
    return '';
  }
};
/**
 * 补零
 * */
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
//日期格式化
Date.prototype.format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
  return fmt;
};
const handleChatShowTime = (preMsgTime, curMsgTime) => {
  // 如果是第一条消息,显示 showTime
  if (!preMsgTime) {
    return dayjs(curMsgTime).format('HH:mm');
  }
  // 如果是同一天的同一小时发的消息, showTime 为空串
  if (preMsgTime.slice(0, 13) === curMsgTime.slice(0, 13)) {
    return '';
  }
  return dayjs(curMsgTime).format('HH:mm');
};
export { handleTime, formatTime, handleChatShowTime };
