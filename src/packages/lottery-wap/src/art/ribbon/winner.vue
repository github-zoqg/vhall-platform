<template>
  <div class="wrap">
    <span class="ribbon ribbon-1 flutter-1"></span>
    <span class="ribbon ribbon-2 flutter-2"></span>
    <span class="ribbon ribbon-3 flutter-3"></span>
    <span class="ribbon ribbon-4 flutter-4"></span>
    <span class="ribbon ribbon-5 flutter-1"></span>
    <span class="ribbon ribbon-6 flutter-2"></span>
  </div>
</template>
<!-- 中奖名单的彩带动画 -->
<style lang="css" scoped>
  .wrap {
    /* position: relative; */
    height: 400px;
    width: 100%;
    pointer-events: none;
  }

  .ribbon {
    position: absolute;
    display: inline-block;
    width: 40px;
    height: 40px;
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0;
  }
  .ribbon-panel {
    width: 100%;
    height: 200px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .flutter-1 {
    animation: flutter 2400ms linear 3;
    /* animation: flutter 2400ms linear; */
  }
  .flutter-2 {
    animation: flutter 1800ms linear 3;
    /* animation: flutter 1800ms linear; */
  }
  .flutter-3 {
    animation: flutter 1500ms linear 3;
    /* animation: flutter 1500ms linear; */
  }
  .flutter-4 {
    /* animation: flutter 2000ms linear; */
    animation: flutter 2000ms linear 3;
  }

  .ribbon-1 {
    left: 20px;
    background-image: url('./img/ribbon-1.png');
  }

  .ribbon-2 {
    left: 260px;
    background-image: url('./img/ribbon-2.png');
  }

  .ribbon-3 {
    left: 140px;
    background-image: url('./img/ribbon-3.png');
  }

  .ribbon-4 {
    left: 420px;
    background-image: url('./img/ribbon-4.png');
  }

  .ribbon-5 {
    left: 600px;
    background-image: url('./img/ribbon-5.png');
  }

  .ribbon-6 {
    left: 820px;
    background-image: url('./img/ribbon-6.png');
  }

  @keyframes flutter {
    0% {
      opacity: 1;
      top: 0;
    }
    25% {
      transform: rotateX(90deg) rotateY(20deg);
    }
    50% {
      top: 200px;
      transform: rotateX(180deg) rotateY(110deg);
    }
    75% {
      transform: rotateX(240deg) rotateY(200deg);
    }
    100% {
      top: 400px;
      transform: rotateX(360deg) rotateY(290deg);
      opacity: 1;
    }
  }
</style>
