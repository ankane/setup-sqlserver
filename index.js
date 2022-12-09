const execSync = require('child_process').execSync;
const fs = require('fs');
const os = require('os');
const path = require('path');
const process = require('process');
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

function useTmpDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlserver-'));
  process.chdir(tmpDir);
  return tmpDir;
}

const acceptEula = process.env['INPUT_ACCEPT-EULA'];
if (acceptEula !== 'true') {
  throw `The SQL Server End-User License Agreement (EULA) must be accepted before SQL Server can start`;
}

const sqlserverVersion = parseInt(process.env['INPUT_SQLSERVER-VERSION'] || 2019);
if (![2022, 2019, 2017].includes(sqlserverVersion)) {
  throw `SQL Server version not supported: ${sqlserverVersion}`;
}

if (isMac()) {
  throw `Mac not supported`;
} else if (isWindows()) {
  let url;
  if (sqlserverVersion == 2022) {
    url = 'https://download.microsoft.com/download/c/c/9/cc9c6797-383c-4b24-8920-dc057c1de9d3/SQL2022-SSEI-Dev.exe';
  } else if (sqlserverVersion == 2019) {
    // https://go.microsoft.com/fwlink/?linkid=866662
    url = 'https://download.microsoft.com/download/d/a/2/da259851-b941-459d-989c-54a18a5d44dd/SQL2019-SSEI-Dev.exe';
  } else {
    throw `SQL Server version not supported on Windows: ${sqlserverVersion}`;
  }

  // install
  const tmpDir = useTmpDir();
  run(`curl -Ls -o SQL${sqlserverVersion}-SSEI-Dev.exe ${url}`);
  run(`SQL${sqlserverVersion}-SSEI-Dev.exe /Action=Download /MediaPath="${tmpDir}" /MediaType=CAB /Quiet`);
  run(`SQLServer${sqlserverVersion}-DEV-x64-ENU.exe /X:${tmpDir}\\Media /QS`);
  const params = [
    `/IACCEPTSQLSERVERLICENSETERMS`,
    `/ACTION="install"`,
    `/FEATURES=SQL,Tools`,
    `/INSTANCENAME=MSSQLSERVER`,
    `/SQLSVCACCOUNT="NT AUTHORITY\\SYSTEM"`,
    `/SQLSYSADMINACCOUNTS="BUILTIN\\ADMINISTRATORS"`,
    `/SAPWD="YourStrong!Passw0rd"`,
    `/SECURITYMODE=SQL`,
    `/ERRORREPORTING=0`
  ];
  // for debugging
  // params.push(`/INDICATEPROGRESS`);
  run(`${tmpDir}\\Media\\setup.exe /Q ${params.join(' ')}`);

  addToPath(`C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn`);
} else {
  // install
  run(`wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -`);
  run(`wget -qO- https://packages.microsoft.com/config/ubuntu/$(. /etc/os-release && echo $VERSION_ID)/mssql-server-${sqlserverVersion}.list | sudo tee /etc/apt/sources.list.d/mssql-server-${sqlserverVersion}.list`);
  // need to update all due to dependencies
  // run(`sudo apt-get update -o Dir::Etc::sourcelist="sources.list.d/mssql-server-${sqlserverVersion}.list" -o Dir::Etc::sourceparts="-" -o APT::Get::List-Cleanup="0"`);
  run(`sudo apt-get update`);
  run(`sudo apt-get install mssql-server mssql-tools`);
  run(`sudo MSSQL_SA_PASSWORD='YourStrong!Passw0rd' MSSQL_PID=developer /opt/mssql/bin/mssql-conf -n setup accept-eula`);

  waitForReady();

  addToPath(`/opt/mssql-tools/bin`);
}
