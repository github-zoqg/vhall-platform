## 预约组件

用于 pc 观看端 预约页

1. 直播未开始时，预约和权限验证
2. 回放时、权限验证
3. 暖场视频

### 输入 api(向其他组件发送的指令)

| 方法名                  | 参数 | 描述                 | 代码块                                                                                             |
| ----------------------- | ---- | -------------------- | -------------------------------------------------------------------------------------------------- |
| emitClickLogin          | 无   | 驱动登录组件显示     | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickLogin'));`                 |
| emitClickAuth           | 无   | 驱动权限组件显示     | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickAuth'));`                  |
| emitClickPay            | flag | 驱动付费组件显示     | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickPay', [{ flag: true }]));` |
| emitClickOpenSignUpForm | 无   | 驱动报名表单组件显示 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickOpenSignUpForm'));`        |

### 输出 api(暴露给其他组件使用的方法)

| 方法名            | 参数 | 描述             |
| ----------------- | ---- | ---------------- |
|                   |      |                  |
| openVirtualDialog | 无   | 显示虚拟人数弹窗 |

### 使用接口地址

| 模块     | 参数（必传）             | 描述           | 接口地址                                                  |
| -------- | ------------------------ | -------------- | --------------------------------------------------------- |
| 权限验证 | 1. webinar_id（活动 id） | 观看端权限验证 | `http://yapi.vhall.domain/project/99/interface/api/25311` |
