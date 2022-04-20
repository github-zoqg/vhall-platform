## 本地推流组件 发起端和 pc 的观看端同一套

用于本地推流

### 输入 api(向其他组件发送的指令)

| 方法名                     | 参数 1   | 描述         | 代码块                                                                                               |
| -------------------------- | -------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| initPlayer                 | autoPlay | 自动播放     | `window.$middleEventSdk?.event?.send( boxEventOpitons(this.cuid, 'initPlayer', { autoPlay: true }))` |
| emitClickPublishComplate   | -        | 推流完成     | ` window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickPublishComplate'));`      |
| emitClickUnpublishComplate | -        | 取消推流完成 | ` window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickUnpublishComplate'));`    |

### 输出 api(暴露给其他组件使用的方法)

| 方法名           | 参数 | 描述                                                                                                                                                                                                          |
| ---------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| switchStreamType | obj  | 媒体设置组件派发<br>无缝切换设备 or 切换视频或图片推流方式                                                                                                                                                    |
| startPushOnce    | 无   | header-right 组件 <br>开始直播按钮触发<br> 开始直播时，进行调用 startPush，且增加中间层 startPushStreamOnce 字段，为了区分是否为首次主持人点击开始直播，后续收到主持人的上麦成功消息直接 return，不再进行处理 |
