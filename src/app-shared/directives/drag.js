/**
 * @description 自定义元素实现弹框拖拽指令
 * @param close 开关 false 默认打开  v-drag="{ close: false }"
 */
let positionParams = {
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  el: null
};
export const drag = {
  name: 'drag',
  option: {
    bind(el, binding, vnode) {
      positionParams.el = el;
      // console.log('-----drag - bind-----', el, binding, vnode);
    },
    inserted(el, binding, vnode) {
      // console.log('-----drag - inserted-----', el, binding, vnode);
      if (!binding.value?.close) {
        positionParams.el = el;
        el.addEventListener('touchstart', doTouchstart);
        el.addEventListener('touchend', doTouchend);
        el.addEventListener('touchmove', doTouchmove);
      }
    },
    update(el, binding, vnode, oldVnode) {
      positionParams.el = el;
      // console.log('-----drag - update-----', el, binding, vnode, oldVnode);
      if (!binding.value?.close) {
        // console.log('open drag');
        el.addEventListener('touchstart', doTouchstart);
        el.addEventListener('touchend', doTouchend);
        el.addEventListener('touchmove', doTouchmove);
      } else {
        // console.log('close drag');
        el.removeEventListener('touchstart', doTouchstart);
        el.removeEventListener('touchend', doTouchend);
        el.removeEventListener('touchmove', doTouchmove);
        el.style.inset = null;
      }
    },
    unbind(el, binding, vnode) {
      // console.log('-----drag - unbind-----', el, binding, vnode);
    }
  }
};
function doTouchstart(e) {
  positionParams.startX = e.touches[0].pageX;
  positionParams.startY = e.touches[0].pageY;
}
function doTouchend(e) {
  positionParams.x = positionParams.endX;
  positionParams.y = positionParams.endY;
  positionParams.startX = 0;
  positionParams.startY = 0;
}
function doTouchmove(e) {
  if (e.touches.length > 0) {
    let offsetX = e.touches[0].pageX - positionParams.startX;
    let offsetY = e.touches[0].pageY - positionParams.startY;
    let x = positionParams.x - offsetX;
    let y = positionParams.y - offsetY;
    if (x + positionParams.el.offsetWidth > document.documentElement.offsetWidth) {
      x = document.documentElement.offsetWidth - positionParams.el.offsetWidth;
    }
    if (y + positionParams.el.offsetHeight > document.documentElement.offsetHeight) {
      y = document.documentElement.offsetHeight - positionParams.el.offsetHeight;
    }
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    positionParams.el.style.right = x + 'px';
    positionParams.el.style.left = 'auto';
    positionParams.el.style.bottom = y + 'px';
    positionParams.el.style.top = 'auto';
    positionParams.endX = x;
    positionParams.endY = y;
    e.preventDefault();
  }
}
