import fetch from "node-fetch";
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { items } from "./items.js"
import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express';
XLSX.set_fs(fs);

let API_KEY = process.env.API_KEY;

async function steam(appID, marketHash, apiKey, callback) { 
	const url = "https://api.steamapis.com/market/item/" + appID + "/" + marketHash + "?api_key=" + apiKey; // https://api.steamapis.com/market/item/730/Operation%20Breakout%20Weapon%20Case?api_key=KaqwIWdwvJGYZFojCf78qh36CfU
	const raw_data = await (await fetch(url)).json();
	const data = Object.values(raw_data);
	const container = Object.values(raw_data).filter(row => row.sell_order_summary);
	const rows = container.map(row => ({
		price: row.sell_order_summary.price,
		quantity: row.sell_order_summary.quantity,
		last_day_average: row.median_avg_prices_15days
	}));
	const raw_mapped = data.map(row => ({
		average: row
	}));

	const flattened = [
		{	

			integerDate: new Date(),
			name: data[2],
			price: data[9][14][1],
			volume: data[9][14][2],
			current_quantity: data[10]['sell_order_summary']['quantity'],

			current_highest_buy_order: data[10]['highest_buy_order'],
			current_lowest_sell_order: data[10]['lowest_sell_order']

			  }
	]

	console.log(flattened);
	const date = flattened[1];
	const price = rows[0].price;
	const quantity = rows[0].quantity;
	const avg = raw_mapped[9].average[14]; // test[9] is the average price array in the object. average[14] displays the most recent price over the last 15 days
	const previous_day_price = avg[1];
	const previous_day_volume = avg[2];
	const name = raw_data.market_name;

	console.log(url);

	let workbook = XLSX.readFile("Steam-Market.xlsx", {cellStyles: true});
	const readSheet = XLSX.utils.sheet_to_json("Steam-Market.xlsx")
	const sheetName = Object.values(XLSX.readFile("Steam-Market.xlsx", { bookSheets: name }))

	for(let i = 0; i < sheetName[0].length; i++) {
		
		if (

			// Check if sheet already exists and add to it

			sheetName[0][i] == name.replace(':', '')
		
		) {
			console.log('Sheet Exists');

				// Load sheet from workbook
				const worksheet = workbook['Sheets'][name];
				// Assign last date from sheet 
					// Find highest row
				let range = XLSX.utils.decode_range(worksheet['!ref'])
				let num_rows = range.e.r - range.s.r + 1
				console.log("Number of rows = " + num_rows)
				let yesterday = worksheet["A" + num_rows].v
				console.log(yesterday)
				// convert integerDate to excel decimal
				let dateObject = flattened[0]['integerDate'];
				let converted = 25569.0 + ((dateObject.getTime() - (dateObject.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
				console.log(converted)
				// Check if the sample is newer
				if (yesterday + 0.000001 < converted) {

				console.log("Writing sample to sheet")
				//Add data to sheet
				await XLSX.utils.sheet_add_json(worksheet, flattened, { origin: -1, skipHeader: true})
				//XLSX.utils.book_append_sheet(workbook, worksheet, name);
				XLSX.writeFile(workbook, "Steam-Market.xlsx", { compression: true });
			} else { console.log("Sample already logged for today")}
			break;
	} else if (i == sheetName[0].length - 1) 

			// If sheet doesn't exist then create 

		{
			console.log("Sheet Doesn't Exist")

		let worksheet = XLSX.utils.json_to_sheet(flattened);

		worksheet["!cols"] = [  { wch: 10 }, { wch: 25 }, { wch: 11 }, { wch: 11 }, { wch: 20 }, { wch: 22 }, { wch: 21 } ];

		XLSX.utils.sheet_add_aoa(worksheet, [["Date", "Item Name", "Avg Price", "Volume Sold", "Current Quantity Listed", "Current Highest Buy Order", "Current Lowest Sell Order"]], { origin: "A1" });
		await XLSX.utils.book_append_sheet(workbook, worksheet, name.replace(':', ''));

  		console.log(workbook['Sheets'][name])

  		XLSX.writeFile(workbook, "Steam-Market.xlsx", { compression: true }, {cellStyles: true});

		}

		else 

			console.log("Checking list." + " Checked " + [i + 1])

	}

	callback(date, name, price, quantity, avg, previous_day_price, previous_day_volume);

	}

function writer(date, name, price, quantity, avg, previous_day_price, previous_day_volume) {
	console.log("Name: " + name);
	console.log("Current Price: " + price);
	console.log("Listed Quantity: " + quantity);
	console.log("Yesterday's avg price: " + previous_day_price);
	console.log("Yesterday's volume: " + previous_day_volume);
};

const game = 730; //CSGO APP ID on steam marketplace

export function run(itemList) {
		console.log("Starting Data Pull")
		for(let i = 0; i < itemList.length; i++) {

			steam(game, itemList[i], API_KEY, writer)

		}
		console.log("Completed Data Pull")
}

//run(items);
