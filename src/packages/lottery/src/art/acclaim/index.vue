<template>
  <div class="wrap">
    <!-- 1:左666 -->
    <div
      v-for="(ele, idx) of eleList"
      :key="ele.uuid"
      :class="['acclaim', ele.position, ele.toTopAnimation, ele.icon]"
      @webkitAnimationEnd="handleAnimationEnd(idx)"
    ></div>
    <!-- 右666 -->
    <!-- <div class="acclaim acclaim-2"></div> -->
    <!-- gogogo -->
    <!-- <div class="acclaim acclaim-3"></div> -->
    <!-- 加油鸭 -->
    <!-- <div class="acclaim acclaim-4"></div> -->
    <!-- 哇哦 -->
    <!-- <div class="acclaim acclaim-5"></div> -->
    <!-- 有点意思 -->
    <!-- <div class="acclaim acclaim-6"></div> -->
    <!-- 太炫了 -->
    <!-- <div class="acclaim acclaim-7"></div> -->
  </div>
</template>
<script>
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
  const iconList = [
    'acclaim-1',
    'acclaim-2',
    'acclaim-3',
    'acclaim-4',
    'acclaim-5',
    'acclaim-6',
    'acclaim-7'
  ]; //图标列表
  const toTopAnimations = [
    'zan-animation-01',
    'zan-animation-02',
    'zan-animation-03',
    'zan-animation-04'
  ];
  const position = ['position-1', 'position-2', 'position-3', 'position-4', 'position-5'];
  const pickIcon = randomAlgorithmFactory(iconList); // 挑选向上动画
  const pick2TopAnimations = randomAlgorithmFactory(toTopAnimations); // 挑选向上动画
  const pickPosition = randomAlgorithmFactory(position); // 挑选左右摇摆动画
  const eleList = []; // 元素列表
  let uuid = 0;
  /**
   * @description 单次渲染一个元素的动画
   */
  function appendEl() {
    uuid++;
    eleList.push({
      uuid,
      icon: pickIcon(),
      toTopAnimation: pick2TopAnimations(),
      position: pickPosition()
    });
  }
  /**
   * @description 对外暴露的点赞函数
   */
  export function acclaimAE() {
    const maxCount = 2; //一次点赞最大渲染元素次数
    const count = Math.ceil(Math.random() * maxCount);
    for (let i = 0; i < count; i++) {
      appendEl();
    }
  }
  window.aaa = acclaimAE;

  export default {
    name: 'acclaim',
    data() {
      return {
        eleList
      };
    },
    methods: {
      handleAnimationEnd(idx) {
        this.eleList.splice(idx, 1);
      }
    }
  };
</script>
<style lang="css" scoped>
  .wrap {
    position: relative;
    height: 200px;
    pointer-events: none;
    /* background: red; */
  }

  .acclaim {
    display: inline-block;
    position: absolute;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .acclaim-1 {
    /* top: 80px; */
    left: 5px;
    width: 45px;
    height: 49px;
    background-image: url('./img/acclaim-1.png');
    animation: toTop 1000ms 1;
  }

  @keyframes cheer-1 {
    from {
      opacity: 0.8;
      transform: scale(0.85);
    }
    to {
    }
  }

  .acclaim-2 {
    /* top: 55px; */
    right: 75px;
    width: 36px;
    height: 35px;
    background-image: url('./img/acclaim-2.png');
    animation: toTop 800ms 1;
  }

  @keyframes cheer-2 {
    from {
      opacity: 0.8;
      transform: scale(0.85);
    }
    to {
    }
  }

  .acclaim-3 {
    left: 80px;
    width: 86px;
    height: 34px;
    background-image: url('./img/acclaim-3.png');
    animation: toTop 900ms 1;
  }

  @keyframes cheer-3 {
    from {
      top: 60px;
      transform: scale(0.85);
    }
    to {
      top: 50px;
    }
  }

  .acclaim-4 {
    width: 86px;
    height: 34px;
    background-image: url('./img/acclaim-4.png');
    animation: toTop 2000ms 1 alternate-reverse linear;
  }

  @keyframes cheer-4 {
    from {
      left: 80px;
      top: 20px;
      /* transition: ; */
      transform: scale(0.85) rotate(-30deg);
    }
    to {
      top: 10px;
      left: 230px;
      transform: rotate(10deg);
    }
  }

  .acclaim-5 {
    /* top: 45px; */
    left: 30px;
    width: 151px;
    height: 24px;
    background-image: url('./img/acclaim-5.png');
    animation: toTop 1000ms 1;
  }

  @keyframes cheer-5 {
    from {
      opacity: 0.7;
    }
    to {
    }
  }

  .acclaim-6 {
    right: 10px;
    width: 67px;
    height: 38px;
    background-image: url('./img/acclaim-6.png');
    animation: toTop 950ms 1 alternate-reverse;
  }
  @keyframes cheer-6 {
    from {
      top: 50px;
    }
    to {
      top: 20px;
    }
  }

  .acclaim-7 {
    left: 180px;
    width: 79px;
    height: 41px;
    background-image: url('./img/acclaim-7.png');
    animation: toTop 750ms 1 alternate-reverse;
  }

  @keyframes cheer-7 {
    from {
      top: 65px;
      opacity: 0.8;
      transform: scale(0.85);
    }
    to {
      top: 55px;
    }
  }
  @keyframes toTop {
    from {
      top: 200px;
    }
    to {
      top: -20px;
    }
  }
</style>
