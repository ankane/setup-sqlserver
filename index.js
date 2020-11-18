const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

function run(command) {
  console.log(command);
  execSync(command, {stdio: 'inherit'});
}

function addToPath(newPath) {
  fs.appendFileSync(process.env.GITHUB_PATH, `${newPath}\n`);
}

function isMac() {
  return process.platform == 'darwin';
}

function isWindows() {
  return process.platform == 'win32';
}

function waitForReady() {
  console.log("Waiting for server to be ready");
  for (let i = 0; i < 30; i++) {
    let ret = spawnSync('/opt/mssql-tools/bin/sqlcmd', ['-U', 'SA', '-P', 'YourStrong!Passw0rd', '-Q', 'SELECT @@VERSION']);
    if (ret.status === 0) {
      break;
    }
    spawnSync('sleep', ['1']);
  }
}

const acceptEula = process.env['INPUT_ACCEPT-EULA'];
if (acceptEula !== 'true') {
  throw `The SQL Server End-User License Agreement (EULA) must be accepted before SQL Server can start`;
}

const sqlserverVersion = parseFloat(process.env['INPUT_SQLSERVER-VERSION'] || 2019);
if (![2019, 2017].includes(sqlserverVersion)) {
  throw `SQL Server version not supported: ${sqlserverVersion}`;
}

if (isMac()) {
  throw `Mac not supported`;
} else if (isWindows()) {
  throw `Windows not supported yet`;
} else {
  // install
  run(`wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -`);
  run(`wget -qO- https://packages.microsoft.com/config/ubuntu/$(. /etc/os-release && echo $VERSION_ID)/mssql-server-${sqlserverVersion}.list | sudo tee /etc/apt/sources.list.d/mssql-server-${sqlserverVersion}.list`);
  run(`sudo apt-get update -o Dir::Etc::sourcelist="sources.list.d/mssql-server-${sqlserverVersion}.list" -o Dir::Etc::sourceparts="-" -o APT::Get::List-Cleanup="0"`);
  run(`sudo apt-get install mssql-server mssql-tools`);
  run(`sudo MSSQL_SA_PASSWORD='YourStrong!Passw0rd' MSSQL_PID=developer /opt/mssql/bin/mssql-conf -n setup accept-eula`);

  waitForReady();

  addToPath(`/opt/mssql-tools/bin`);
}
