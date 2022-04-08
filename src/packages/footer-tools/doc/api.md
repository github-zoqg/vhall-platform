## 播放器底部 设置和互动工具

用于 pc 观看端页面、主要功能:

1. 媒体设置、热度、在线人数
2. 上麦 [上麦流程](http://wiki.vhallops.com/pages/viewpage.action?pageId=219611642)
3. 点赞、礼物、打赏、抽奖、签到、计时器、红包、问卷、公告

### 输入 api(向其他组件发送的指令)

| 方法名                 | 参数 1  | 描述                      | 代码块                                                                                                       |
| ---------------------- | ------- | ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| emitClickMediaSetting  | 无      | 驱动媒体设置组件显示      | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickMediaSetting'));`                    |
| emitOpenTimer          | 无      | 驱动计时器组件显示        | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitOpenTimer'));`                            |
| emitNeedLogin          | 无      | 驱动登录组件显示/礼物付费 | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitNeedLogin'));`                            |
| emitClickLotteryIcon   | 无      | 驱动抽奖组件显示          | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickLotteryIcon'));`                     |
| emitClickRedPacketIcon | 红包 id | 驱动红包组件显示          | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickRedPacketIcon', [redPacketId]));`    |
| emitClickQuestionIcon  | 问卷 id | 驱动问卷组件显示          | `window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitClickQuestionIcon', [questionnaireId]));` |

### 使用接口地址

| 模块     | 参数（必传）                                 | 描述         | 接口地址                                                    |
| -------- | -------------------------------------------- | ------------ | ----------------------------------------------------------- |
| 点赞组件 | 1. room_id（房间 id） 2. num (点赞数量/次数) | 点击点赞     | `http://yapi.vhall.domain/project/101/interface/api/26295;` |
| 公告组件 | 1. room_id（房间 id）                        | 获取公告列表 | `http://yapi.vhall.domain/project/101/interface/api/27585`  |
| 签到组件 | 1. room_id（房间 id） 2. sign_id (签到 id)   | 点击签到按钮 | `http://yapi.vhall.domain/project/101/interface/api/25881`  |
