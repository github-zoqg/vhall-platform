# middle-platform

> 中台前端项目集

## 工程说明

1. 该工程是中台前端多项目集合。
2. 所有项项目统一使用 vue2.x 开发,为了兼容 IE11。
3. 所有项目统一结构（见工程结构项目说明）。
4. 名词解释：

```text
project: 项目
```

---

&nbsp;

## 工程结构说明

```
project
│
├── script  # 项目编译工具
│    ├────...
│    ├────btool.js # 项目编译辅助工具
│    └────cli-service.js  # 实际编译启动工具
│
├── docs # 文档相关目录
│    ├────...
│    └────...
│
├── src
│    ├────saas-live # saasPC直播端
│    │    ├────...
│    │    ├────...
│    │    ├────main.js  #项目入口文件
│    │    ├────package.json #项目的name、version配置
│    │    ├────webpack.base.config #项目共用配置
│    │    ├────webpack.dev.config #项目开发环境配置
│    │    └────webpack.prod.config #项目生产环境配置
│    │
│    ├────saas-wap # saas wap观看端
│    │    ├────...
│    │    ├────...
│    │    └────...
│    │
│    ├────saas-watch # saas PC观看端
│    │    ├────...
│    │    ├────...
│    │    └────...
│    │
├── .browserslistrc #目标浏览器配置
├── .editorconifg #编辑器规范配置
├── .env.development
├── .env.prodution
├── .env.test
├── .eslintignore #eslint忽略配置
├── .eslintrc.js #eslint规则配置
├── .gitignore #忽略文件
├── .prettierignore #代码格式化忽略配置
├── .babel.config.js # babel文件配置
├── .commitlint.config.js # 提交命令规范检查配置
├── .jsconfig.json # 提交命令规范检查
├── package.json #项目配置文件
├── prettier.config.js #代码格式化配置
├── README.md #项目的说明文档，markdown 格式
├── vue.config.js # vue配置文件
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

## [saas-live]项目331任务启动
npm run serve:saas-live:331 或 yarn serve:saas-live:331

## ...

```

3. 编译构建

```shell

## 编译[saas-live]项目
npm run build:saas-live

## jenkins持续集成（运维支持）
node scripts/cli-service.js build --project=${project} --mode=${mode}
> 其中：${project} 表示要构建的项目，${mode} 表示构建环境，会从根目录读取.en.${mode} 文件配置信息

```

4. 格式化代码

```shell

## 格式化代码
npm run format

## 检查代码是否符合规则，不通过的显示错误
npm run lint

## 检查代码是否符合规则并自动修复
npm run lint:fix

##统一执行命令, hash非必需、middle非必需: true | false
node scripts/cli-service.js build --project=${项目} --mode=${环境} --hash=${gitlab-commit-hash} --middle=${是否为中台}
```

&emsp; 更多命令参考 package.json 中的 scripts 配置

---

&nbsp;

## 编码规范

#### <font color=blue size=3 >1、组件开发`</font>`

(1) 多数情况项组件在 packages 目录下编写。
(2) 组件如果是多单词，采用短横线连接.
例如： 语言切换组件 language-choice
(3) packages 目录下组件名称导出名称统一采用 vmp 开头
例如： 语言切换组件 name: 'VmpLanguageChoice'
(4) 组件名称采用 UpperCamelCase(大驼峰)命名法。
例如： 语言切换组件 VmpLanguageChoice

#### <font color=blue size=3 >2、主题皮肤`</font>`

(1) 约定在每个项目的 assets/styles/skins 目录下写皮肤样式
(2) 在每个项目的 config.js 中配置初始主题皮肤，名称和 skins 目录下的样式名称一致。

```js
export const globalConfig = {
  lang: 'zh', // 语言配置
  skin: 'new-year' // 主题皮肤配置
};
```

(3) 样式中不要使用 deep, 尽量遵守 `<a href="http://getbem.com/">`BEM`</a>` 样式规范。

---

&nbsp;

## 编译配置及多页面支持

1、根目录下的 vue.config.js 是全局共用配置，里面定义了全局共用配置内容。
2、每个项目的专有配置都在项目自己的根目录下，形如 webpack.[env].config.js。
3、默认支持多页面，所有配置参数可参考官方文档：
`<a href="https://cli.vuejs.org/zh/config/">`Vue Cli Config`</a>`。
4、每个项目最终配置，都是 全局共用配置+ 专有个性配置 合并而成。
合并采用方式：不同配置增量合并，对于相同子项，后面的配置会覆盖前面的配置。

---

&nbsp;

## 插件安装

#### <font color=blue size=3 >1、代码风格 eslint + prettier`</font>`

问题 1：eslint 也可以自动修复/格式化代码，为什么要使用 Prettier？
原因：https://github.com/prettier/prettier-eslint/issues/101

问题 2：Vue3 中 eslint 代码格式化 prettier 和 standard 规则比较（为什么推荐使用 prettier）
原因：https://www.cnblogs.com/1549983239yifeng/p/14360708.html

- eslint 负责检查文件是否符合规则的
- prettier 负责代码风格统一格式化

<font color=#A52A2A size=3 >vscode 搜索并安装 prettier Code Format 插件。</font>

eslint 检查集成了 prettier 规则，通常只需要在 prettier.config.js 文件中配置格式化规则即可。

#### <font color=blue size=3 >2、路径跟踪插件 Path Intellisense`</font>`

<font color=#A52A2A size=3 >vscode 搜索并安装 Path Intellisense 插件，用于处理使用别名后可以路径提示问题。</font>

#### <font color=blue size=3 >3、文档查看编辑插件 Draw.io Integration`</font>`

<font color=#A52A2A size=3 >vscode 搜索 Drawio 并安装 Draw.io Integration 插件。</font>

## 常见问题

问题 1：windows 系统用户 git 默认设置 core.autocrlf 为 true ，clone 项目之后代码会因为自动转 crlf 导致 eslint 报错。

解决方法： 更改配置 core.autocrlf 为 input 重新 clone 代码。

```shell
# 提交时转换为LF，检出时不转换
git config --global core.autocrlf input
```

问题 2：日志查询地址？
sentry: https://sentry.vhall.com/
