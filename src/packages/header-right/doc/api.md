## 发起端顶部右侧区域 开始直播、主持人功能

用于 发起端页面、主要功能:

1. 录制
2. 开始直播、结束直播
3. 主持人/助理/嘉宾 身份，昵称、媒体设置、分屏/关闭分屏、虚拟人数、第三方推流/网页推流、角色退出
4. 全屏

### 输入 api(向其他组件发送的指令)

| 方法名                | 参数          | 描述                   | 代码块                                                                                                        |
| --------------------- | ------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| emitMediaSettingClick | 无            | 驱动媒体设置组件显示   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitMediaSettingClick'));`                     |
| emitVirtualClick      | 无            | 驱动虚拟人数组件显示   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitVirtualClick'));`                          |
| emitClickThirdStream  | status: true  | 驱动第三方推流组件显示 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickThirdStream', [{ status: true }]));`  |
| emitClickThirdStream  | status: false | 驱动第三方推流组件隐藏 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickThirdStream', [{ status: false }]));` |
| emitClickStartLive    | 无            | 驱动开始直播组件显示   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickStartLive'));`                        |

### 使用接口地址

| 模块     | 参数（必传）             | 描述                   | 接口地址                                                  |
| -------- | ------------------------ | ---------------------- | --------------------------------------------------------- |
| 角色退出 | 1. webinar_id（活动 id） | 点击退出（嘉宾和助理） | `http://yapi.vhall.domain/project/99/interface/api/24333` |
