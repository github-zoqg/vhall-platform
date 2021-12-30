let count = 0;
export default class Msg {
  constructor({
    avatar = '',
    sendId = '',
    nickName = '',
    type = 'text',
    showTime = '',
    roleName = '',
    content = {},
    sendTime = '',
    client = '',
    replyMsg = {},
    msgId = '',
    channel = '',
    atList = [],
    isHistoryMsg = false
  }) {
    // 用户id
    this.type = type;
    this.avatar = avatar;
    this.sendId = sendId;
    this.nickName = nickName;
    this.roleName = roleName;
    this.content = content;
    this.showTime = showTime;
    this.sendTime = sendTime;
    this.client = client;
    this.count = count++;
    this.replyMsg = replyMsg;
    this.msgId = msgId;
    this.channel = channel;
    this.atList = atList;
    this.isHistoryMsg = isHistoryMsg;
  }
}
