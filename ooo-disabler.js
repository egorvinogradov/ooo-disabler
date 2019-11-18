const fs = require('fs');
const homedir = require('os').homedir();
const execSync = require('child_process').execSync;
const readline = require('readline');

const launchdPlistPath = homedir + '/Library/LaunchAgents/ooo-disabler.plist';
const configDirectory = homedir + '/.ooo-disabler';
const binaryPath = '/usr/local/bin/ooo-disabler';


if (process.argv.includes('--uninstall')) {
  consolePrompt('\nAre you sure you want to uninstall ooo-disabler? (y/N)', (answer) => {
    if (/^y|yes$/i.test(answer)) {
      consoleRed('\nUninstalling ooo-disabler...\nDone\n');
      uninstall();
    }
    process.exit(0);
  });
}
else if (shouldTurnOffLaptop( getConfig() )) {

  showNotification('WORKING OUT OF OFFICE DETECTED', 'Putting laptop to sleep in 30 seconds...');

  setTimeout(() => {
    showNotification('WORKING OUT OF OFFICE DETECTED', 'Putting laptop to sleep now');

    setTimeout(() => {
      disconnectWifi();
      putToSleep();
    }, 3 * 1000)
  }, 30 * 1000);
}


function getConfig(){
  const requredFields = ['HOME_WIFI_SSID', 'SELECTED_DAYS', 'START_AT', 'END_AT'];
  let rawConfig;

  try {
    rawConfig = fs.readFileSync(configDirectory + '/.config', { encoding: 'utf8' });
  }
  catch(e) {
    consoleRed('\nooo-disabler config not found or malformed. Try installing ooo-disabler again.\n');
    process.exit(1);
  }

  const config = {};

  rawConfig.trim().split(/\n/).forEach(row => {
    const [ key, value ] = row.trim().split('=');
    config[key] = value;
  });
  requredFields.forEach(field => {
    if (!config[field]) {
      consoleRed('\nIntallation incomplete.\nTry installing ooo-disabler again and make sure to fill out data on all steps.\n');
      process.exit(1);
    }
  });
  return config;
}


function isLidOpen(){
  const cmd = `ioreg -r -k AppleClamshellState -d 4 | grep AppleClamshellState | head -1`;
  return execCmd(cmd).indexOf('= No') > -1;
}


function isConnectedToHomeWifi(homeWifiName){
  const cmd = `/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I | awk -F: '/ SSID/{print $2}'`;
  const currentWifiName = execCmd(cmd).trim();
  return currentWifiName === homeWifiName;
}


function parseConfigTime(timeString){
  const values = timeString.split(':');
  return {
    hours: +values[0],
    minutes: +values[1],
  };
}


function isWorkHours(selectedDays, startAt, endAt){
  const daysDict = {
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
    '0': 'Sunday',
  };
  const now = new Date();
  const currentDayName = daysDict[ now.getDay() ];
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const start = parseConfigTime(startAt);
  const end = parseConfigTime(endAt);

  const isWorkDay = selectedDays.split(', ').includes(currentDayName);
  const isAfterDayStarted = currentHours > start.hours || ((currentHours === start.hours) && (currentMinutes >= start.minutes));
  const isBeforeDayEnded = currentHours < end.hours || ((currentHours === end.hours) && (currentMinutes < end.minutes));
  return isWorkDay && isAfterDayStarted && isBeforeDayEnded;
}


function showNotification(title, text){
  const cmd = `osascript -e 'display notification "${text}" with title "${title}" sound name "Glass"'`;
  execCmd(cmd);
}


function consolePrompt(question, callback){
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(question, (answer) => {
    callback(answer);
    rl.close();
  });
}


function consoleRed(text){
  console.log('\x1b[31m', text);
}


function execCmd(cmd, isOutputToConsole){
  const options = { encoding: 'utf8' };
  if (isOutputToConsole) {
    options.stdio = 'inherit';
  }
  return execSync(cmd, options);
}


function uninstall(){
  execCmd(`launchctl unload ${launchdPlistPath}`, true);
  execCmd(`rm -rf ${launchdPlistPath}`, true);
  execCmd(`rm -rf ${binaryPath}`, true);
  execCmd(`rm -rf ${configDirectory}`, true);
}


function disconnectWifi(){
  execCmd('networksetup -setnetworkserviceenabled Wi-Fi off', true);
}


function putToSleep(){
  execCmd('pmset sleepnow', true);
}


function shouldTurnOffLaptop(config){
  return isLidOpen()
    && isConnectedToHomeWifi(config.HOME_WIFI_SSID)
    && isWorkHours(config.SELECTED_DAYS, config.START_AT, config.END_AT);
}
