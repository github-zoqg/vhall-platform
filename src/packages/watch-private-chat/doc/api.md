####订阅消息通知
| 事件名称 | 事件说明 |
| ---- | ---- |
| receivePrivateMsg | 收到私聊我的消息 |
| banned | 禁言我 |
| allBanned | 禁言全员 |

####第三方依赖
| 依赖包名称 | 功能 | 文档 |
| ---- | ---- | ---- |
| vue-virtual-scroll-list | 虚拟列表 | <https://tangbc.github.io/vue-virtual-scroll-list/#/chat-room>|
| OverlayScrollbars | 输入框滚动条 | <https://kingsora.github.io/OverlayScrollbars/#!documentation/method-scroll> |

####关联接口
| 接口说明 | domain 中路径 | 方法名 |
| ---- | ---- | ---- |
| 获取私聊列表 | request/im/chat | getPrivateChatHistoryList |
