function getAvatar(avatar) {
  if (!avatar) {
    return 'https://cnstatic01.e.vhall.com/3rdlibs/vhall-static/img/default_avatar.png';
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
