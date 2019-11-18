#!/bin/bash

pkg ooo-disabler.js --output binary/ooo-disabler --target node10-macos-x64
cd binary
chmod +x ooo-disabler
zip -r ooo-disabler.zip ooo-disabler
rm ooo-disabler
cd ..
