## 聊天审核组件（PC）

用于发起端开启了聊天审核之后对聊天的消息进行的处理操作

1. 主要用于pc发起端
2. 会监听聊天消息、自定义消息
3. 事件监听、接口调用部分在domain的chatAuthServer
4. 注释掉的部分是知客的特有功能，如确认不再需要，可以考虑删掉
5. 独立页面，各个项目里的config暂时不支持进行配置
