## PC 桌面共享组件

用于推送和订阅桌面共享

### 输入 api(向其他组件发送的指令)

| 方法名                  | 参数 1 | 描述                         | 代码块                                                                                       |
| ----------------------- | ------ | ---------------------------- | -------------------------------------------------------------------------------------------- |
| emitClickExchangeView   | -      | 调用播放器的切换按钮切换视图 | `window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickExchangeView'))`   |
| emitClickEndDemonstrate | -      | 结束演示                     | `window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickEndDemonstrate'))` |

### 输出 api(暴露给其他组件使用的方法)

| 方法名 | 参数 | 描述 |
| ------ | ---- | ---- |
|        |      |      |
|        |      |      |
