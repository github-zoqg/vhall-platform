const { getCmdArgs, parseEnvOption } = require('./run-utils.js');
const { spawnSync } = require('child_process');
const { sep } = require('path');

const args = getCmdArgs();

// vite不能使用自定义cmd。 vite serve --project=xxxx会报错。故而使用环境变量做一次转发
function runCmd() {
  const { mode, project, hash, version } = args;
  const main_cmd = args._[0];

  const cmd_env_string = parseEnvOption({
    env_prefix: 'VITE_SHELL_CMD_',
    cmd_env_list: [
      ['MAIN', main_cmd],
      ['PROJECT', project],
      ['MODE', mode],
      ['HASH', hash],
      ['VERSION', version]
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
