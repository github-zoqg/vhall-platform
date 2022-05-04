## 文档白板组件

用于发起端、PC 观看端，演示文档或白板。

### 输入 api(向其他组件发送的指令)

```js
-------------------------------------
方法名： emitSwitchTo
描述：切换到文档或白板，菜单组件也会使用
参数：fileType: 文件类型，字符串， document-文档;board-白板
代码： window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitSwitchTo', ['document']));
------------------------------------
方法名：emitOpenDocList
描述：打开选择文档对话框
参数：无
代码：window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenDocList'));
------------------------------------
```

### 输出 api(暴露给其他组件使用的方法)

```js
-------------------------------------
方法名： demonstrate
描述：演示文档
参数：
  （1）docId： 文档Id，字符串
  （2）docType： 文档类型，数值，1:动态文档，即ppt；2:静态文档,即JPG
  （3）switchStatus: 观众是否可见，布尔 true-可见 false-不可见
------------------------------------
方法名： resetCurrentBrush
描述：重设当前笔刷，通常切换演示者和频道后调用。
参数：无
------------------------------------
方法名：switchTo
描述：切换到文档或白板
参数：fileType: 文件类型，字符串， document-文档;board-白板
------------------------------------
方法名：handleEndDemonstrate
描述：结束演示，用于分组直播中
参数：无
------------------------------------
```
