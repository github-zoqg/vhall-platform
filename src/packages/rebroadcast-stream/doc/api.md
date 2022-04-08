# 转播推流区域

用于 pc 发起端转播推流区域展示

## 主要功能

1. 展示转播流
2. 切换流是大屏还是小屏

## 依赖服务

1. roomBaseServer
2. rebroadcastServer
3. interactiveServer

## 需要注意点

### 初始化

`mounted` 后检查 `watchInitData.rebroadcast.id`是否存在，如果存在则拉起转播流

### 切换大小屏

exchangeScreen 调用 roomBaseServer.setChangeElement。关闭直播时 stream-local 会将自身置回小屏，此处不必单独再处理。

---

## 输入 api(向其他组件发送的指令)

| 方法名 | 参数 1 | 描述 | 代码块 |
| ------ | ------ | ---- | ------ |
| 无     |        |      |        |

## 输出 api(暴露给其他组件使用的方法)

| 方法名 | 方法说明 | 参数 | 描述 |
| ------ | -------- | ---- | ---- |
| open   | 发起转播 |      |      |
| close  | 关播转播 |      |      |
