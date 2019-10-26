#!/usr/bin/env node

import { COMMANDS_PATH } from '../config/constants';

const [, , ...args] = process.argv;

if (!args[0]) {
  console.error('You must specify command');
  process.exit(1);
}

(async function() {
  try {
    (await import(`${COMMANDS_PATH}${args[0]}.command.js`)).default(args[1]);
  } catch (err) {
    console.log(err);
    console.error('Unknown command');
  }
})();
