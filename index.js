const request = require('request');
const cheerio = require('cheerio');

const fs = require('fs');
var json2xls = require('json2xls');


const SITE_MAIN_URL = 'https://www.turkiyedoktorlari.com';
const TOP_PAGE = 2;
const CITY_NAME = 'Antalya';
const filename = `${CITY_NAME}.xlsx`;
let doctorDetails = []

const timer = ms => new Promise(res => {
    setTimeout(res, ms)
})


async function getPage(){
    for(let i = 1; i <= TOP_PAGE; i++){
        request(`${SITE_MAIN_URL}/iller_${CITY_NAME}_${i}`, (error, response, html) => {
            if(!error && response.statusCode == 200) {
                const $ = cheerio.load(html);
        
                for (let i = 0; i < $('#messages > .row').length; i++) {
                    let doctor = $(`#messages > div:nth-child(${i + 1}) > div > div > div > div.col-md-10.col-sm-10.col-xs-12 > div.popular-listing-detail > h3 > a`).attr('href')
                    getDoctorDetail(doctor)
                }
            } else {
                console.error(error)
            }
        })
        console.log("Page: " + i)
        await timer(5000)
    }
}



function getDoctorDetail(doctorUrl) {
    request(`${SITE_MAIN_URL}/${doctorUrl}`, (error, response, html) => {
        if(!error && response.statusCode == 200) {
            const $ = cheerio.load(html);

            let doctorName = $(`#listing-details > div > div:nth-child(4) > div.col-md-9 > div > h2`).text()
            let title = $(`#listing-details > div > div:nth-child(4) > div.col-md-9 > div > h4`).text()
            let address = $(`#listing-details > div > div:nth-child(4) > div.col-md-9 > div > div.details-heading-address > p`).text()
            let phone = $(`#listing-details > div > div:nth-child(4) > div.col-md-9 > div > div.details-heading-address > ul:nth-child(2) > li:nth-child(1) > a`).text()
            let mobile = $(`#listing-details > div > div:nth-child(4) > div.col-md-9 > div > div.details-heading-address > ul:nth-child(2) > li:nth-child(2) > a`).text()
            let mail = $(`#listing-details > div > div:nth-child(4) > div.col-md-9 > div > div.details-heading-address > ul:nth-child(3) > li:nth-child(1) > a`).text()
            let website = $(`#listing-details > div > div:nth-child(4) > div.col-md-9 > div > div.details-heading-address > ul:nth-child(3) > li:nth-child(2) > a`).text()
                
            doctorDetails.push({
                doctorName,
                title,
                address,
                phone,
                mobile,
                mail,
                website
            })
        } else {
            console.error(error)
        }
        console.log(doctorDetails.length)
    })
}
getPage().finally(() => {
console.log("bitti")
convert()
})




function convert() {
    var xls = json2xls(doctorDetails);
    fs.writeFileSync(filename, xls, 'binary', (err) => {
       if (err) {
             console.log("writeFileSync :", err);
        }
      console.log( filename + " file is saved!");
   });
  }