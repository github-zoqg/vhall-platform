<template>
  <div class="vmp-zan-zone">
    <span
      v-for="item in eleList"
      :key="item.uuid"
      class="vmp-zan-icon-wrapper"
      :class="item.toTopAnimation"
    >
      <span :class="['vmp-zan-icon', `${item.icon}`, `${item.shakeTopAnimations}`]"></span>
    </span>
  </div>
</template>

<script>
  /**
   * @description 点赞动画效果组件
   */

  /**
   * @description 随机算法闭包生成封装
   * @param array Array随机的总数据池
   * @returns Function 随机算法闭包
   */
  function randomAlgorithmFactory(array) {
    const randomBase = Math.ceil(array.length / 2); // 随机选择前半边的元素
    return function () {
      const idx = Math.floor(randomBase * Math.random());
      const eleArr = array.splice(idx, 1); // 选中的元素摘除
      const ele = eleArr[0];
      array.push(ele); // 塞到队尾
      return ele;
    };
  }
  const eleList = []; // 元素列表
  const iconList = [
    'happy',
    'balloon',
    'quitegood',
    'star',
    'microphone',
    'love',
    'likes2',
    'likes'
  ]; //图标列表
  const toTopAnimations = [
    'zan-animation-01',
    'zan-animation-02',
    'zan-animation-03',
    'zan-animation-04'
  ];
  const shakeAnimations = [
    'shake-animation-01',
    'shake-animation-02',
    'shake-animation-03',
    'shake-animation-04'
  ];
  const pickIcon = randomAlgorithmFactory(iconList); // 挑选向上动画
  const pick2TopAnimations = randomAlgorithmFactory(toTopAnimations); // 挑选向上动画
  const pickShakeTopAnimations = randomAlgorithmFactory(shakeAnimations); // 挑选左右摇摆动画
  let uuid = 1;
  export function giveParise() {
    const toTopAnimation = pick2TopAnimations();
    uuid++; // 自增唯一id
    console.log(toTopAnimation);
    eleList.push({
      uuid,
      icon: pickIcon(),
      toTopAnimation: pick2TopAnimations(),
      // shakeTopAnimations: ''
      shakeTopAnimations: pickShakeTopAnimations()
    });
    console.log(eleList[eleList.length - 1]);
    // 及时删除第一个被占位的元素
    const st = setTimeout(() => {
      eleList.shift();
      clearTimeout(st);
    }, 2000);
  }

  export default {
    name: 'pariseAE',
    data() {
      return {
        eleList
      };
    }
  };
</script>

<style lang="less">
  .vmp-zan-zone {
    position: fixed;
    right: 0;
    bottom: 100px; //底部栏94px
    display: block;
    width: 100px;
    height: 650px;
    pointer-events: none; // 不可点击交互
    z-index: 1000;
    .vmp-zan-icon-wrapper {
      position: absolute;
      display: block; // 定位需要
      bottom: 0;
      left: 0;
      opacity: 0; // 防止动画结束后回到原先位置占位
    }
    // 内部图标
    .vmp-zan-icon {
      display: inline-block;
      width: 70px;
      height: 70px;
      position: relative;
      background-size: contain;
      background-repeat: no-repeat;
      left: 0;
    }
    .zan-animation-01 {
      animation: toTop 2s linear 0s;
    }
    .zan-animation-02 {
      animation: toTop 1.8s linear 0s;
    }
    .zan-animation-03 {
      animation: toTop 1.6s linear 0s;
    }
    .zan-animation-04 {
      animation: toTop 1.4s linear 0s;
    }
    // 图片样式
    @iconList: happy, balloon, quitegood, star, microphone, love, likes2, likes;
    // less的index是从1开始到length
    .loop(@i: 1) when(@i <= length(@iconList)) {
      @iconName: extract(@iconList, @i); // extract取数组的第i个元素
      .vmp-zan-icon.@{iconName} {
        background-image: ~'url(./img/@{iconName}.png)';
      }
      .vmp-zan-icon.shake-animation-0@{i} {
        animation: ~'shake@{i}' 2s linear 0s;
      }
      .loop(@i + 1);
    }
    .loop();
  }

  .vmp-zan-icon.shake-animation-01 {
    animation: shake1 2s linear 0s;
  }
  .vmp-zan-icon.shake-animation-02 {
    animation: shake2 2s linear 0s;
  }
  .vmp-zan-icon.shake-animation-03 {
    animation: shake3 2s linear 0s;
  }
  .vmp-zan-icon.shake-animation-04 {
    animation: shake4 2s linear 0s;
  }
  // 向上移动动画
  @keyframes toTop {
    0% {
      bottom: -40px;
      opacity: 1;
      transform: scale(0);
    }
    10% {
      bottom: -20px;
      opacity: 1;
      transform: scale(1);
    }
    50% {
      bottom: 300px;
    }
    60% {
      bottom: 360px;
      opacity: 0.8;
    }
    70% {
      bottom: 420px;
    }
    80% {
      bottom: 480px;
    }
    90% {
      bottom: 600px;
    }
    100% {
      bottom: 660px;
      opacity: 0;
    }
  }
  @keyframes shake1 {
    0% {
      left: 0;
    }
    25% {
      left: -20px;
    }
    50% {
      left: 0;
    }
    75% {
      left: -20px;
    }
    100% {
      left: 0;
    }
  }
  @keyframes shake2 {
    0% {
      left: 0;
    }
    80% {
      left: -80px;
    }
    100% {
      left: -40px;
    }
  }
  @keyframes shake3 {
    0% {
      left: 0;
    }
    65% {
      left: -20px;
    }
    100% {
      left: 30px;
    }
  }
  @keyframes shake4 {
    0% {
      left: 0;
    }
    20% {
      left: -15px;
    }
    70% {
      left: 20px;
    }
    100% {
      left: 5px;
    }
  }
</style>
