## 观看端播放器组件

用于 pc 观看端播放旁路

1. 预约页开启了暖场视频
2. 直播、回放
3. 试看、断点续播

### 输入 api(向其他组件发送的指令)

| 方法名         | 参数 | 描述             | 代码块                                                                                             |
| -------------- | ---- | ---------------- | -------------------------------------------------------------------------------------------------- |
| emitClickLogin | 无   | 驱动登录组件显示 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickLogin'));`                 |
| emitClickAuth  | 无   | 驱动权限组件显示 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickAuth'));`                  |
| emitClickPay   | flag | 驱动付费组件显示 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickPay', [{ flag: true }]));` |

### 使用接口地址

| 模块       | 参数（必传）             | 描述                         | 接口地址                                                   |
| ---------- | ------------------------ | ---------------------------- | ---------------------------------------------------------- |
| 播放器设置 | 1. webinar_id（活动 id） | 播放器跑马灯、水印等设置信息 | `http://yapi.vhall.domain/project/101/interface/api/40742` |
