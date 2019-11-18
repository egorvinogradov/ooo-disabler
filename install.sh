#!/bin/bash

config_path=$HOME/.ooo-disabler
binary_path=/usr/local/bin
launchd_plist_path=$HOME/Library/LaunchAgents/

printf "\nInstalling ooo-disabler..."

current_wifi_ssid=$(
  /System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I | awk -F: '/ SSID/{print $2}' | xargs
)

HOME_WIFI_SSID=$(
  osascript -e 'display dialog "What is you home Wi-Fi SSID?" with title "(1/4) Enter home Wi-Fi name" default answer "'"$current_wifi_ssid"'"' | \
  sed 's/button returned:OK, text returned://g'
)


SELECTED_DAYS=$(
  osascript -e 'choose from list {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"} with title "(2/4) Select workdays" with prompt "These are the days when ooo-disabler would run" default items {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"} with multiple selections allowed'
)


START_AT=$(
  osascript -e 'display dialog "When would you like to start the block on workdays (24h format)?" with title "(3/4) Block start" default answer "9:00"' | \
  sed 's/button returned:OK, text returned://g'
)

END_AT=$(
  osascript -e 'display dialog "When would you like to end the block on workdays (24h format)?" with title "(4/4) Block end" default answer "18:00"' | \
  sed 's/button returned:OK, text returned://g'
)

printf "\nGenerating config..."

mkdir -p $config_path

echo HOME_WIFI_SSID=$HOME_WIFI_SSID > $config_path/.config
echo SELECTED_DAYS=$SELECTED_DAYS   >> $config_path/.config
echo START_AT=$START_AT             >> $config_path/.config
echo END_AT=$END_AT                 >> $config_path/.config

printf "\nPreparing binary...\n"

unzip binary/ooo-disabler.zip -d binary
mv binary/ooo-disabler $binary_path

cp ooo-disabler.plist $launchd_plist_path
launchctl load $launchd_plist_path/ooo-disabler.plist

if [ "$FROM_GIT" -eq "1" ]; then
   printf "\nRemoving downloaded repository...\n"
   cd ..
   rm -rf ooo-disabler
fi

tput setaf 2
printf "\nooo-disabler has been successfully installed!\n"
