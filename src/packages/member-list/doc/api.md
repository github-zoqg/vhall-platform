## 成员列表组件（PC）

用于发起端、观看端成员列表的展示和操作

1. 主要用于pc发起端和pc观看端
2. 受黄金链路相关权限控制
3. 直播内列表支持滚动加载，有较多操作选项，有依赖于其他模块

### 输入 api(向其他组件发送的指令)

| 方法名         | 参数 1             | 描述                 | 代码块                                                                                          |
| -------------- | ------------------ | -------------------- | ----------------------------------------------------------------------------------------------- |
| emitTabTips | tab状态信息 | tab的显示隐藏状态（visible:Boolean,type:Number,type可以参看config里给tab分配的值） | `          window.$middleEventSdk?.event?.send(boxEventOpitons(_this.cuid, 'emitTabTips', { visible: true, type: 8 }));` |

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
