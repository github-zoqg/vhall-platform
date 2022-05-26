// 向客户端发送消息
function JsCallQtMsg(obj = {}) {
  let retMsg = null;
  try {
    retMsg = JSON.stringify(obj);
  } catch (e) {
    retMsg = obj;
  }
  if (window.JsCallQtMsg && typeof window.JsCallQtMsg === 'function') {
    window.JsCallQtMsg(retMsg);
  }
}

let QtCallFunctionPageCbs = [];
// 注册 QtCallFunctionPage 事件
function onQtCallFunctionPage(cb) {
  // 如果回调数组为空，先注册一下事件
  if (QtCallFunctionPageCbs.length === 0) {
    window.QtCallFunctionPage = msg => {
      QtCallFunctionPageCbs.forEach(cb => {
        cb(msg);
      });
    };
  }

  QtCallFunctionPageCbs.push(cb);
}

// 注销 QtCallFunctionPage 事件
function offQtCallFunctionPage(cb) {
  const index = QtCallFunctionPageCbs.findIndex(item => item == cb);
  // 如果存在，删除
  if (index > -1) {
    QtCallFunctionPageCbs.splice(index, 1);
  }
}

// 清除 QtCallFunctionPage 事件
function clearQtCallFunctionPage() {
  QtCallFunctionPageCbs = [];
}

export default {
  JsCallQtMsg,
  onQtCallFunctionPage,
  offQtCallFunctionPage,
  clearQtCallFunctionPage
};
