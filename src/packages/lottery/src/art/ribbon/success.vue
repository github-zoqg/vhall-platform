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

<style lang="css" scoped>
  .wrap {
    position: relative;
    height: 200px;
    width: 100%;
    pointer-events: none;
  }

  .ribbon {
    position: absolute;
    display: inline-block;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0;
    /* animation: flutter 2400ms linear infinite; */
  }

  .flutter-1 {
    animation: flutter 2400ms linear infinite;
    /* animation: flutter 2400ms linear; */
  }
  .flutter-2 {
    animation: flutter 1800ms linear infinite;
    /* animation: flutter 1800ms linear; */
  }
  .flutter-3 {
    animation: flutter 1500ms linear infinite;
    /* animation: flutter 1500ms linear; */
  }
  .flutter-4 {
    /* animation: flutter 2000ms linear; */
    animation: flutter 2000ms linear infinite;
  }

  .ribbon-1 {
    left: 10px;
    background-image: url('./img/ribbon-1.png');
  }

  .ribbon-2 {
    left: 130px;
    background-image: url('./img/ribbon-2.png');
  }

  .ribbon-3 {
    left: 70px;
    background-image: url('./img/ribbon-3.png');
  }

  .ribbon-4 {
    left: 210px;
    background-image: url('./img/ribbon-4.png');
  }

  .ribbon-5 {
    left: 300px;
    background-image: url('./img/ribbon-5.png');
  }

  .ribbon-6 {
    left: 410px;
    background-image: url('./img/ribbon-6.png');
  }

  @keyframes flutter {
    0% {
      opacity: 1;
      top: 0;
      /*opacity: 0;*/
      /*transform: skew(20deg);*/
    }
    25% {
      /*top: 0;*/
      /*opacity: 0;*/
      transform: rotateX(90deg) rotateY(20deg);
      /*transform: rotateX(90deg) rotateY(20deg) skew(-20deg);*/
    }
    50% {
      top: 100px;
      /*transform: translate3d(100% 100% 1);*/
      transform: rotateX(180deg) rotateY(110deg);
    }
    75% {
      transform: rotateX(240deg) rotateY(200deg);
      /*transform: rotateX(240deg) rotateY(200deg) skew(-20deg);*/
      /*opacity: 0;*/
    }
    100% {
      top: 200px;
      transform: rotateX(360deg) rotateY(290deg);
      opacity: 1;
    }
  }
</style>
