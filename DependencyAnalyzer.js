const fs = require("fs");
const csvtojson = require("csvtojson");

/**
 * Validate argument filename
 *
 * @param {*} filename
 */
function validate(filenamefilename) {
  if (!filename) {
    throw new Error(
      "The file name to be analyzed must be specified. E.g. node DependenciesAnalizer website.cvs"
    );
  }
}

/**
 * Load file csv into json object
 * 
 * @param filename
 * 
 * @returns jsonArray
 */
async function loadFileWebsites(filename) {
  const jsonArray = await csvtojson({
    noheader: true,
    headers: ["name", "uri"]
  }).fromFile("./" + filename, "utf8");
  return jsonArray;
}


/**
 * Dependency Analizer
 */
async function main() {
  const FILE_WEBSITES_NAME = process.argv[2];
  validate(FILE_WEBSITES_NAME);
  const websites = await loadFileWebsites(FILE_WEBSITES_NAME);

}

main();
