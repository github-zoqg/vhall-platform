<template>
  <div class="wrap">
    <!-- 左666 -->
    <div class="acclaim acclaim-1"></div>
    <!-- 右666 -->
    <div class="acclaim acclaim-2"></div>
    <!-- gogogo -->
    <div class="acclaim acclaim-3"></div>
    <!-- 加油鸭 -->
    <div class="acclaim acclaim-4"></div>
    <!-- 哇哦 -->
    <div class="acclaim acclaim-5"></div>
    <!-- 有点意思 -->
    <div class="acclaim acclaim-6"></div>
    <!-- 太炫了 -->
    <div class="acclaim acclaim-7"></div>
  </div>
</template>

<style lang="css" scoped>
  .wrap {
    position: relative;
    height: 120px;
    pointer-events: none;
  }

  .acclaim {
    display: inline-block;
    position: absolute;
    background-repeat: no-repeat;
    background-size: contain;
    animation: cheer 1s infinite;
  }

  .acclaim-1 {
    top: 80px;
    left: 5px;
    width: 45px;
    height: 49px;
    background-image: url('./img/acclaim-1.png');
    animation: cheer-1 1000ms infinite;
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
    top: 55px;
    right: 75px;
    width: 36px;
    height: 35px;
    background-image: url('./img/acclaim-2.png');
    animation: cheer-2 800ms infinite;
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
    animation: cheer-3 900ms infinite alternate-reverse;
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
    animation: cheer-4 2000ms infinite alternate-reverse linear;
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
    top: 45px;
    left: 30px;
    width: 151px;
    height: 24px;
    background-image: url('./img/acclaim-5.png');
    animation: cheer-5 1000ms infinite;
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
    animation: cheer-6 950ms infinite alternate-reverse;
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
    animation: cheer-7 750ms infinite alternate-reverse;
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
</style>
