import { assistantMsg, openUrl } from './client-message.js';

//有人离开房间
const cl_left = function (params) {
  assistantMsg('Left', params);
};
//有人加入房间
const cl_join = function (params) {
  assistantMsg('Join', params);
};
// // 禁言某个用户
// const cl_banned = function (params) {
//   assistantMsg('banned', params);
// };
// // 取消禁言某个用户
// const cl_permit = function (params) {
//   assistantMsg('permit', params);
// };
//踢出某人
const cl_kickout = function (params) {
  assistantMsg('kickout', params);
};
//预览图片
const cl_previewImg = function (params) {
  assistantMsg('imgPreview', params);
};
//打开问答管理页面
const cl_openQAAdmin = function (url) {
  assistantMsg('qa', url);
};
//全屏幕切换
const cl_handleScreen = function (status) {
  assistantMsg('docFullscreen', status == 'fullscreen');
};
//通知客户端当前是文档还是白版
const cl_setDocMenu = function (type) {
  assistantMsg('page', type); //type 1:文档,其他白板
};
//打开聊天审核管理页面
const cl_openChatFilterUrl = function (url) {
  assistantMsg('filterUrl', url);
};
// 支付宝红包打开支付页面
const cl_openAlipayCashier = function (url) {
  assistantMsg('red_url', url);
};
//通用客户端新开浏览器页面
const cl_openUrl = function (url) {
  openUrl(url);
};
//通知客户端鼠标滑入文档区域
const cl_moveToDoc = function (status) {
  assistantMsg('docmouseenter', status);
};
//调用客户端toast提示
const cl_toast = function (type, msg) {
  assistantMsg('notice_msg', msg, type);
};
//禁言某人后通知客户端
const cl_banned = function (id) {
  assistantMsg('banned', id);
};
//解除某人禁言后通知客户端
const cl_permit = function (id) {
  assistantMsg('permit', id);
};
export {
  cl_left,
  cl_join,
  cl_banned,
  cl_permit,
  cl_kickout,
  cl_previewImg,
  cl_openQAAdmin,
  cl_handleScreen,
  cl_openChatFilterUrl,
  cl_openAlipayCashier,
  cl_openUrl,
  cl_setDocMenu,
  cl_moveToDoc,
  cl_toast
};
