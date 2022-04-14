## 互动工具容器

用于 wap 观看端互动工具

1. 组件展现形势为弹框组件；
2. 组件为互动工具提供布局位置！

### 输入 api(向其他组件发送的指令)

| 方法名               | 参数 1 | 描述       | 代码块                                                                                   |
| -------------------- | ------ | ---------- | ---------------------------------------------------------------------------------------- |
| emitOpenTimer        | 无参数 | 打开计时器 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenTimer'));`        |
| emitOpenSign         | 无参数 | 打开签到   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenSign'));`         |
| emitOpenRedPacket    | 无参数 | 打开红包   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenRedPacket'));`    |
| emitClickLotteryIcon | 无参数 | 打开抽奖   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickLotteryIcon'));` |
