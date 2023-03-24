import * as cron from 'node-cron';
import { items } from "./items.js"

cron.schedule('* * * * 2', function() {
  console.log('running a task every 2 minutes');
});