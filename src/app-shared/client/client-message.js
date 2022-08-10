export function assistantMsg(type, msg, error_type = null) {
  console.log('接受客户上下线消息、前端异常提示等', { type, msg, error_type });
  let messageObj = { type, msg };
  if (type === 'notice_msg' && error_type) {
    messageObj.error_type = error_type;
  }
  console.log('通知客户端', messageObj);
  window.JsCallQtMsg(JSON.stringify(messageObj)); // Join,Leave
}
//调用浏览器新开页面
export function openUrl(url) {
  console.log('调用客户端新开页面');
  window.JsCallQtOpenUrl(url);
}
