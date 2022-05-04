# 转播列表

用于 pc 发起端转播列表展示，在转播列表中可以选择视频源，并完成转播动作

## 主要功能

1. 展示可转播的活动房间
2. 可搜索活动房间
3. 点击活动房间可以预览，能够视频流和演示中的文档
4. 点击开始转播可以将目标房间的视频流和文档流推送到观众端
5. 可以通过转播列表来结束某个转播，在转播时可勾选是否重新推送本地流

## 依赖服务

1. roomBaseServer
2. rebroadcastServer
3. interactiveServer

## 需要注意点

无

---

## 输入 api(向其他组件发送的指令)

| 方法名           | 参数 1 | 描述                             | 代码块 |
| ---------------- | ------ | -------------------------------- | ------ |
| startPush        |        | 在结束直播并勾选“重新推流”时生效 |        |
| startRebroadcast |        | 开始转播                         |        |
| stopRebroadcast  |        | 停止转播                         |        |

## 输出 api(暴露给其他组件使用的方法)

| 方法名 | 方法说明 | 参数 | 描述 |
| ------ | -------- | ---- | ---- |
| 无     |          |      |      |