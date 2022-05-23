import Vue from 'vue';
import moment from 'moment';
/**
 * 原知客用到
 */
Vue.filter('isEmpty', (value, replaceStr) => {
  replaceStr = replaceStr || '--';
  return value || replaceStr;
});

Vue.filter('fmtTime', value => {
  const h = (((value / 3600) >> 0) + '').padStart(2, 0);
  const m = (((value / 60) % 60 >> 0) + '').padStart(2, 0);
  const s = ((value % 60 >> 0) + '').padStart(2, 0);
  return `${h}:${m}:${s}`;
});

Vue.filter('chatTime', value => {
  if (value < 15) return value;
  if (value.substring(0, 10) === new Date(value).format('yyyy-MM-dd')) {
    return value.substring(11, 16);
  }
  return value.substring(0, 16);
});

/**
 * 字符串截取,超出点点点
 */
Vue.filter('overHidden', (value = '', len = 0) => {
  if (value === null || value === undefined) return '';
  if (value.length > len) {
    return value.substring(0, len) + '...';
  }
  return value;
});

Vue.filter('gender', val => {
  if (val === 'M') {
    return '男';
  }
  if (val === 'W') {
    return '女';
  }
  if (val === 'U') {
    return '未知';
  }
  return '未知';
});

Vue.filter('fmtNewPrice', (prePrice, goods) => {
  if (goods.free === 'Y') {
    return '免费';
  }
  if (prePrice === '' || prePrice <= 0) {
    // 未填写优惠价格
    // 未填写优惠价格
    return `¥${parseFloat(goods.price)}`;
  }
  return `¥${parseFloat(prePrice)}`;
});

Vue.filter('fmtOldPrice', price => {
  return `¥${parseFloat(price)}`;
});

Vue.filter('fmtDeposit', deposit => {
  if (deposit === '' || deposit <= 0) {
    // 未填写优惠价格
    return '--';
  } else {
    return `¥${parseFloat(deposit)}`;
  }
});

/**
 * 时间过滤器
 */
Vue.filter('fmtTimeByExp', (time, exp) => {
  let date = null;
  let relt = '-';
  if (time instanceof Date) {
    date = time;
  } else if (typeof time === 'string') {
    date = new Date(time.replace(new RegExp(/-/gm), '/'));
  } else {
    return relt;
  }
  const padZerp = num => {
    return `${num}`.padStart(2, '0');
  };
  const yy = date.getFullYear();
  const MM = padZerp(date.getMonth() + 1);
  const dd = padZerp(date.getDate());
  const hh = padZerp(date.getHours());
  const mm = padZerp(date.getMinutes());
  const ss = padZerp(date.getSeconds());
  switch (exp) {
    case 'hh:mm:ss':
      relt = `${hh}:${mm}:${ss}`;
      break;
    case 'hh:mm':
      relt = `${hh}:${mm}`;
      break;
    case 'yy-MM-dd hh:mm':
      relt = `${yy}-${MM}-${dd} ${hh}:${mm}`;
      break;
    case '年月日时分':
      relt = `${yy}年${MM}月${dd}日 ${hh}:${mm}`;
      break;
    default:
      relt = `${yy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
      break;
  }
  return relt;
});

// 热度、在线人数过滤器
Vue.filter('formatHotNum', value => {
  value = parseInt(value);
  let unit = '';
  const k = 99999;
  const sizes = [
    '',
    window.i18n.t('common.common_1014'),
    window.i18n.t('common.common_1015'),
    window.i18n.t('common.common_1016')
  ];
  // const sizes = ['', '万', '亿', '万亿'];
  let i;
  if (value > k) {
    i = Math.floor(Math.log(value) / Math.log(k));
    value = (value / Math.pow(k / 10, i)).toFixed(1);
    unit = sizes[i];
  }
  return value + unit;
});

// 邀请榜人数
Vue.filter('filterInvitePeople', val => {
  const num = Number(val);
  if (num > 10000) {
    return (num / 10000).toFixed(2) + window.i18n.t('common.common_1014');
  }
  return parseInt(num);
});

// 打赏金额
Vue.filter('filterAmount', val => {
  const num = Number(val);
  if (num > 10000) {
    return (num / 10000).toFixed(2) + window.i18n.t('common.common_1014');
  }
  return num.toFixed(2);
});

// 播放器回放时间转化
Vue.filter('secondToDate', (val, type) => {
  // type= 1 :表示章节
  let time = moment.duration(val, 'seconds');
  let hours = time.hours();
  let minutes = time.minutes();
  let seconds = time.seconds();
  let totalTime = '00:00';
  if (hours || type == 1) {
    totalTime = moment({ h: hours, m: minutes, s: seconds }).format('HH:mm:ss');
  } else {
    totalTime = moment({ m: minutes, s: seconds }).format('mm:ss');
  }
  return totalTime;
});

// 点赞
Vue.filter('transformWatchPraise', num => {
  num = Number(num);
  if (num < 10000) {
    return num;
  } else if (num >= 10000 && num < 1000000) {
    const n = Math.floor(num / 10000);
    let l = Math.floor((num % 10000) / 1000); // eslint-disable-line
    l = l === 0 ? '' : '.' + l;
    return (num = n + l + 'w');
  } else {
    return (num = '999w');
  }
});

// 聊天数
Vue.filter('filterChatCount', num => {
  if (num > 9999) {
    return 9999 + '+';
  } else {
    return num;
  }
});
