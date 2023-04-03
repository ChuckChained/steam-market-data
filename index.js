import * as cron from 'node-cron';
import { items } from "./items.js";
import { steam } from "./run-script-lighter.js";

console.log("Schedule Started")

cron.schedule('* * */2 * *', function() {
//  console.log('Running a task every 12 hours');
  console.log('Running a task every 12 hours');

  steam(items)
});