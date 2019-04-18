const fs = require("fs")
const PDFParser = require("pdf2json")

const districts = [
  "灣仔區",
  "港島東區",
  "港島中西及南區",
  "九龍城區",
  "黃大仙區",
  "深水埗區",
  "油尖旺區",
  "觀塘區",
  "西貢區",
  "新界北區",
  "大埔區",
  "沙田區",
  "屯門區",
  "元朗區",
  "長洲 Cheung Chau",
  "大嶼山 Lantau Island",
  "南丫島 Lamma Island",
  "荃灣區",
  "葵青區"
]

function main() { 
  let pdfParser = new PDFParser();
  pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
  pdfParser.on("pdfParser_dataReady", pdfData => {
    let items = []
    pdfData.formImage.Pages.forEach((page, index) => {
      const pageItems = processText(page.Texts, index)
      if (pageItems.length === 0 ) {
        console.log(`Fuck up on page ${index}`)
        return
      }
      items = items.concat(pageItems)
    })
});
  pdfParser.loadPDF("./data/vet-clinic-20190227.pdf")
}

function processText(texts, pageNum) {
  let results = []
  let result = {}
  let district = ""
  let isDistrictRegExp = new RegExp(`(${districts.join("|")})`)
  for (const text of texts) {
    let {x} = text
    x = precise(x)
    const content = text.R.map((r) => decodeURIComponent(r.T)).join("")
    let currentColumn = 1
    switch (x) {
      case 3.011:
      case 3.018:
        const isDistrict = isDistrictRegExp.test(content)
        if (isDistrict) {
          district = content
        }
        if (Object.keys(result).length === 4)
          results.push(result)
        result = {
          "name": content,
          district
        }
        break
      case 15.73:
      case 15.96:
      case 16.43:
      case 17.59:
      case 18.06:
        result.address = content
        break
      case 39.57:
      case 40.45:
      case 40.83:
      case 40.96:
      case 41.05:
        result.contact = content
        break
      default:
        break
    }
      
    previousColumn = currentColumn
  }
  return results.slice(1)
}

function precise(x) {
  return Number(Number.parseFloat(x).toPrecision(4));
}

main()
