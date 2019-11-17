#!/bin/bash

pkg ooo-disabler.js --output binary/ooo-disabler --target node10-macos-x64
chmod +x binary/ooo-disabler
zip binary/ooo-disabler.zip binary/ooo-disabler
rm binary/ooo-disabler
