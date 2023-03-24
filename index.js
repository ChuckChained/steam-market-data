import * as cron from 'node-cron';
import { items } from "./items.js";
import { run } from "./run-script.js";

cron.schedule('0 0,12 * * *', function() {
  console.log('Running a task every 12 hours');
  run(items)
});