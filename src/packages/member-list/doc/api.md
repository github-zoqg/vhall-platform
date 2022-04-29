## 成员列表组件（PC）

用于发起端、观看端成员列表的展示和操作

1. 主要用于 pc 发起端和 pc 观看端
2. 受黄金链路相关权限控制
3. 直播内列表支持滚动加载，有较多操作选项，有依赖于其他模块

### 互动连麦相关功能

1. 主持人邀请嘉宾、观众上麦
2. 主持人同意嘉宾、观众的上麦申请
3. 全体禁言、个体禁言操作
4. 监听消息成员列表状态的变更

### 输入 api(向其他组件发送的指令)

| 方法名      | 参数 1       | 描述                                                                                     | 代码块                                                                                                          |
| ----------- | ------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| emitTabTips | tab 状态信息 | tab 的显示隐藏状态（visible:Boolean,type:Number,type 可以参看 config 里给 tab 分配的值） | ` window.$middleEventSdk?.event?.send(boxEventOpitons(_this.cuid, 'emitTabTips', { visible: true, type: 8 }));` |

### 输出 api(暴露给其他组件使用的方法)

### 子组件

- member-item.vue:成员列表项的组件
- scroll.vue 封装的滚动组件

### 依赖服务

- useMicServer
- useRoomBaseServer
- useMemberServer,
- useInteractiveServer,
- useMsgServer,
- useGroupServer
