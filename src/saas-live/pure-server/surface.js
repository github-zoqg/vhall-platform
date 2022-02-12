/**
 * Created by yangxy on 2021/12/31.
 * 在此编写 界面布局、外观调整等相关的操作
 */
export default {
  /**
   * 交换两个元素的位置
   * @param {*} el1
   * @param {*} el2
   */
  exchange(el1) {
    const remoteDom = document.getElementById(`stream-${el1}`);
    const localDom = document.querySelector('.vmp-stream-local');
    exchangeElementPosition(remoteDom, localDom);
  }
};

// 通用方法，交换两个 dom 的位置
function exchangeElementPosition(el1, el2) {
  const ep1 = el1.parentNode,
    ep2 = el2.parentNode,
    index1 = Array.prototype.indexOf.call(ep1.children, el1),
    index2 = Array.prototype.indexOf.call(ep2.children, el2);
  ep2.insertBefore(el1, ep2.children[index2]);
  ep1.insertBefore(el2, ep1.children[index1]);
}
