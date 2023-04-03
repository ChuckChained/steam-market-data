import * as XLSX from 'xlsx';
import * as fs from 'fs';
import express from 'express';
XLSX.set_fs(fs);




const unsortedData = XLSX.readFile("Steam-Market-Raw1.xlsx", {cellStyles: true})


async function CheckWriteFile() {
	try {
    await fs.promises.access("test2.xlsx")
    return true 
    } catch {
    return false
  }
}

// async function Log(result) {
// 	try {
//     if (result == true) {
//     console.log("File Found")
// 	} else { throw "error"}
//     } catch {
//     console.log("File not found")
//     return false
//   }

// 	// if (result == true) {
// 	// 	console.log("File Exists")
// 	// } else { console.log("File does not exist")
// 	// }
// }

// function FailureCallback() {
// 	console.log("failed")
// }
async function CreateOutFile() {
	console.log("Creating File")
		// Create File
	let workbook = XLSX.utils.book_new();
	// Create Blank Array
	let array = [[], []];

	let rawWorksheet = XLSX.utils.aoa_to_sheet(array, { origin: "A1" });
	rawWorksheet["!cols"] = [  { wch: 10 }, { wch: 25 }, { wch: 11 }, { wch: 11 }, { wch: 20 }, { wch: 22 }, { wch: 21 } ];
	let alreadyAddedWorksheet = XLSX.utils.aoa_to_sheet(array, { origin: "A1" });
	XLSX.utils.sheet_add_aoa(alreadyAddedWorksheet, [["Date", "Item Name", "Avg Price", "Volume Sold", "Current Quantity Listed", "Current Highest Buy Order", "Current Lowest Sell Order"]], { origin: "A1" });

	alreadyAddedWorksheet["!cols"] = [  { wch: 10 }, { wch: 25 }, { wch: 11 }, { wch: 11 }, { wch: 20 }, { wch: 22 }, { wch: 21 } ];

	await XLSX.utils.book_append_sheet(workbook, rawWorksheet, "Raw Data");
	await XLSX.utils.book_append_sheet(workbook, alreadyAddedWorksheet, "All Data");

	XLSX.writeFileXLSX(workbook, "test2.xlsx");

}

async function PullAndAddToRaw() {
	let workbook = XLSX.readFile("Steam-Market-Raw1.xlsx", {cellStyles: true});
	let worksheet = workbook["Sheets"]["Raw Data"]
	let newbook = XLSX.readFile("test2.xlsx", {cellStyles: true});


		// Scan all data for duplicates, loop through, add to array of objects then write all to raw sheet

	let alldatasheet = newbook["Sheets"]["All Data"];
	let alldatasheetrange = XLSX.utils.decode_range(alldatasheet['!ref']);
	let alldatanum_rows = alldatasheetrange.e.r - alldatasheetrange.s.r + 1;

	let rawsheetrange = XLSX.utils.decode_range(worksheet['!ref']);
	let rawsheetnum_rows = rawsheetrange.e.r - rawsheetrange.s.r + 1;
	console.log("raw rows = " + rawsheetnum_rows)

	// Track how many rows have been added and be sure to scan them too.
	let addcounter = 0; 
for (let j = 2; j < rawsheetnum_rows + 1; j++) {

			// Check if item has the same name
			let itemcheck = worksheet["B"+j].v;
			let checkingrow = worksheet["A"+j].v;
			// console.log(checkingrow+" "+itemcheck)

		for (let i = 2; i < alldatanum_rows + addcounter + 2; i++) {


			console.log("Row " + i)
			// Check if sample timestamp is already listed
			console.log("all sheet num rows = "+alldatanum_rows)
			console.log("Looking for "+checkingrow+" "+itemcheck + " / Raw row "+j)
			console.log(alldatasheet["A"+i].v + " " + alldatasheet["B"+i].v)
			if (itemcheck == alldatasheet["B"+i].v && checkingrow == alldatasheet["A"+i].v) {
			console.log("Found a duplicate");
			console.log("Incrementing J")
						break
			} else if (i == alldatanum_rows + addcounter) {
				console.log("New data, writing row")

				let rowtoadd = [{
					intdate: worksheet["A"+j],
					name: worksheet["B"+j],
					price: worksheet["C"+j],
					volume: worksheet["D"+j],
					current_quantity: worksheet["E"+j],
					current_highest_buy_order: worksheet["F"+j],
					current_lowest_sell_order: worksheet["G"+j]
				}]
				
				await XLSX.utils.sheet_add_json(newbook["Sheets"]["Raw Data"], rowtoadd, { origin: -1, skipHeader: true})
				await XLSX.utils.sheet_add_json(alldatasheet, rowtoadd, { origin: -1, skipHeader: true})

				addcounter++;
				
				break
			} else {
				console.log("Looping")
				
			}

		}

	}

	// 	if (newbook["Sheets"]["Raw Data"] == undefined) {	
	// 		// 
	// 		await XLSX.utils.book_append_sheet(newbook, worksheet, "Raw Data");
	// } else {

	// 		let oldrawsheet = unsortedData["Sheets"]["Raw Data"]
	// 		let newrawsheet = newbook["Sheets"]["Raw Data"];
	// 		// let alldatasheet = newbook["Sheets"]["All Data"];
			
	// 		let oldrawrange = XLSX.utils.decode_range(oldrawsheet['!ref'])
			
	// 		let oldrawnum_rows = oldrawrange.e.r - oldrawrange.s.r + 1

			

////////////////////////////////////////////////////////////////////////////////////////////////////////// Start

			// // If there's only 1 row on the new raw sheet, just overwrite the sheet
			// if (newrawsheet['!ref'] == undefined) {
			// 	console.log("New raw sheet is empty")
			// } else if (XLSX.utils.decode_range(newrawsheet['!ref']).e.r - XLSX.utils.decode_range(newrawsheet['!ref']).s.r + 1 == 1) {	
			// 	// OR if there is one row (the header) pull data without checking for duplicates.
			// 	console.log("New raw sheet only has a header. Adding new data.");
			// 	let pulled = await XLSX.utils.sheet_to_json(oldrawsheet, {header: 1}, {cellStyles: true})
			// 	await XLSX.utils.sheet_add_json(newrawsheet, pulled, { skipheader: true })
			// } else { // OR if there's more than 1 row, loop through and check for duplicates before adding each row
				
			// 	/////////////// SCAP THIS. Change to loop through the "all data" sheet and check for duplicates before adding to raw. Sort from raw in another function.
				
			// 	let newrawrange = XLSX.utils.decode_range(newrawsheet['!ref'])
			// 	let newrawnum_rows = newrawrange.e.r - newrawrange.s.r + 1

			// 	console.log("New raw already has "+newrawnum_rows+" row(s) of data. Checking for duplicates and adding.")
			// 	console.log("Old raw sheet number of rows " + oldrawnum_rows)
			// 	// for (let i = 0; i < newbook["Sheets"][Ra]; i++) {
			// 	// 	if () {

					
			// 	}
			
		
//////////////////////////////////////////////////////////////////////////// END
		


// OVERWRITE RAW SHEET


	
	XLSX.writeFileXLSX(newbook, "test2.xlsx");
	console.log("Completed PullAndAddToRaw")

}

