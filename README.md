# Out Of Office Disabler for Mac

Prevents working from home (and occasionally procrastinating) by constantly disabling Wi-Fi and putting Mac to sleep if connected to home Wi-Fi during worktime.

![image](https://user-images.githubusercontent.com/1618344/69007195-8e61a480-0932-11ea-8c21-9874a399427e.png)


## Installation

Run this in your Terminal:
```
git clone https://github.com/egorvinogradov/ooo-disabler.git && cd ooo-disabler && export FROM_GIT=1 && ./install.sh
```
It will ask you a few questions to have you set up.

## Uninstalling

In the terminal, run:
```
ooo-disabler --uninstall
```

## Development

Make sure you have `node` and `npm` installed. Then:
```
npm install   # Install dependencies

npm start     # Run ooo-disabler once (without running it constantly by timeout as it happens after installation)

npm run build # Rebuild a binary after making changes in ooo-disabler.js
```
