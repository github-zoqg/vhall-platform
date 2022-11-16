<!--
此组件用于实现无根元素的容器.
-->
<script type="text/jsx" lang="jsx">
  export default {
    name: 'VmpBasicCenterMain',
    functional: true,
    render(createElement, { props }) {
      let widgets = [];
      if (props.cuid && window.$serverConfig && window.$serverConfig[props.cuid]) {
        const list = window.$serverConfig[props.cuid].children || [];
        for (const cuid of list) {
          const widget = window.$serverConfig[cuid];
          if (widget && widget.component) {
            widgets.push({
              cuid,
              component: widget.component
            });
          }
        }
      }
      const renderList = widgets.map(item => {
        return createElement(item.component, {
          props: {
            cuid: item.cuid
          }
        });
      });
      return [
        <div class="vmp-basic-center__mainscreen-pos"></div>,
        // createElement('div',{class:'vmp-basic-center__mainscreen-pos'}),
        ...renderList
      ];
    },
    props: {
      cuid: {
        type: String,
        default() {
          return '';
        }
      }
    }
  };
</script>
