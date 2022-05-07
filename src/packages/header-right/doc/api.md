## 发起端顶部右侧区域 开始直播、主持人功能

用于 发起端页面、主要功能:

1. 录制
2. 开始直播、结束直播
3. 主持人/助理/嘉宾 身份，昵称、媒体设置、分屏/关闭分屏、虚拟人数、第三方推流/网页推流、角色退出
4. 嘉宾上下麦
5. 全屏

### 输入 api(向其他组件发送的指令)

| 方法名                  | 参数          | 描述                           | 代码块                                                                                                        |
| ----------------------- | ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| emitMediaSettingClick   | 无            | 驱动媒体设置组件显示           | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitMediaSettingClick'));`                     |
| emitVirtualClick        | 无            | 驱动虚拟人数组件显示           | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitVirtualClick'));`                          |
| emitClickThirdStream    | status: true  | 驱动第三方推流组件显示         | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickThirdStream', [{ status: true }]));`  |
| emitClickThirdStream    | status: false | 驱动第三方推流组件隐藏         | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickThirdStream', [{ status: false }]));` |
| emitClickStartLive      | 无            | 驱动开始直播/开始录制组件显示  | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickStartLive'));`                        |
| emitClickCheckStartPush | 无            | 调用 stream-local 组件开始推流 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickCheckStartPush'));`                   |

### 后端接口

1. 角色登录用户退出登录

- 接口地址：/v3/webinars/live/role-logout
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/24333

2. 开始直播

- 接口地址：/v3/webinars/live/start
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/24339

3. 结束直播

- 接口地址：/v3/webinars/live/end
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/24345

4. 开始录制

- 接口地址：/v3/webinars/record/start-record
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/29643

5. 结束录制

- 接口地址：/v3/webinars/record/stop-record
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/29649

6. 直播结束生成回放

- 接口地址：/v3/webinars/record/live-create-record
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/29715

7. 设置默认回放

- 接口地址：/v3/webinars/record/set-default
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/29613

8. 录制完成生成回放

- 接口地址：/v3/webinars/record/create
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/28863
