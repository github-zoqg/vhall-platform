let count = 0;
export default class Msg {
  constructor(params = {}) {
    let {
      avatar = '',
      sendId = '',
      nickname = '',
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
      isHistoryMsg = false,
      interactStatus = false,
      isCheck = false,
      interactToolsStatus = false
    } = params;

    // 用户id
    this.type = type;
    this.avatar = avatar;
    this.sendId = sendId;
    this.nickname = nickname;
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
    this.interactStatus = interactStatus;
    this.isCheck = isCheck;
    this.interactToolsStatus = interactToolsStatus;
  }
}
