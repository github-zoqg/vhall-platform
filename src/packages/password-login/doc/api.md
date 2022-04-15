## 口令登录组件

用于发起端，助理、嘉宾登录

1. 主要用于pc发起端
2. 功能比较简单，支持上传、修改头像，输入昵称和口令登录，成功则跳转到直播间
3. 注意，该组件为独立页面，灰度信息是通过项目里的router的beforeEach钩子混入的

### 依赖服务

- useRoomBaseServer
- useKeyLoginServer