async function ProcessRaw() {

}

async function SortData() {

// Check if file exists
	// CheckWriteFile()
		// .then(
		// 	(result) => Log(result)
		// 	)
		// .catch(FailureCallback)

	if (await CheckWriteFile() == true) {
		console.log("Found file in SortData")
		// APPEND SHEET
		PullAndAddToRaw()

	} else {
		console.log("No file found in SortData")
		// CREATE SHEET
		CreateOutFile()
	}




// // } else {
	
// //	const sortedData = XLSX.readFile("Steam-Market-Sorted.xlsx")
// 	const rawDataSheet = unsortedData['Sheets']['Raw Data']
// //	console.log(rawDataSheet)
// 	let range = XLSX.utils.decode_range(rawDataSheet['!ref'])
// 	let num_rows = range.e.r - range.s.r + 1
// 	// Find all rows with item x 
// 		const itemName = rawDataSheet['B2'].v //.replace(':', '');

// 	// Add all rows to an array of objects
// 	let toAddArray = []
// 		for (let i = 3; i < num_rows; i++) {
// 			let findCell = rawDataSheet['B'+ i].v
			
// 			if (findCell == itemName) {
// 				// pull row here and add to array
// 				const flattened = [
// 		{	

// 			integerDate: rawDataSheet['A'+ i],
// 			name: rawDataSheet['B'+ i],
// 			price: rawDataSheet['C'+ i],
// 			volume: rawDataSheet['D'+ i],
// 			current_quantity: rawDataSheet['E'+ i],
// 			current_highest_buy_order: rawDataSheet['F'+ i],
// 			current_lowest_sell_order: rawDataSheet['G'+ i]

// 			  } ]
// 				toAddArray.push(flattened)
// 				console.log("Found match")
// 			} else {
// 				console.log("Scanning Again")
// 			}

// 		}
	
// 	console.log(toAddArray)
// 	// Check if sheet with name x exists
// 		// Add to sheet
// 		// OR
// 		// Convert array to sheet
// 		// Append Sheet
// 		let worksheet = XLSX.utils.json_to_sheet(toAddArray)
// 		// Save to file
// //		await XLSX.utils.book_append_sheet(sortedData, worksheet, formattedName);
// 		XLSX.writeFileXLSX(unsortedData, "test.xlsx");
// 	//	const sortedData = XLSX.writeFile(workbook, "Steam-Market-Sorted.xlsx")

} 

await SortData()