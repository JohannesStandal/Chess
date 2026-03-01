const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: [path.resolve(__dirname, '../Core/UCI_Engine/UCI.js')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: path.resolve(__dirname, 'dist/engine.cjs'),
  sourcemap: true,
  external: [
    'readline',
    'fs',
    'path',
    'os',
    'child_process',
    'events',
    'stream'
  ],
}).catch(() => process.exit(1));

/**
 * Commands for building the engine.exe file.
 * 
 * 1: node Builder/build.js
 * 2: pkg Builder/dist/engine.cjs --targets node18-win-x64 --output Builder/Builds/PrebenV2.exe
 */