import xlsx from 'xlsx'
import fs, { readFileSync } from 'fs'
import axios from "axios";

export function convertXlsxToJson(fileName, outputName = "output.json") {
  console.log("⚙️ Convertendo planilha para JSON...");

  const workbook = xlsx.readFile(fileName);

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = xlsx.utils.sheet_to_json(worksheet);

  fs.writeFileSync(outputName, JSON.stringify(jsonData, null, 2), {encoding:'utf8',flag:'w'});

  console.log("✅ Convertion success! JSON file saved as: " + outputName);
}

export async function testUrls(inputFilePath = "./output.json", outputFilePath = "./test_results.json") {
  console.log("⚙️ Testing started...");
  try {
    const data = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    const results = [];

    for (const item of data) {
      const url = item['404 Page URL'];

      try {
        console.log(`⚙️ Testing ${url}...`);
        const response = await axios.get(url);
        console.log(`✅ Status: ${response.status}`)

        results.push({
          'Status': 'Success',
          '404 Page URL': url,
          'Response Status': response.status,
          'Redirect URL': response.request.res.responseUrl || 'N/A',
        });
      } catch (error) {
        console.log(`❌ Status: ${error.response.status}`)
        results.push({
          'Status': 'Failed',
          '404 Page URL': url,
          'Error Message': error.message,
          'Redirect URL': item["301 Redirect Suggestions"]
        });
      }
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2), {encoding:'utf8',flag:'w'});
    console.log('✅ Testing success! Report saved as:', outputFilePath);
  } catch (error) {
    console.error('🚨🚧 Testing ERROR:', error.message);
  }
}

export function counter(filePath = "./test_results.json") {
  const data = fs.readFileSync(filePath)
  const jsonData = JSON.parse(data)

  let successCounter = 0;
  let failedCounter = 0;

  for (const item of jsonData) {
    if (item["Status"] == "Success") successCounter++
    else failedCounter++
  }

  return { successCounter, failedCounter }
}

export function writeRedirecter(sourceData = './test_results.json', outputPath = './new_settings.js') {
  const data = JSON.parse(readFileSync(sourceData, "utf8"))
  const newConfig = []
  
  try {
    
    for (const item of data) {
      if (item["Status"] == "Failed") {
        let sourceUrl = URL.parse(item["404 Page URL"])
        let destinationUrl = URL.parse(item["Redirect URL"])
        
        newConfig.push({
          source: sourceUrl ? sourceUrl.pathname : null,
          destination: destinationUrl ? destinationUrl.pathname : null,
          permanent: true
        })
      }
    }

    const jsContent = `${JSON.stringify(newConfig, null, 2).replace(/"(\w+)":/g, '$1:')};`;

    fs.writeFileSync(outputPath, jsContent, {encoding:'utf8',flag:'w'})
    console.log('New settings saved in ' + outputPath);
  } catch (error) {

    console.error(error.message);
  }
}