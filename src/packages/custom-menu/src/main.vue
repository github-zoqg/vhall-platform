<template>
  <section>
    <header>
      <tabs :menus="menus"></tabs>
    </header>
    <main>
      <preview-box></preview-box>
    </main>
  </section>
</template>

<script>
  import Tabs from './tabs.vue';
  import PreviewBox from './preview-box.vue';

  export default {
    name: 'VmpCustomMenu',
    components: { Tabs, PreviewBox },
    data() {
      return {
        menus: [{ name: '问答', status: '1', type: 'v5', id: 'qa' }]
      };
    },
    methods: {}
  };
</script>

<style lang="less"></style>
