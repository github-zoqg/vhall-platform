## 发起端右侧区域 互动工具

用于 发起端页面、主要功能:

1. 抽奖、签到、问卷、问答、红包、计时器、转播

### 输入 api(向其他组件发送的指令)

| 方法名                | 参数 | 描述               | 代码块                                                                                    |
| --------------------- | ---- | ------------------ | ----------------------------------------------------------------------------------------- |
| emitOpenSign          | 无   | 驱动签到组件显示   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenSign'));`          |
| emitOpenRedPacket     | 无   | 驱动红包组件显示   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenRedPacket'));`     |
| emitOpenQuestionnaire | 无   | 驱动问卷组件显示   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenQuestionnaire'));` |
| emitOpenLottery       | 无   | 驱动抽奖组件显示   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenLottery'));`       |
| emitOpenRebroadcast   | 无   | 驱动转播组件隐藏   | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenRebroadcast'));`   |
| emitOpenTimerSet      | 无   | 驱动计时器组件显示 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenTimerSet'));`      |

### 使用接口地址

| 模块 | 参数（必传）          | 描述         | 接口地址                                                   |
| ---- | --------------------- | ------------ | ---------------------------------------------------------- |
| 问答 | 1. room_id（房间 id） | 点击开启问答 | `http://yapi.vhall.domain/project/101/interface/api/25089` |
| 问答 | 1. room_id（房间 id） | 点击关闭问答 | `http://yapi.vhall.domain/project/101/interface/api/25095` |
| 问答 | 1. room_id（房间 id） | 问答提问次数 | `http://yapi.vhall.domain/project/101/interface/api/29943` |

### 互动模块权限

| 模块   | 权限字段             |
| ------ | -------------------- |
| 抽奖   | ui.hide_lottery      |
| 签到   | ui.hide_sign_in      |
| 问卷   | ui.hide_survey       |
| 问答   | ui.is_hide_qa_button |
| 红包   | ui.show_redpacket    |
| 计时器 | webinar.timer        |
| 转播   | rebroadcast          |
