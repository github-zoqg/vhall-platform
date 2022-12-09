import Vue from 'vue';
import { padZero } from '@/app-shared/utils/handle-time';
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
  if (value.substring(0, 10) === dayjs(value).format('YYYY-MM-DD')) {
    return value.substring(11, 16);
  }
  return value.substring(0, 16);
});

Vue.filter('examTimeByMinute', value => {
  let hour = Math.floor(value / 60);
  let minute = value - hour * 60;
  return `${hour > 9 ? hour : `0${hour}`}:${minute > 9 ? minute : `0${minute}`}`;
});

Vue.filter('fmtUseTime', time => {
  time = parseInt(time) || 0;
  const mm = `${Math.floor(time / 60)}`.padStart(2, '0');
  const ss = `${Math.floor(time % 60)}`.padStart(2, '0');
  return `${mm}:${ss}`;
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
  return dayjs(time).format(exp);
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
  let time = val;
  let hours = padZero(Math.floor(time / (60 * 60)));
  time = time % (60 * 60);
  let minutes = padZero(Math.floor(time / 60));
  time = time % 60;
  let seconds = padZero(Math.floor(time));
  let totalTime = '';
  if (hours != '00' || type == 1) {
    totalTime = hours + ':' + minutes + ':' + seconds;
  } else {
    totalTime = minutes + ':' + seconds;
  }
  return totalTime;
});

// 点赞
Vue.filter('transformWatchPraise', num => {
  num = Number(num);
  if (num < 10000) {
    return num;
  } else {
    const n = (num / 10000).toFixed(1);
    if (n > 999.9) {
      return '999.9w';
    }
    return n + 'w';
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
