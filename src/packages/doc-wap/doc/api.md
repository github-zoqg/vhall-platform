## 文档白板组件

用于 wap 观看端，演示文档或白板。

### 输入 api(向其他组件发送的指令)

```js
-------------------------------------
方法名：emitShowMenuTab
描述： 回放中或回放结束时，文档是否显示状态变更，通知tab签相应的处理
参数：switchStatus 文档tab签是否显示，布尔类型 true-显示 false-不显示
代码： window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitShowMenuTab', [this.docServer.state.switchStatus]));
------------------------------------
```

### 输出 api(暴露给其他组件使用的方法)
