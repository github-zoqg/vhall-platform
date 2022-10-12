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
    /* position: relative; */
    width: 320px;
    height: 180px;
    pointer-events: none;
    /* background: black; */
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
    background-image: url('./img/ribbon-2.png');
  }

  .flutter-1 {
    /* animation: flutter-1 1s linear infinite; */
    animation: flutter-1 1s linear 1;
  }

  @keyframes flutter-1 {
    0% {
      opacity: 1;
      top: 70px;
      left: 70px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 60px;
      left: 40px;
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
      top: 130px;
      left: 60px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 140px;
      left: 30px;
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
      top: 40px;
      left: 60px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 20px;
      left: 20px;
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
      top: 120px;
      left: 220px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 140px;
      left: 260px;
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
      top: 50px;
      left: 240px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 40px;
      left: 280px;
      opacity: 0;
    }
  }
</style>
