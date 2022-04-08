# 自定义菜单

pc 的自定义菜单

## 主要功能

1. 展示自定义菜单，可以根据接口返回的数据生成 排行榜、标题、二维码等自定义的菜单页面
2. 自定义菜单只能从上到下，依次展示子组件，子组件占据一整行。是单排多行布局
3. 各个子组件功能不一，详情见下

## 子组件

1. 富文本「ComponentDesimg」
2. 二维码「ComponentQrcode」
3. 标题「ComponentTitle」
4. 分割线「ComponentLine」
5. 排行榜「ComponentRank」
6. 文字链「ComponentTextLink」
7. 图片链「ComponentImgLink」
8. 直播「ComponentLives」
9. 活动「ComponentProjects」
10. 推广「ComponentPromote」

## 依赖服务

1. customMenuServer

## 需要注意点

1. 用户可以配置多个自定义菜单，根据 menuId 不同，配置不同。在跟 `tab-menu` 组件搭配使用过程中。select 除了要传入 `{type:1}` 来切换到自定义菜单，还要传入 id 来获取某个 menuId 下的自定义菜单配置，以显示内容。

---

## 输入 api(向其他组件发送的指令)

| 方法名 | 参数 1 | 描述 | 代码块 |
| ------ | ------ | ---- | ------ |
| 无     |        |      |        |

## 输出 api(暴露给其他组件使用的方法)

| 方法名      | 方法说明 | 参数 | 描述                               |
| ----------- | -------- | ---- | ---------------------------------- |
| queryDetail | 查询细节 | `id` | 根据 menuId 来获取不同的自定义内容 |
