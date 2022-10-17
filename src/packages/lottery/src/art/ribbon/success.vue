<template>
  <div class="wrap">
    <span class="ribbon ribbon-1 flutter-1"></span>
    <span class="ribbon ribbon-2 flutter-2"></span>
    <span class="ribbon ribbon-3 flutter-3"></span>
    <span class="ribbon ribbon-4 flutter-4"></span>
    <span class="ribbon ribbon-5 flutter-5"></span>
  </div>
</template>

<style lang="css" scoped>
  .wrap {
    position: relative;
    width: 160px;
    height: 90px;
    pointer-events: none;
    /* background: black; */
  }

  .ribbon {
    position: absolute;
    display: inline-block;
    width: 10px;
    height: 10px;
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0;
  }

  .ribbon-1 {
    background-image: url('./img/ribbon-2.png');
  }

  .flutter-1 {
    /* animation: flutter-1 1s linear infinite; */
    animation: flutter-1 1s linear 1;
  }

  @keyframes flutter-1 {
    0% {
      opacity: 1;
      top: 35px;
      left: 35px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 30px;
      left: 20px;
      opacity: 0;
    }
  }

  .ribbon-2 {
    background-image: url('./img/ribbon-4.png');
  }

  .flutter-2 {
    /* animation: flutter-2 1s linear infinite; */
    animation: flutter-2 1s linear 1;
  }
  @keyframes flutter-2 {
    0% {
      opacity: 1;
      top: 65px;
      left: 30px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 70px;
      left: 15px;
      opacity: 0;
    }
  }

  .ribbon-3 {
    background-image: url('./img/ribbon-5.png');
  }

  .flutter-3 {
    /* animation: flutter-3 1s linear infinite; */
    animation: flutter-3 1s linear 1;
  }

  @keyframes flutter-3 {
    0% {
      opacity: 1;
      top: 20px;
      left: 30px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 10px;
      left: 10px;
      opacity: 0;
    }
  }

  .ribbon-4 {
    transform: rotate(45deg) scale(0.8);
    background-image: url('./img/ribbon-5.png');
  }

  .flutter-4 {
    /* animation: flutter-4 1s linear infinite; */
    animation: flutter-4 1s linear 1;
  }

  @keyframes flutter-4 {
    0% {
      opacity: 1;
      top: 60px;
      left: 110px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 70px;
      left: 130px;
      opacity: 0;
    }
  }

  .ribbon-5 {
    transform: rotate(135deg) scale(0.8);
    background-image: url('./img/ribbon-3.png');
  }

  .flutter-5 {
    /* animation: flutter-5 1s linear infinite; */
    animation: flutter-5 1s linear 1;
  }

  @keyframes flutter-5 {
    0% {
      opacity: 1;
      top: 25px;
      left: 120px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 20px;
      left: 140px;
      opacity: 0;
    }
  }
</style>
