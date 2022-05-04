## PC 观看左侧菜单组件

1、仅用于小组直播中。

### 输入 api(向其他组件发送的指令)

```js
-------------------------------------
方法名： handleClickDoc
描述：点击“文档”菜单或“白板”菜单
参数：kind 文档类型，字符串，document：文档；board:白板
代码：window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'handleClickDoc', [kind]));
------------------------------------
方法名：handleClickDesktopScreen
描述：点击“桌面共享”或“关闭共享”菜单，
参数：isShareScreen 是否开启桌面共享，布尔型，true:开启；false：关闭
代码：window.$middleEventSdk?.event?.send(
    boxEventOpitons(this.cuid, 'handleClickDesktopScreen', [this.isShareScreen])
  );
------------------------------------
方法名：emitDocResetBrush
描述：分组直播结束演示后，演示权限回收，需要重置笔刷
参数：无
代码：window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitDocResetBrush'));
------------------------------------
```

### 输出 api(暴露给其他组件使用的方法)
