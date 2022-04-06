import Vue from 'vue';
import { useRoomBaseServer } from 'middle-domain';

let i18n;

/**
 * 将服务端返回的 role_name 转成对应的文字
 * @param {String,Number} value 服务端返回的角色字段
 * @param {Boolean} isRegular 角色名称是否根据接口字段变更，true 为不变更
 * @param {Object} vm vue 实例或者是 component 实例
 * @param {String} type 默认值：number 根据数字转； string 的时候会根据字符串（host、assistant）转
 * @returns {String} 最终的角色
 */
function getRoleName(value, isRegular = false) {
  const customRoleName = useRoomBaseServer().state.customRoleName;
  let ret = '';
  /^\d+$/.test(value) && (value = Number(value));
  switch (value) {
    case 1:
    case 'host':
      ret = isRegular
        ? i18n.t('chat.chat_1022')
        : Vue.prototype.$tdefault.call(i18n, customRoleName[1]);
      break;
    case 2:
      ret = i18n.t('chat.chat_1063');
      break;
    case 3:
    case 'assistant':
      ret = isRegular
        ? i18n.t('chat.chat_1024')
        : Vue.prototype.$tdefault.call(i18n, customRoleName[3]);
      break;
    case 4:
    case 'guest':
      ret = isRegular
        ? i18n.t('chat.chat_1023')
        : Vue.prototype.$tdefault.call(i18n, customRoleName[4]);
      break;
    case 20:
      ret = i18n.t('chat.chat_1064');
      break;
    default:
      ret = i18n.t('chat.chat_1062');
      return ret;
  }
  return ret;
}

Vue.prototype.$getRoleName = getRoleName;

function initRoleFilter(i18nInstance) {
  i18n = i18nInstance;
  Vue.filter('roleFilter', function (value, isRegular) {
    return getRoleName(value, isRegular);
  });
}

export { initRoleFilter, getRoleName };
