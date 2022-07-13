/**
 * 将接受到的参数转成字符串
 * @param {*} val
 * @returns String
 */
export function _toString(val) {
  const type = Object.prototype.toString.call(val);

  if (type === '[object Function]' || type === '[object RegExp]' || type === '[object Symbol]') {
    return val.toString();
  }

  if (type === '[object Error]') {
    return JSON.stringify(val, Object.getOwnPropertyNames(val));
  }

  return JSON.stringify(val);
}

// 测试方法
// function test() {
//   function toStringTest(val) {
//     console.log(typeof _toString(val) + '----------' + _toString(val));
//   }
//   //  对象{}    数组[]    函数function(){}    字符串''    Symbol('ddd')    数字1    布尔true    null    undefined     new Date()                    正则 /at/    错误对象new Error('cuowu')
//   //  '{}'      '[]'      'function(){}'      ''          Symbol(ddd)     '1'      'true'     'null'   undefined    '2022-05-25T11:25:00.931Z'     '/at/'       '{"stack":"Error: cuowu\n ...}'
//   const arr = [
//     {}, // 对象
//     [], // 数组
//     function () { }, // 函数
//     '', // 字符串
//     1, // 数字
//     true, // 布尔
//     null, // null
//     undefined, // undefined
//     new Date(), // Date
//     /at/, // 正则
//     new Error('cuowu') // 错误对象
//   ];
//   arr.forEach(toStringTest);
// }
