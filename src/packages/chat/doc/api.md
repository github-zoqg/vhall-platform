## pc 聊天组件(发起端，观看端)

####子组件

> chat-img-upload.vue : 图片上传组件
> chat-input.vue : 输入框组件
> chat-operate-bar.vue : 聊天下方的工具条
> chat-user-control.vue : 单条消息操作栏
> emoji.vue : emoji 表情包组件
> img-preview.vue : 图片消息图片预览组件
> msg-item.vue : 单个消息体组件

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
| OverlayScrollbars | 输入框滚动条 | <https://kingsora.github.io/OverlayScrollbars/#!documentation/method-scroll> |

####关联接口
| 接口说明 | domain 中路径 | 方法名 |
| ---- | ---- | ---- |
| 获取房间聊天历史 | request/im/chat | getChatList |
| 删除聊天消息 | request/im/chat | deleteMessage |
| 获取禁言列表 | request/im/chat | getBannedList |
| 获取踢出列表 | request/im/chat | getKickedList |
| 设置 / 取消用户禁言 | request/im/chat | setBanned |
| 设置 / 取消全体用户禁言 | request/im/chat | setAllBanned |
| 踢出用户 / 取消踢出 | request/im/chat | setKicked |
| 获取敏感词列表 | request/im/chat | getKeyWordsList |
