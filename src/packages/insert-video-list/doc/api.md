## 插播列表组件

用于 pc 发起端、pc 观看端，发起以及订阅插播流。

### 输入 api （向其他组件发送的指令）

#### `emitInsertFileChange`

- 描述: 插播文件更改发送的指令，通知插播流组件开始执行插播的逻辑
- 参数:
  1. `video` 必传参数，新的插播文件播放的 videoElement （video 标签的 dom 对象）
  2. `type` 必传参数，更改的插播文件对应的插播类型。`local` 对应本地插播；`remote` 对应云插播。
- 示例代码：`window.$middleEventSdk?.event?.send( boxEventOpitons(this.cuid, 'emitInsertFileChange', [video, 'remote']) )`

### 输出 api（暴露给其他组件使用的方法）

#### `closeInserVideoDialog`

- 描述: 关闭插播文件列表 dialog
- 参数: 无
- 示例代码：`window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'closeInserVideoDialog'))`

#### `openInsertFileDialog`

- 描述: 打开插播文件列表 dialog
- 参数: 无
- 示例代码：`window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'openInsertFileDialog'))`

### 后端接口

1. 获取插播文件列表

- 接口地址：/v3/webinars/waiting-file/get-list
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/41722

2. 删除插播文件

- 接口地址：/v3/webinars/waiting-file/get-list
- yapi 地址：http://yapi.vhall.domain/project/99/interface/api/41722
