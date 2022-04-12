## 文档选择对话框组件

用于发起端、小组直播 PC 观看端，有“选择文档”权限的情形下。

1. 该组件依赖文档组件，单独使用没太大意义。
2. 主要用于演示者上传或选择新的文档进行演示。

### 输入 api(向其他组件发送的指令)

```js
-------------------------------------
方法名： emitDemonstrateDoc
描述：演示选择的文档
参数：
  （1）docId： 文档Id，字符串
  （2）docType： 文档类型，数值，1:动态文档，即 ppt；2:静态文档,即 JPG
  （3）switchStatus: 观众是否可见，布尔 true-可见 false-不可见
代码：window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitDemonstrateDoc', [docId, docType, this.switchStatus]));
------------------------------------
```

### 输出 api(暴露给其他组件使用的方法)

```js
-------------------------------------
方法名： show
描述：打开文档选择对话框
参数：无
------------------------------------
```
