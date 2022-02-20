import Vue from 'vue';

Vue.filter('isEmpty', function (value, replaceStr) {
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

Vue.filter('overHidden', function (value = '', len = 0) {
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
