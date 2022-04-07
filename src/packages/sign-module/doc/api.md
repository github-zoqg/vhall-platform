## 签到组件

用于 发起端、观看端签到

1. 发起端创建签到、签到信息、已签到人员列表、结束签到
2. 观看端签到

### 使用接口地址

| 模块             | 参数（必传）                              | 描述                         | 接口地址                                                   |
| ---------------- | ----------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| 创建签到         | 1. room_id（房间 id）2. 签到信息          | 创建签到，提示语、自动签到等 | `http://yapi.vhall.domain/project/101/interface/api/25719` |
| 查询正在签到信息 | 1. room_id（房间 id）2. 签到信息          | 获取当前活动正在发起的签到   | `http://yapi.vhall.domain/project/101/interface/api/25905` |
| 结束签到         | 1. room_id（房间 id）                     | 结束当前房间的签到           | `http://yapi.vhall.domain/project/101/interface/api/25887` |
| 已签到信息       | 1. room_id（房间 id）2.sign_id（签到 id） | 获取发起的签到的用户签到记录 | `http://yapi.vhall.domain/project/101/interface/api/25911` |
| 观看端签到       | 1. room_id（房间 id）2.sign_id（签到 id） | 点击签到                     | `http://yapi.vhall.domain/project/101/interface/api/25881` |
