const { getCmdArgs, parseEnvOption } = require('./run-utils.js');
const { spawnSync } = require('child_process');
const { sep } = require('path');

// vite不能使用自定义cmd。 vite serve --project=xxxx会报错。故而使用环境变量做一次转发
function runCmd() {
  const args = getCmdArgs();
  const { mode, project, hash, version, local } = args;
  const main_cmd = args._[0];

  const cmd_env_string = parseEnvOption({
    env_prefix: 'VITE_SHELL_CMD_',
    cmd_env_list: [
      ['MAIN', main_cmd], // 主命令如 build、serve
      ['PROJECT', project], // 项目名，如saas-live、saas-watch
      ['MODE', mode], // 模式名(环境名)，如test4、test_zt
      ['HASH', hash], // 哈希值，由运维添加
      ['VERSION', version], // 版本号，读取自package.json
      ['LOCAL', local] // 调试用。是否是本地，一般本地build强制使用local配置，避免使用oss
    ]
  });
  const cmd_set_env = `node  & node_modules${sep}.bin${sep}cross-env ${cmd_env_string}`;
  const cmd_run_vite = `node_modules${sep}.bin${sep}vite ${main_cmd} --config=vite.config.js --force`;
  const shellString = `${cmd_set_env} ${cmd_run_vite}`;

  //  使用spawn的stdio才能穿透子线程，正确显示console的颜色。使用shelljs等均无法还原颜色
  spawnSync(shellString, {
    shell: true,
    stdio: 'inherit'
  });
}

runCmd();
