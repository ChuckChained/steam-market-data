import fetch from "node-fetch";
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { items } from "./items.js"
import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express';
XLSX.set_fs(fs);

let API_KEY = process.env.API_KEY;

export async function steam(itemList) { 

	let workbook = XLSX.readFile("Steam-Market-Raw.xlsx", {cellStyles: true});

	for(let i = 0; i < itemList.length; i++) {

	const url = "https://api.steamapis.com/market/item/" + 730 + "/" + itemList[i] + "?api_key=" + API_KEY;
	const raw_data = await (await fetch(url)).json();
	const data = Object.values(raw_data);

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

	const name = raw_data.market_name;

//	let workbook = XLSX.readFile("Steam-Market-Raw.xlsx", {cellStyles: true});

	if (workbook['Sheets']['Raw Data'] == undefined) {
		console.log ("Sheet not found")
		console.log("Creating Sheet")

		let worksheet = XLSX.utils.json_to_sheet(flattened);

		worksheet["!cols"] = [  { wch: 10 }, { wch: 25 }, { wch: 11 }, { wch: 11 }, { wch: 20 }, { wch: 22 }, { wch: 21 } ];

		XLSX.utils.sheet_add_aoa(worksheet, [["Date", "Item Name", "Avg Price", "Volume Sold", "Current Quantity Listed", "Current Highest Buy Order", "Current Lowest Sell Order"]], { origin: "A1" });
		await XLSX.utils.book_append_sheet(workbook, worksheet, "Raw Data");

  		//XLSX.writeFile(workbook, "Steam-Market-Raw.xlsx", { compression: true }, {cellStyles: true});


	} else {
		console.log("Sheet Found")
		console.log("Adding to sheet")
		// Load sheet from workbook
		const worksheet = workbook['Sheets']['Raw Data'];

		console.log("Writing sample to sheet")
		//Add data to sheet
		await XLSX.utils.sheet_add_json(worksheet, flattened, { origin: -1, skipHeader: true})
		//XLSX.utils.book_append_sheet(workbook, worksheet, name);
		//XLSX.writeFile(workbook, "Steam-Market-Raw.xlsx", { compression: true });

		}
	}
  		XLSX.writeFile(workbook, "Steam-Market-Raw.xlsx", { compression: true }, {cellStyles: true});
}

//const game = 730; //CSGO APP ID on steam marketplace

// export function run(itemList) {
// 		console.log("Starting Data Pull")
// 		for(let i = 0; i < itemList.length; i++) {

// 			steam(itemList[i])

// 		}
// 		console.log("Completed Data Pull")
// }

//steam(items);