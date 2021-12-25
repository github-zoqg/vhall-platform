# middle-platform

> 中台前端项目集

## 工程说明

1. 该工程是中台前端多项目集合。
2. 所有项项目统一使用 vue2.x 开发,为了兼容 IE11。
3. 所有项目统一结构（见工程结构项目说明）。
4. 名词解释：

```text
lob: Line-of-Business 业务线
project: 项目
```

---

&nbsp;

## 工程结构说明

```
project
│
├── script  # 项目编译工具
│    ├────btool.js # 项目编译辅助工具
│    └────cli-service.js  # 实际编译启动工具
│
├── docs # 文档相关目录
│    ├────...
│    └────...
│
├── src
│    ├────common # 公用目录
│    │    ├────...
│    │    ├────...
│    │    └────...
│    │
│    ├────lite # 轻享项目 （结构参考sass）
│    │
│    ├────saas # saas业务线
│    │    ├────admin # 后台管理项目
│    │    │    ├────...
│    │    │    ├────...
│    │    │    ├────...
│    │    │    └────...
│    │    │
│    │    ├────common # 所有项公用内容
│    │    │    ├────...
│    │    │    ├────...
│    │    │    ├────...
│    │    │    └────...
│    │    │
│    │    ├────console # 控制台项目
│    │    │    ├────...
│    │    │    ├────...
│    │    │    └────...
│    │    │
│    │    ├────live-pc # 直播PC端
│    │    │    ├────...
│    │    │    ├────...
│    │    │    └────...
│    │    │
│    │    ├────watch-h5 # 观看H5端
│    │    │    ├────...
│    │    │    ├────...
│    │    │    └────...
│    │    │
│    │    └────watch-pc # 观看pc端
│    │    │    ├────...
│    │    │    ├────...
│    │    │    ├────...
│    │    │    └────...
│    │
│    ├────zhike # 知客项目 （结构参考sass）
│    │
│    │
├── vue-configs  # 项目编译配置文件
│    ├────sass  # 配置文件相关
│    │    ├────dev.config.js
│    │    └────prod.config.js
│    ├────zhike
│    │    ├────dev.config.js
│    │    └────prod.config.js
│    │
├── .browserslistrc #目标浏览器配置
├── .editorconifg #编辑器规范配置
├── .eslintignore #eslint忽略配置
├── .eslintrc.js #eslint规则配置
├── .gitignore #忽略文件
├── .prettierrc #代码格式化配置
├── package.json #项目配置文件
├── vue.config.js # vue配置文件
├── README.md #项目的说明文档，markdown 格式
└── yarn.lock 项目依赖锁文件

```

---

&nbsp;

## 命令

1. 安装依赖

```shell
  yarn install
```

2. 本地开发运行

```shell

## [saas/live-pc]项目启动
yanr run serve 或 yarn run serve:saas:live-pc

## [zhike/live-pc]项目启动
yarn run serve:zhike:live-pc

## ...

```

3. 编译构建

```shell

## 编译
npm run build:saas:live-pc

## 编译saas业务线的全部项目
npm run build:saas:all

```

4. 格式化代码

```shell

## 格式化代码
npm run format

## 检查代码是否符合规则，不通过的显示错误
npm run lint

## 检查代码是否符合规则并自动修复
npm run lint:fix

##统一执行命令
node scripts/cli-service.js build --lob=${业务线} --project=${项目} --mode=${环境}
```

&emsp; 更多命令参考 package.json 中的 scripts 配置

---

&nbsp;

## 编译配置及多页面支持

1、根目录下的 vue.config.js 是全局共用配置，里面定义了全局共用配置内容。  
2、所有业务线的专有配置都在 vue-configs 目录下，其中 default.config.js 是专有缺省配置。  
3、每个业务线/应用端的项目最终配置，都是 全局共用配置+ 专有缺省配置 + 专有个性配置 合并而成。
合并采用方式：不同配置增量合并，对于相同子项，后面的配置会覆盖前面的配置。  
例如：
如果专有缺省配置内容如下

```js
htmlConfig: {
    cdnJs: {
      vue: '//cdn.jsdelivr.net/npm/vue@3.2.24/dist/vue.global.min.js',
      VueRouter:'//cdn.jsdelivr.net/npm/vue-router@4.0.12/dist/vue-router.global.min.js'
    }
}
```

如果专有个性配置内容如下：

```js
htmlConfig: {
    cdnJs: {
      VueRouter: '',
      Vuex:'https://cdn.jsdelivr.net/npm/vuex@4.0.2/dist/vuex.global.min.js'
    }
    ...
}
```

那么合并后的结果是：

``````js
htmlConfig: {
    cdnJs: {
      vue: '//cdn.jsdelivr.net/npm/vue@3.2.24/dist/vue.global.min.js',
      VueRouter: '', // 内容为空的cdn文件不会嵌入html中（可以用来排除某些专项不需要的缺省cdn文件）
      Vuex:'https://cdn.jsdelivr.net/npm/vuex@4.0.2/dist/vuex.global.min.js'
    }
    ...
}
````
4、多页面支持
 配置文件：vue-configs/[lob业务线)]/[mode].config.js
`````js
'live-pc': {
    pages: {
      index: { // 页面key
        entry: 'main.js', //入口
      },
      second: {
        entry: 'second.js',
        filename: 'second.html', //文件名，可选。不填写默认是 ${页面key}.html
        htmlConfig: {
          cdnJs: {
            vue: '//cdn.jsdelivr.net/npm/vue@3.2.24/dist/vue.global.js'
          }
        }
      }
    }
  }
````
---

&nbsp;

## eslint + prettier

问题 1：eslint 也可以自动修复/格式化代码，为什么要使用 Prettier？
原因：https://github.com/prettier/prettier-eslint/issues/101

问题 2：Vue3 中 eslint 代码格式化 prettier 和 standard 规则比较（为什么推荐使用 prettier）
原因：https://www.cnblogs.com/1549983239yifeng/p/14360708.html

- eslint 负责检查文件是否符合规则的
- prettier 负责代码风格统一格式化

<font color=#A52A2A size=3 >要求：vscode 搜索并安装 prettier Code Format 插件。</font>

eslint 检查集成了 prettier 规则，通常只需要在 prettier.config.js 文件中配置格式化规则即可。

## Path Intellisense

<font color=#A52A2A size=3 >要求：vscode 搜索并安装 Path Intellisense 插件，用于处理使用别名后可以路径提示问题。</font>

## 常见问题

问题 1：windows 系统用户 git 默认设置 core.autocrlf 为 true ，clone 项目之后代码会因为自动转 crlf 导致 eslint 报错。

解决方法： 更改配置 core.autocrlf 为 input 重新 clone 代码。

```shell
# 提交时转换为LF，检出时不转换
git config --global core.autocrlf input
``````
