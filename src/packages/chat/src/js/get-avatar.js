/**
 * 获取头像
 * */
import defaultAvatar from '../img/my-dark@2x.png';
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
