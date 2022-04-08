## 虚拟人数组件

用于 发起端 设置虚拟人数

设置在某一个时间内、添加多少人数和热度

### 输出 api(暴露给其他组件使用的方法)

| 方法名            | 参数 | 描述             |
| ----------------- | ---- | ---------------- |
|                   |      |                  |
| openVirtualDialog | 无   | 显示虚拟人数弹窗 |

### 使用接口地址

| 模块         | 参数（必传）                                               | 描述             | 接口地址                                                  |
| ------------ | ---------------------------------------------------------- | ---------------- | --------------------------------------------------------- |
| 虚拟人数信息 | 1. webinar_id（活动 id）                                   | 获取虚拟观众基数 | `http://yapi.vhall.domain/project/99/interface/api/28323` |
| 增加虚拟人数 | 1. webinar_id（活动 id）                                   | 开始增加虚拟观众 | `http://yapi.vhall.domain/project/99/interface/api/28317` |
| 增加虚拟人数 | 1. webinar_id（活动 id）2. pv: (热度) 3. online:(在线人数) | 增加虚拟观众     | `http://yapi.vhall.domain/project/99/interface/api/25053` |

### 虚拟人数逻辑

http://wiki.vhallops.com/pages/viewpage.action?pageId=253002600
