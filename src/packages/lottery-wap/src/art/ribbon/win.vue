<template>
  <div class="wrap">
    <span class="ribbon ribbon-1 flutter-1"></span>
    <span class="ribbon ribbon-2 flutter-2"></span>
    <span class="ribbon ribbon-3 flutter-3"></span>
    <span class="ribbon ribbon-4 flutter-4"></span>
    <span class="ribbon ribbon-5 flutter-5"></span>
    <span class="ribbon ribbon-6 flutter-6"></span>
    <span class="ribbon ribbon-7 flutter-7"></span>
    <span class="ribbon ribbon-8 flutter-8"></span>
    <span class="ribbon ribbon-9 flutter-9"></span>
  </div>
</template>

<style lang="css" scoped>
  .wrap {
    position: relative;
    width: 600px;
    height: 600px;
    pointer-events: none;
    /* background: #fff; */
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
      top: 380px;
      left: 120px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 480px;
      left: 20px;
      opacity: 0;
    }
  }

  .ribbon-2 {
    width: 20px;
    height: 20px;
    background-image: url('./img/ribbon-2.png');
  }

  .flutter-2 {
    /* animation: flutter-2 1s linear infinite; */
    animation: flutter-2 1s linear 1;
  }
  @keyframes flutter-2 {
    0% {
      opacity: 1;
      top: 160px;
      left: 160px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 100px;
      left: 0;
      opacity: 0;
    }
  }

  .ribbon-3 {
    width: 24px;
    height: 24px;
    background-image: url('./img/ribbon-1.png');
  }

  .flutter-3 {
    /* animation: flutter-3 1s linear infinite; */
    animation: flutter-3 1s linear 1;
  }

  @keyframes flutter-3 {
    0% {
      opacity: 1;
      top: 200px;
      left: 240px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 120px;
      left: 160px;
      opacity: 0;
    }
  }

  .ribbon-4 {
    width: 24px;
    height: 24px;
    transform: rotate(135deg);
    background-image: url('./img/ribbon-3.png');
  }

  .flutter-4 {
    /* animation: flutter-4 1s linear infinite; */
    animation: flutter-4 1s linear 1;
  }

  @keyframes flutter-4 {
    0% {
      opacity: 1;
      top: 320px;
      left: 220px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 420px;
      left: 140px;
      opacity: 0;
    }
  }

  .ribbon-5 {
    background-image: url('./img/ribbon-4.png');
  }

  .flutter-5 {
    /* animation: flutter-5 1s linear infinite; */
    animation: flutter-5 1s linear 1;
  }

  @keyframes flutter-5 {
    0% {
      opacity: 1;
      top: 300px;
      left: 240px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 260px;
      left: 40px;
      opacity: 0;
    }
  }

  .ribbon-6 {
    width: 24px;
    height: 24px;
    background-image: url('./img/ribbon-5.png');
  }

  .flutter-6 {
    /* animation: flutter-6 1s linear infinite; */
    animation: flutter-6 1s linear 1;
  }

  @keyframes flutter-6 {
    0% {
      opacity: 1;
      top: 260px;
      left: 360px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 120px;
      left: 460px;
      opacity: 0;
    }
  }

  .ribbon-7 {
    width: 24px;
    height: 24px;
    background-image: url('./img/ribbon-3.png');
  }

  .flutter-7 {
    /* animation: flutter-7 1s linear infinite; */
    animation: flutter-7 1s linear 1;
  }

  @keyframes flutter-7 {
    0% {
      opacity: 1;
      top: 360px;
      right: 200px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 380px;
      right: 60px;
      opacity: 0;
    }
  }

  .ribbon-8 {
    width: 24px;
    height: 24px;
    background-image: url('./img/ribbon-4.png');
  }

  .flutter-8 {
    /* animation: flutter-8 1s linear infinite; */
    animation: flutter-8 1s linear 1;
  }

  @keyframes flutter-8 {
    0% {
      opacity: 1;
      top: 380px;
      left: 380px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 440px;
      left: 460px;
      opacity: 0;
    }
  }

  .ribbon-9 {
    width: 24px;
    height: 24px;
    background-image: url('./img/ribbon-5.png');
  }

  .flutter-9 {
    /* animation: flutter-9 1s linear infinite; */
    animation: flutter-9 1s linear 1;
  }

  @keyframes flutter-9 {
    0% {
      opacity: 1;
      top: 160px;
      left: 340px;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 80px;
      left: 360px;
      opacity: 0;
    }
  }
</style>
