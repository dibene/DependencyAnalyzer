const fs = require("fs").promises;
const csvtojson = require("csvtojson");
const $ = require("cheerio");
var rp = require("request-promise");

/**
 * @param filename
 */
function validate(filename) {
  if (!filename) {
    throw new Error(
      "The file name to be analyzed must be specified. E.g. node DependenciesAnalizer website.cvs"
    );
  }
}

/**
 * @param filename
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
 * @param html
 * @returns dependencies
 */
function extractDependencies(html) {
  const dependencies = [];
  $("script", html).each((i, script) => {
    const src = script.attribs.src;
    if (src) {
      const dependency = src.slice(src.lastIndexOf("/") + 1);
      dependencies.push(dependency);
    }
  });
  return dependencies;
}

const isUriAbsolute = uri =>
  uri.indexOf("http://") === 0 || uri.indexOf("https://") === 0;

async function getHtmlWebsites({ name, uri }) {
  let html = "";
  try {
    html = isUriAbsolute(uri) ? await rp(uri) : await fs.readFile(uri, "utf8");
  } catch (error) {
    console.log(`cant process the website: ${name} url:${uri}`, error.message);
  }
  return html;
}

const getBytes = html => Buffer.byteLength(html, "utf8");

function processAndShowLength(websites) {
  console.log("\n1- Length\n");
  websites.forEach(website =>
    console.log(`${website.name} -> ${website.htmlLength} bytes`)
  );
}

function processAndShowDependencies(websites) {
  console.log("\n\n2.1- Dependencies\n");
  websites.forEach(website =>
    website.dependencies.forEach(dependency =>
      console.log(`${website.name} -> ${dependency} `)
    )
  );
}

function processAndShowFrecuencies(websites) {
  console.log("\n\n2.2- Dependencies frequency\n");
  const counter = websites.reduce((counterDependencies, website) => {
    website.dependencies.forEach(
      dependency =>
        (counterDependencies[dependency] =
          (counterDependencies[dependency] || 0) + 1)
    );
    return counterDependencies;
  }, []);
  for (const [dependency, value] of Object.entries(counter)) {
    console.log(dependency, value);
  }
}

/**
 * Dependency Analizer
 */
async function main() {
  const FILE_WEBSITES_NAME = process.argv[2];
  validate(FILE_WEBSITES_NAME);
  console.log("Dependency Analizer\nLoading...");
  let websites = await loadFileWebsites(FILE_WEBSITES_NAME);
  websites = websites.map(async website => {
    const html = await getHtmlWebsites(website);
    const dependencies = extractDependencies(html);
    const length = getBytes(html);
    return {
      ...website,
      dependencies: dependencies,
      htmlLength: length
    };
  });
  websites = await Promise.all(websites);
  processAndShowLength(websites);
  processAndShowDependencies(websites);
  processAndShowFrecuencies(websites);
}

main();
