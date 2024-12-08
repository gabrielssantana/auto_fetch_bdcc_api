import moment from "moment";
import fs from "node:fs";
import readline from "node:readline";

const main = async () => {
  console.log("Hello Mr. Garden, are you ready for this script?");
  const dateFormated = moment().format("yyyy-MM-DD_HH:mm:ss");
  const fileName = `${dateFormated}.result.txt`;
  const file = fs.createWriteStream(fileName);
  const fileLines = await readLinesAsync();
  let i = 0;
  for (let cpf of fileLines) {
    ++i;
    file.write(`Line ${i} --- Fetching BDCC for CPF: ${cpf}\n`);
    const { success, data } = await fetchBDCCByCPF({ cpf });
    if (!success) {
      file.write(
        `\nResult:\n${JSON.stringify(
          data,
          Object.getOwnPropertyNames(data),
          2
        )}\n\n`
      );
      continue;
    }

    file.write(`\nResult:\n${JSON.stringify(data, null, 2)}\n\n`);
  }
  console.log(`Hey man, take a look in "./${fileName}"`);
};

const readLinesAsync = async () => {
  try {
    const fileStream = fs.createReadStream(process.env.CPF_FILE_PATH);
    const linesInteface = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    const lines = [];
    for await (const line of linesInteface) {
      lines.push(line);
    }
    return lines;
  } catch (error) {
    console.log(error);
  }
};

const fetchBDCCByCPF = async ({ cpf = "" }) => {
  try {
    const url = process.env.DBCC_BASE_URL.endsWith("/")
      ? `${process.env.DBCC_BASE_URL.substring(
          0,
          process.env.DBCC_BASE_URL.length - 1
        )}?CPF=${cpf}`
      : `${process.env.DBCC_BASE_URL}?CPF=${cpf}`;
    const data = await (await fetch(url, { method: "GET" })).json();
    return { success: true, data };
  } catch (error) {
    return { success: false, data: error };
  }
};

await main();
