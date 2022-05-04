## 分组讨论操作面板

1、仅用于小组直播中。
2、仅 PC 发起端主持人和助理可用

### 输入 api(向其他组件发送的指令)

```js
-------------------------------------
方法名： emitToggle
描述：分组面板展示和隐藏时触发，通知左侧分组菜单变更选中状态
参数：val 布尔类型，true-选中，false-不选中
代码：window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitToggle', [val]));
------------------------------------
方法名：emitDocResetBrush
描述：分组直播结束演示后，演示权限回收，需要重置笔刷
参数：无
代码：window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitDocResetBrush'));
------------------------------------
```

### 输出 api(暴露给其他组件使用的方法)

```js
-------------------------------------
方法名： exitGroup
描述：退出小组
参数：无
------------------------------------
方法名： hiddenAll
描述：隐藏分组相关的所有对话框
参数：无
------------------------------------
方法名：toggle
描述：分组操作面板的显示隐藏切换
参数：无
------------------------------------
```