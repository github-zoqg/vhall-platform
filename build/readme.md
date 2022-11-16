# 配置讲解

## ⚠️ 格外注意

1. vite@3.1.8版本锁死，请勿升级到vite@3.2.0以上，目前 vite >3.1.8 存在兼容性问题，请勿随意升级。
2. script 标签如果有 text/jsx 需要增加 lang="jsx"，否则做 require 转义会失败

## VUE 语法支持

引入`vite-plugin-vue2`和`@vitejs/plugin-vue-jsx`插件，如果 vue 升级到 2.7 或 3，需要更换这两个插件，详情参考官网。

## 本地服务器 HTTPS 支持

引入`vite-plugin-mkcert`插件并声明。同时在 server 配置中将 https 设置为 true

## HTML 配置

引入`vite-plugin-ejs`插件并注入变量，html 中使用 ejs 语法来读取变量控制 html

## require 语法支持

vite 默认不支持 require 语法，使用`vite-plugin-require-transform`插件来支持该语法。该插件存在 bug，
如果文件名中存在`@`符号，准确说遇到稀有的变量保留字，导致变量命名不规范，则会导致解析失败。如`iconfon@2x.png`。对此需要如此配置

```js
requireTransform({
  fileRegex: /.ts$|.tsx$|.vue$/,
  importPathHandler(requirePath) {
    return requirePath.replace(/(\.|\?|-|\/|@)/g, '_');
  }
});
```

一旦匹配到`.` , `-` , `?` , `\` , `@` 等保留字统统转成 `_` 。其本质是将文件路径转化成变量名，如 `require('./iconfont@2x.png')` 会转换成 `import vite_plugin_require_transform__iconfont@2x.png from './iconfont@2x.png'` ，该插件对 `. - ? \` 已做转换，但 `@` 未处理故而报错。所以需要再上方进行转换。

## 手机端分辨率转换(rem)

代码在`preset/rem.js`中，只要项目的`project.isWap==true`则启用该功能。

## CDN 配置

CDN 配置需要为 serve 环境和 build 环境分开配置。

### cdn 资源引入

在 html 配置环境注入 cdn.css 和 cdn.js 两套资源，html 会自动进行解析并加载。

### cdn 的模块解析

serve 环境需要引用`vite-plugin-external` 插件来声明 external 的列表。

build 环境在`rollupOptions.output.external`中输出`Object.keys(cdn.externalVar)`，同时配置`build.rollupOptions.plugins.externalGlobals`

## 设置构建产物(dist)的结构

代码在 `preset/distStruct.js`下，提供了两个方法,`useDistStrcutConfig`需要解构到`build.rollupOptions.output`，主要作用是将静态资源根据后缀名，按 css,js,media 进行分类。

`useDevOpsFileStruct`方法进一步去设置`/docker/`、`/cloud`和`/sourcemap`文件夹，需要注意的是，需要在`hookName:'writeBundle'`阶段才能取到`/static`文件夹

## istanbul

istanbul 是测试环境进行覆盖率的埋点。不需要在 pre 环境构建。
同时 istanbul 打包非常消耗内存，故而不能和 legacy 同时使用。

## legacy

legacy 会额外插入一个 rollupOptions.output。打包一个兼容版本。
你需要在`preset/distStruct`的`filemanager-plugin`中配置顶级的`option:{cache:false}`。不然当第二个 output 执行到 writeBundle 阶段时，由于缓存存在，认为执行过同样的操作，就会直接跳过文件操作。

---

# 结构说明

所有 vite 构件相关代码都在`/build/`文件夹中，根目录下的`/build` 为 vite 和 cli 相关主配置。

每个具体的项目，如`src/saas-live/build`里为静态的配置，由外面工程引用。

## build/cli

cli 用于启动命令并混入指令用。如`node build/cli serve --project=saas-live --mode=dev_test`。
可以通过 build/cli 自定义指令和配置

cli 混入指令后，会自行启动 vite。vite 就会读取 cli 混入的指令。

## build/vite-config

vite-config 中是 vite 的所有配置，根目录下的`vite.config.js`作为入口，但所有配置本体都放到了 vite-config/index.js 中。

## build/vite-config/preset

`vite-config/preset`也是配置，但是是内聚的，比较重的配置逻辑

### 产物结构

```sh
dist
|-saas-live
|-saas-watch
|-saas-wap
  |- docker // html入口文件
    |- index.html
    |- [version]/index.html // 这里的index.html的src资源地址带版本号
  |- cloud // oss资源
    |- [version]
      |- static
        |- js
        |- **css**
    |- js
    |- css
```
