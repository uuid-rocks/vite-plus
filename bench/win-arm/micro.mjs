// Single-thread throughput of the primitives pnpm's tarball workers use.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const dir = process.argv[2]
const time = (label, bytes, fn) => {
  fn()
  const start = process.hrtime.bigint()
  const n = fn()
  const s = Number(process.hrtime.bigint() - start) / 1e9
  console.log(`${label.padEnd(28)} ${bytes ? `${(bytes * n / s / 1e6).toFixed(0)} MB/s` : `${(n / s).toFixed(0)} ops/s`} (${s.toFixed(2)}s)`)
}
console.log(`node ${process.version} ${process.arch} openssl ${process.versions.openssl} zlib ${process.versions.zlib}`)
const buf = crypto.randomBytes(64 * 1024 * 1024)
const text = Buffer.from(fs.readFileSync(process.execPath).subarray(0, 32 * 1024 * 1024))
time('sha512 64MB', buf.length, () => { for (let i = 0; i < 4; i++) crypto.hash('sha512', buf, 'hex'); return 4 })
time('sha1 64MB', buf.length, () => { for (let i = 0; i < 4; i++) crypto.hash('sha1', buf, 'hex'); return 4 })
const gz = zlib.gzipSync(text)
time('gunzip (node.exe bytes out)', text.length, () => { for (let i = 0; i < 4; i++) zlib.gunzipSync(gz, { chunkSize: 128 * 1024 }); return 4 })
const target = path.join(dir, 'micro-files')
fs.mkdirSync(target, { recursive: true })
const small = crypto.randomBytes(4096)
let k = 0
time('create 4KB file (wx)', 0, () => { for (let i = 0; i < 5000; i++) fs.writeFileSync(path.join(target, `f${k++}`), small, { flag: 'wx' }); return 5000 })
const links = path.join(dir, 'micro-links')
fs.mkdirSync(links, { recursive: true })
let j = 0
time('hardlink', 0, () => { for (let i = 0; i < 5000; i++) { fs.linkSync(path.join(target, `f${j}`), path.join(links, `l${j}`)); j++ } return 5000 })
let c = 0
time('copyFile', 0, () => { for (let i = 0; i < 2000; i++) { fs.copyFileSync(path.join(target, `f${c}`), path.join(links, `c${c}`)); c++ } return 2000 })
fs.rmSync(target, { recursive: true, force: true })
fs.rmSync(links, { recursive: true, force: true })
