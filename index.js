import * as cron from 'node-cron';
import { items } from "./items.js";
import { run } from "./run-script.js";

console.log("Schedule Started")

cron.schedule('*/12 * * * *', function() {
  console.log('Running a task every 12 hours');
  console.log('Running a task every 5 minutes');

  run(items)
});