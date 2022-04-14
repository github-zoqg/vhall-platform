## wap 互动工具-计时器

用于 wap 观看页面、主要功能:

1. 计时器

## wap 互动工具-计时器

流程图 src\packages\live-timer-set\doc\liveTimer.drawio

### 输入 api(向其他组件发送的指令)

| 方法名          | 参数 1   | 参数 2   | 描述       | 代码块                                                                              |
| --------------- | -------- | -------- | ---------- | ----------------------------------------------------------------------------------- |
| emitChangeTimer | 字段 key | bloor 值 | 打开计时器 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitChangeTimer'));` |
