/**
 * Created by yangxy on 2021/12/31.
 * 纯服务，我们这里标识非vue组件提供的服务，实际上也就一个对象包含各种方法。
 * 因为会通过事件驱动执行逻辑 ，所以也需要注册到全局事件服务池中。
 * 为了尽量避免与注册组件服务的冲突，约定所有纯服务在注册时，会自动补充 ps 作为命名空间。
 * 事件驱动调用纯服务的方法效果如下：
 *  window.$middleEventSdk.serverPool.get('ps.surface').exchange();
 */
import surface from './surface';

export default {
  surface
};
