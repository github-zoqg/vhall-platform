/**
 * @description 自定义元素实现弹框拖拽指令
 * @param close 开关 false 默认打开  v-drag="{ close: false }"
 */

export const drag = {
  name: 'drag',
  option: {
    // bind(el, binding, vnode) { },
    inserted(el, binding, vnode) {
      // console.log('-----drag - inserted-----', el, binding, vnode);
      el.$vhallDrag = {
        dragClose: binding.value?.close,
        doTouchstart: genDoTouchstart(el),
        doTouchend: genDoTouchend(el),
        doTouchmove: genDoTouchmove(el),
        positionParams: {
          x: window.innerWidth - el.clientWidth - el.offsetLeft,
          y: window.innerHeight - el.clientHeight - el.offsetTop,
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0
        }
      };
      el.addEventListener('touchstart', el.$vhallDrag.doTouchstart);
      el.addEventListener('touchend', el.$vhallDrag.doTouchend);
      el.addEventListener('touchmove', el.$vhallDrag.doTouchmove);
    },
    update(el, binding, vnode, oldVnode) {
      // console.log('-----drag - update-----', el, binding, vnode, oldVnode);
      el.$vhallDrag.dragClose = binding.value?.close;
      el.$vhallDrag.positionParams.x = window.innerWidth - el.clientWidth - el.offsetLeft;
      el.$vhallDrag.positionParams.y = window.innerHeight - el.clientHeight - el.offsetTop;
    },
    unbind(el, binding, vnode) {
      // console.log('-----drag - unbind-----', el, binding, vnode);
      el.removeEventListener('touchstart', el.$vhallDrag.doTouchstart);
      el.removeEventListener('touchend', el.$vhallDrag.doTouchend);
      el.removeEventListener('touchmove', el.$vhallDrag.doTouchmove);
    }
  }
};

function genDoTouchstart(targetEl) {
  return function (e) {
    if (!targetEl.$vhallDrag.dragClose) {
      targetEl.$vhallDrag.positionParams.startX = e.touches[0].pageX;
      targetEl.$vhallDrag.positionParams.startY = e.touches[0].pageY;
    }
  };
}
function genDoTouchend(targetEl) {
  return function (e) {
    if (!targetEl.$vhallDrag.dragClose) {
      targetEl.$vhallDrag.positionParams.x = targetEl.$vhallDrag.positionParams.endX;
      targetEl.$vhallDrag.positionParams.y = targetEl.$vhallDrag.positionParams.endY;
      targetEl.$vhallDrag.positionParams.startX = 0;
      targetEl.$vhallDrag.positionParams.startY = 0;
    }
  };
}
function genDoTouchmove(targetEl) {
  return function (e) {
    if (!targetEl.$vhallDrag.dragClose && e.touches.length > 0) {
      let offsetX = e.touches[0].pageX - targetEl.$vhallDrag.positionParams.startX;
      let offsetY = e.touches[0].pageY - targetEl.$vhallDrag.positionParams.startY;
      let x = targetEl.$vhallDrag.positionParams.x - offsetX;
      let y = targetEl.$vhallDrag.positionParams.y - offsetY;
      if (x + targetEl.offsetWidth > document.documentElement.offsetWidth) {
        x = document.documentElement.offsetWidth - targetEl.offsetWidth;
      }
      if (y + targetEl.offsetHeight > document.documentElement.offsetHeight) {
        y = document.documentElement.offsetHeight - targetEl.offsetHeight;
      }
      if (x < 0) {
        x = 0;
      }
      if (y < 0) {
        y = 0;
      }
      targetEl.style.right = x + 'px';
      targetEl.style.left = 'auto';
      targetEl.style.bottom = y + 'px';
      targetEl.style.top = 'auto';
      targetEl.$vhallDrag.positionParams.endX = x;
      targetEl.$vhallDrag.positionParams.endY = y;
      e.preventDefault();
    }
  };
}
