<template>
  <section>
    <h1>ICON-TEXT</h1>
    <component :is="curComponent" />

    <pre style="border: 1px solid #000" v-highlightjs="sourcecode">
      <code class="javascript">
        console.log('this is chat document')
        let chat = 'hello world'
      </code>
    </pre>
  </section>
</template>

<script>
  import PageMixin from '../../mixins/page-mixin';

  export default {
    name: 'icon-text-page',
    mixins: [PageMixin]
  };
</script>

<style></style>
