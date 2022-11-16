<!--
通用容器组件
用途：此组件用于实现无根元素的容器.
-->
<script type="text/jsx" lang="jsx">
  export default {
    name: 'VmpAirContainer',
    functional: true, //设置为函数式组件
    // 实现render函数，渲染dom
    render(createElement, { props }) {
      let widgets = [];
      if (props.cuid && window.$serverConfig && window.$serverConfig[props.cuid]) {
        const list = props.oneself ? [props.cuid] : window.$serverConfig[props.cuid].children || [];
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
      return widgets.map(item => {
        return createElement(item.component, {
          props: {
            cuid: item.cuid
          },
          ref: props.cref ? props.cref : undefined
        });
      });
    },
    props: {
      // 组件的唯一标识
      cuid: {
        type: String,
        default() {
          return '';
        }
      },
      // 是否渲染组件本身（默认渲染组件的children）
      oneself: {
        type: Boolean,
        default() {
          return false;
        }
      },
      cref: {
        type: String,
        default() {
          return '';
        }
      }
    }
  };
</script>
