####订阅消息通知
| 事件名称 | 事件说明 |
| ---- | ---- |
| QA_CREATE | 收到新创建的问答 |
| QA_COMMIT | 收到问答回复 |

####第三方依赖
| 依赖包名称 | 功能 | 文档 |
| ---- | ---- | ---- |
| vue-virtual-scroll-list | 虚拟列表 | <https://tangbc.github.io/vue-virtual-scroll-list/#/chat-room>|
| OverlayScrollbars | 输入框滚动条 | <https://kingsora.github.io/OverlayScrollbars/#!documentation/method-scroll> |

####关联接口
| 接口说明 | domain 中路径 | 方法名 |
| ---- | ---- | ---- |
| 获取问答历史列表 | request/qa/list | getHistoryQaMsg |
| 开启问答 | request/qa/list | qaEnable |
| 关闭问答 | request/qa/list | qaDisable |
| 发送问答 | request/qa/list | sendQaMsg |
