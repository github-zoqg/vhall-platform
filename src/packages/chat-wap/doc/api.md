####订阅消息通知
| 事件名称 | 事件说明 |
| ---- | ---- |
| receiveMsg | 收到聊天消息 |
| atMe | @我的消息 |
| replyMe | 回复我的消息 |
| banned | 禁言我 |
| allBanned | 禁言全员 |
| roomKickout | 把我踢出房间 |

####第三方依赖
| 依赖包名称 | 功能 | 文档 |
| ---- | ---- | ---- |
| vue-virtual-scroll-list | 虚拟列表 | <https://tangbc.github.io/vue-virtual-scroll-list/#/chat-room>|

####关联接口
| 接口说明 | domain 中路径 | 方法名 |
| ---- | ---- | ---- |
| 获取房间聊天历史 | request/im/chat | getChatList |
