// Archive the already prepared Windows distribution; never rebuild or modify app.asar.
// Uses the Windows ZIP libraries. No downloads, new dependencies or executable wrapper.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const assert = require('node:assert/strict');

assert.equal(process.platform, 'win32', 'Create the Windows distribution on Windows.');
const root = path.resolve(__dirname, '..');
const repair = path.join(root, 'native-repair');
const source = path.join(repair, 'runtime-preserved');
const dist = path.join(root, 'dist');
const containerName = 'P4G_Companion_Windows';
const destination = path.join(dist, containerName + '.zip');

function sha256(file) {
  const hash = crypto.createHash('sha256'), buffer = Buffer.allocUnsafe(1024 * 1024);
  const descriptor = fs.openSync(file, 'r');
  try {
    let length;
    while ((length = fs.readSync(descriptor, buffer, 0, buffer.length, null)) > 0) hash.update(buffer.subarray(0, length));
    return hash.digest('hex');
  } finally { fs.closeSync(descriptor); }
}

function manifest(folder, prefix = containerName) {
  const files = [];
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), 'Distribution must not contain symbolic links: ' + entry.name);
    const file = path.join(folder, entry.name), name = prefix + '/' + entry.name;
    if (entry.isDirectory()) files.push(...manifest(file, name));
    else if (entry.isFile()) files.push({ name, size: fs.statSync(file).size, sha256: sha256(file) });
    else throw new Error('Unsupported distribution entry: ' + file);
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

const runtime = path.join(source, 'P4G Companion.exe');
const archive = path.join(source, 'resources', 'app.asar');
assert(fs.existsSync(runtime) && fs.existsSync(archive), 'Run prepare-manual-distribution.cjs before creating the ZIP.');
assert.equal(sha256(runtime), sha256(path.join(root, 'node_modules/electron/dist/electron.exe')), 'The original runtime must remain unchanged.');
assert.equal(sha256(archive), sha256(path.join(dist, 'win-unpacked/resources/app.asar')), 'The prepared app archive must match the built app.');
const expected = manifest(source);
fs.mkdirSync(dist, { recursive: true });
const stage = fs.mkdtempSync(path.join(repair, 'zip-stage-'));
const stagedFolder = path.join(stage, containerName);
const temporaryZIP = path.join(stage, containerName + '.zip');

// Paths enter PowerShell as environment values, never interpolated shell code.
const archiveCommand = String.raw`
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($env:P4G_ZIP_FOLDER, $env:P4G_ZIP_TEMP, [System.IO.Compression.CompressionLevel]::Fastest, $true)
$zip = [System.IO.Compression.ZipFile]::OpenRead($env:P4G_ZIP_TEMP)
try {
  $files = foreach ($entry in $zip.Entries) {
    if ($entry.Name.Length -eq 0) { continue }
    $stream = $entry.Open()
    $hash = [System.Security.Cryptography.SHA256]::Create()
    try {
      $digest = ([System.BitConverter]::ToString($hash.ComputeHash($stream))).Replace('-', '').ToLowerInvariant()
      [pscustomobject]@{name=$entry.FullName.Replace('\', '/');size=$entry.Length;sha256=$digest}
    } finally { $hash.Dispose(); $stream.Dispose() }
  }
  ConvertTo-Json -InputObject @($files) -Depth 3 -Compress
} finally { $zip.Dispose() }
`;

try {
  fs.cpSync(source, stagedFolder, { recursive: true, force: false, errorOnExist: true });
  console.log('Creating Windows ZIP and verifying every archived file…');
  const result = cp.spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', archiveCommand], {
    cwd: root, windowsHide: true, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, P4G_ZIP_FOLDER: stagedFolder, P4G_ZIP_TEMP: temporaryZIP },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || 'ZIP creation failed.');
  const actual = JSON.parse(result.stdout.trim()).sort((a, b) => a.name.localeCompare(b.name));
  assert.deepEqual(actual, expected, 'ZIP names, lengths and SHA-256 values must exactly match the prepared folder.');
  fs.renameSync(temporaryZIP, destination);
  const checksums = fs.readdirSync(dist).filter(name => name.toLowerCase().endsWith('.zip') && fs.statSync(path.join(dist, name)).isFile())
    .sort().map(name => sha256(path.join(dist, name)) + '  ' + name);
  fs.writeFileSync(path.join(dist, 'SHA256SUMS.txt'), checksums.join('\n') + '\n', 'utf8');
  console.log(JSON.stringify({ status: 'PASS', file: destination, files: actual.length, bytes: fs.statSync(destination).size, sha256: sha256(destination), container: containerName, app_archive_unchanged: true }, null, 2));
} finally {
  // Delete only this newly created staging directory after checking its resolved boundary.
  const resolvedStage = fs.realpathSync(stage), resolvedRepair = fs.realpathSync(repair);
  assert(resolvedStage.startsWith(resolvedRepair + path.sep) && path.basename(resolvedStage).startsWith('zip-stage-'), 'Refusing to remove an unexpected path.');
  fs.rmSync(resolvedStage, { recursive: true, force: true });
}
