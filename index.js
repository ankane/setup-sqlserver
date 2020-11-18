const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

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
  run (`wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -`);
  run(`sudo add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/$(. /etc/os-release && echo $VERSION_ID)/mssql-server-${sqlserverVersion}.list)"`);
  run(`sudo apt-get update`);
  run(`sudo apt-get install mssql-server mssql-tools`);
  run(`sudo MSSQL_SA_PASSWORD='' MSSQL_PID=developer /opt/mssql/bin/mssql-conf -n setup accept-eula`);

  addToPath(`/opt/mssql-tools/bin`);
}
