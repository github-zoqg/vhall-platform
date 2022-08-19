/**
 * 获取头像
 * */
import defaultAvatar from '@/app-shared/utils/avatar';
function getAvatar(avatar) {
  if (!avatar) {
    return defaultAvatar;
  }
  if (/^data:image/.test(avatar)) {
    return avatar;
  }
  if (/^(http|https)/.test(avatar)) {
    return avatar;
  }
  return `https:${avatar}`;
}
export default getAvatar;
