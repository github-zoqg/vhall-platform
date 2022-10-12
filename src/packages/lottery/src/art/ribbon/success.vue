<template>
  <div class="wrap">
    <span class="ribbon ribbon-1 flutter-1"></span>
    <span class="ribbon ribbon-2 flutter-2"></span>
    <span class="ribbon ribbon-3 flutter-3"></span>
    <span class="ribbon ribbon-4 flutter-4"></span>
    <span class="ribbon ribbon-5 flutter-1"></span>
  </div>
</template>

<style lang="css" scoped>
  .wrap {
    position: relative;
    width: 160px;
    height: 90px;
    /* pointer-events: none; */
    background: red;
  }

  .ribbon {
    position: absolute;
    display: inline-block;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0;
  }

  .ribbon-1 {
    transform: rotate(270deg);
    background-image: url('./img/ribbon-2.png');
  }

  .flutter-1 {
    /* animation: flutter-1 1s linear infinite; */
    animation: flutter-1 1s linear 1;
  }

  @keyframes flutter-1 {
    0% {
      opacity: 1;
      top: 190px;
      left: 60px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 240px;
      left: 10px;
      opacity: 0;
    }
  }

  .ribbon-2 {
    width: 10px;
    height: 10px;
    background-image: url('./img/ribbon-2.png');
  }

  .flutter-2 {
    /* animation: flutter-2 1s linear infinite; */
    animation: flutter-2 1s linear 1;
  }
  @keyframes flutter-2 {
    0% {
      opacity: 1;
      top: 80px;
      left: 80px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 50px;
      left: 0;
      opacity: 0;
    }
  }

  .ribbon-3 {
    width: 12px;
    height: 12px;
    background-image: url('./img/ribbon-1.png');
  }

  .flutter-3 {
    animation: flutter-3 1s linear infinite;
    /* animation: flutter-3 1s linear 1; */
  }

  @keyframes flutter-3 {
    0% {
      opacity: 1;
      top: 100px;
      left: 120px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 60px;
      left: 80px;
      opacity: 0;
    }
  }

  .ribbon-4 {
    width: 12px;
    height: 12px;
    transform: rotate(135deg);
    background-image: url('./img/ribbon-3.png');
  }

  .flutter-4 {
    animation: flutter-4 1s linear infinite;
    /* animation: flutter-4 1s linear 1; */
  }

  @keyframes flutter-4 {
    0% {
      opacity: 1;
      top: 160px;
      left: 110px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 210px;
      left: 70px;
      opacity: 0;
    }
  }

  .ribbon-5 {
    background-image: url('./img/ribbon-4.png');
  }

  .flutter-5 {
    animation: flutter-5 1s linear infinite;
    /* animation: flutter-5 1s linear 1; */
  }

  @keyframes flutter-5 {
    0% {
      opacity: 1;
      top: 150px;
      left: 120px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 130px;
      left: 20px;
      opacity: 0;
    }
  }
</style>
