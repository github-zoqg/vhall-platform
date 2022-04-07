## 观看端顶部

用于 pc 观看端页面、主要功能:

1. 直播标题、品牌设置、皮肤、活动类型标签
2. 直播时间、关注/取消关注、分享、公众号、多语言
3. 登录、退出、个人资料、提现

### 输入 api(向其他组件发送的指令)

| 方法名              | 参数 | 描述                 | 代码块                                                                                  |
| ------------------- | ---- | -------------------- | --------------------------------------------------------------------------------------- |
| emitClickLogin      | 无   | 驱动登录组件显示     | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickLogin'));`      |
| emitOpenOfficical   | 无   | 驱动公众号组件显示   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenOfficical'));`   |
| emitOpenShare       | 无   | 驱动分享组件显示     | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenShare'));`       |
| emitOpenUserAccount | 无   | 驱动个人资料组件显示 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenUserAccount'));` |
| emitOpenCash        | 无   | 驱动提现管理组件显示 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenCash'));`        |

### 使用接口地址

| 模块     | 参数（必传）                  | 描述               | 接口地址                                                   |
| -------- | ----------------------------- | ------------------ | ---------------------------------------------------------- |
| 品牌设置 | 1. webinar_id（活动 id）      | 主办方、标识、logo | `http://yapi.vhall.domain/project/101/interface/api/40741` |
| 皮肤设置 | 1. webinar_id（活动 id）      | 观看端风格和背景   | `http://yapi.vhall.domain/project/101/interface/api/40741` |
| 关注状态 | 1. at_id（用户 id）2. type: 1 | 是否关注           | `http://yapi.vhall.domain/project/100/interface/api/28497` |
| 关注     | 1. at_id（用户 id）2. type: 1 | 点击关注           | `http://yapi.vhall.domain/project/100/interface/api/25473` |
| 取消关注 | 1. at_id（用户 id）2. type: 1 | 点击取消关注       | `http://yapi.vhall.domain/project/100/interface/api/25479` |
| 退出     | 无                            | 点击退出           | `http://yapi.vhall.domain/project/100/interface/api/21471` |
