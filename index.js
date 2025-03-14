import { convertXlsxToJson, counter, testUrls, writeRedirecter } from './functions.js';
import fs from 'fs';

async function main() {
  if (!fs.existsSync("./output.json")) {
    convertXlsxToJson("./planilha.xlsx")
  }

  await testUrls()

  const { successCounter, failedCounter } = counter()
  console.log(`Results: \n✅ ${successCounter} are being redirected \n❌ ${failedCounter} are NOT being redirected`);
  const newSettings = "./test_results.json"
  writeRedirecter(newSettings)
  
  console.log(`✅ New NextJS redirect settings were saved in ${newSettings} `);

}

await main()