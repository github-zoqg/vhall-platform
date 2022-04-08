# 菜单组件

用于 pc 发起端、观看端 的菜单显示

1. 组件展现形式为横向的 tab 条+下方的正文区域;
2. 点击不同 tab，切换不同的正文

## 主要功能

1. 切换 tab
2. 根据 tab，切换不同的正文内容
3. 左右箭头切换 tab
4.

## config 配置项

```js
isToggleBtnVisible<Boolean> // 是否显示左右切换按钮

menuConfig<Object> // 菜单配置项(后端定义的菜单type和前端对应组件的映射)
```

## 需要注意点

### 显隐条件

tab 的显隐逻辑条件较多，按照优先级 **从高到低** 分为

1. 黄金链路（权限） ，黄金链路配置为不显示。如配置「公告」不显示，则不会渲染公告，而不是 display:none
2. page 环境，区分「订阅页环境」和「直播间内环境」，订阅页环境下，item.status==1 和 item.status==4 才予以显示
3. tab 本身的可视性。即 item.visible，该值可以由其他程序调用 setVisible 来更改显隐。

需要注意的是，item.visible 优先级最低，假设由于黄金链路直接不渲染某个 tab，setVisible 是不起作用的。请按照优先级理解。

### 初始化数据

1. 发起端从 menuServer 取死数据（发起端固定配置）
2. 观看端从 roomBase.customMenu 取后端配置
3. 所有配置数据要经过 getItemEntity 转化为数据实体才能使用，在转化过程中会增设 visible 等字段，以供用户调用

### 配置表

1. config.js 中 comTabMenu 会配置 menuConfig 字段，该字段主要用于后端定义的 type 和前端组件名进行映射，并提供默认的 i18n 文本

## 输入 api(向其他组件发送的指令)

| 方法名 | 参数 1 | 描述 | 代码块 |
| ------ | ------ | ---- | ------ |
| 无     |        |      |        |

## 输出 api(暴露给其他组件使用的方法)

| 方法名         | 方法说明               | 参数                | 描述                                                                   |
| -------------- | ---------------------- | ------------------- | ---------------------------------------------------------------------- |
| setVisible     | 设置某个菜单显隐       | `{visible,type,id}` | visible:是否显示,type:指定哪个 tab，id:自定义菜单才传此值，为菜单的 id |
| setTipsVisible | 设置某个菜单的红点显隐 | `{visible,type,id}` | visible:是否显示,type:指定哪个 tab，id:自定义菜单才传此值，为菜单的 id |
| select         | 选中某个菜单           | `{type,id}`         | type:菜单类型，id:非必传，自定义菜单需要传                             |
| addItem        | 添加某个菜单项         | `item<Object>`      | item:符合后端定义的菜单项，详细参考 getItemEntity 文件                 |
