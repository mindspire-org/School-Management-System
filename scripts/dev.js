const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const ROOT = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT, 'backend');
const FRONTEND_DIR = path.join(ROOT, 'frontend');

function prefixStream(stream, label, color) {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    const coloredLabel = color ? `\x1b[${color}m${label}\x1b[0m` : label;
    console.log(`[${coloredLabel}] ${line}`);
  });
}

function runTask(label, _cwd, args = ['run', 'dev'], color = '36') {
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'cmd.exe' : npmCmd;
  const cmdArgs = isWin ? ['/c', 'npm', ...args] : args;

  const child = spawn(cmd, cmdArgs, {
    cwd: ROOT,
    env: { ...process.env },
    shell: false,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  prefixStream(child.stdout, label, color);
  prefixStream(child.stderr, label, '31');

  child.on('error', (err) => {
    console.error(`[${label}] failed to start: ${err.message}`);
  });

  child.on('exit', (code, signal) => {
    const status = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[${label}] exited with ${status}`);
  });

  return child;
}

function shutdown(children) {
  for (const child of children) {
    if (!child || child.killed) continue;
    try {
      child.kill('SIGINT');
    } catch (_) {}
  }
  if (process.platform === 'win32') {
    for (const child of children) {
      if (!child || child.killed) continue;
      try {
        spawn('taskkill', ['/pid', String(child.pid), '/f', '/t']);
      } catch (_) {}
    }
  }
}

async function main() {
  const children = [];

  const backend = runTask('backend', null, ['--prefix', BACKEND_DIR, 'run', 'dev'], '35');
  const frontend = runTask('frontend', null, ['--prefix', FRONTEND_DIR, 'run', 'dev'], '36');

  children.push(backend, frontend);

  const onExit = () => {
    shutdown(children);
    process.exit();
  };

  process.on('SIGINT', onExit);
  process.on('SIGTERM', onExit);

  const handleChildExit = (code) => {
    if (typeof code === 'number' && code !== 0) {
      shutdown(children);
      process.exit(code);
    }
  };

  backend.on('exit', handleChildExit);
  frontend.on('exit', handleChildExit);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
