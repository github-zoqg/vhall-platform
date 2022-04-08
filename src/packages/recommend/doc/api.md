# 广告推荐组件

用于 pc 观看端的广告推荐展示

## 主要功能

1. 组件内展示广告内容
2. 滑动置底加载更多
3. 点击广告进行跳转

## 依赖服务

1. roomBaseServer
2. recommendServer
3. menuServer

## 需要注意点

### PC 订阅页滚动需特殊处理

在 pc 订阅页时，由于没有定高的滚动区域，所以需要监听整个页面的滚动状态。
在 wap 订阅页时，有定高区域，所以不需要特殊处理。

### overlay-scrollbars 官方没有适用的触底逻辑

`overlay-scrollbars` 没有给出触底逻辑，经查询使用了 `callbacks:onScrollStop` 来触发滚动结束事件。
拿到 osInstance 实例，通过 getState()拿到 state 后，判断 `state.hasOverflow.y` 是否为 `true`，为 `true` 则表示触底

---

## 输入 api(向其他组件发送的指令)

| 方法名 | 参数 1 | 描述 | 代码块 |
| ------ | ------ | ---- | ------ |
| 无     |        |      |        |

## 输出 api(暴露给其他组件使用的方法)

| 方法名 | 方法说明 | 参数 | 描述 |
| ------ | -------- | ---- | ---- |
| 无     |          |      |      |
