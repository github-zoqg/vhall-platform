<template>
  <section>
    <div>
      <img src="../assets/imgs/noData.png" alt="" srcset="" />
    </div>
    <p>
      {{ showType ? $t('nav.nav_1038') : $t('nav.nav_1039') }}
    </p>
  </section>
</template>

<script>
  export default {
    name: 'noData',
    props: {
      showType: {
        // 0 显示打赏文案，1显示邀请文案
        type: Number,
        default: 1
      }
    }
  };
</script>

<style lang="less" scoped>
  section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    div {
      width: 266px;
      img {
        width: 100%;
      }
    }
    p {
      margin-top: 28px;
      text-align: center;
      font-size: 28px;
      font-weight: 400;
      color: var(--theme-tab-content-rank-noData-font);
    }
  }
</style>
