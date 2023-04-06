let axios = require("axios");
const headers = require("./headers");
// // var cron = require("node-cron");
// // const fs = require("fs");
// // const { keys } = require("./keys");
// // const sgMail = require("@sendgrid/mail");
// // require("dotenv").config();
const https = require("https");
// // let emailOverride = true; // manually disable email sender
// // let usingEmailService = !!keys.sg && emailOverride;
// // if (usingEmailService) {
// //   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// // }

// // let foundParts = [];
// // let lookingForParts = fetchPiecesToLookFor();


// function fetchData() {
//   axios.defaults.headers.common = {
//     'accept': "application/json",
//     "X-CSRFToken":
//       "TyTJwjuEC7VV7mOqZ622haRaaUr0x0Ng4nrwSRFKQs7vdoBcJlK9qjAS69ghzhFu",
//     'Authorization': "Token {82af78c50f344c3615a406803c22430c314dc7df}",
//     // "x-api-key": "82af78c50f344c3615a406803c22430c314dc7df",
//   };
//   //https://services.slingshot.lego.com/api/v4/lego_historic_product_read/_search
//   // /api/v4/lego_historic_product_read/_search
//   // https://bricksandpieces.services.lego.com/api/v1/bricks/product/${LegoObject.setNumber} //OLD URL
//   // https://bricksandpieces.cs.services.lego.com/api/v1/bricks/product/60374?country=US&orderType=missing
//   axios
//     .get(
//       `https://api.quiverquant.com/beta/live/congresstrading`,
//       //   `https://bricksandpieces.cs.services.lego.com/api/v1/bricks/product/${LegoObject.setNumber}`,

//       // `https://services.slingshot.lego.com/api/v4/lego_historic_product_read/_search`,
//       {
//         // params: {
//         //   country: "US",
//         //   orderType: "missing",
//         // },
//       }
//     )
//     .then((res) => {
//       //   console.log(res.statusText);
//     //   if (res.statusText == "OK") {
//     //     // handleLegoResponse(res.data, LegoObject, showAll, allPieces);
//     //   } else {
//     //     // console.log(
//     //     //   `\x1b[90m${LegoObject.setNumber} inventory not available. (${res.statusText})\x1b[0m`
//     //     // );
//     //   }
//     });
// }
// fetchData();

function generateHeader() {
    return headers.heads[Math.round(Math.random() * (headers.heads.length - 1))];
  }
let key = "82af78c50f344c3615a406803c22430c314dc7df";
async function doSearch() {
//   return new Promise((resolve, reject) => {
    try {
      const options = {
        host: `api.quiverquant.com`,
        path: `beta/live/housetrading`,
        headers: {
        // "User-Agent": generateHeader(),
          'accept': "application/json",
          'X-CSRFToken': "TyTJwjuEC7VV7mOqZ622haRaaUr0x0Ng4nrwSRFKQs7vdoBcJlK9qjAS69ghzhFu",
        //   'Authorization': "token": {key}
        // 'Authorization': 'token 82af78c50f344c3615a406803c22430c314dc7df'
          'Authorization': `Token {${key}}`,
        },
      };

      https
        .get(
          options,
          (resp) => {
            // console.log(resp);
            console.log(resp.statusCode);
            let data = "";
            resp.on("data", (chunk) => {
              data += chunk;
            });
            resp.on("end", () => {
              if (data === "") {
                throw "empty string";
              }
            //   console.log(data)

            });
          }
        )
        .on("error", (err) => {
          console.log(err);
          reject("Error: " + err.message);
        });
    } catch (err) {
      console.log("oops", err);
      reject("Somethings Wrong...");
    }
//   });
}
// doSearch();
let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://api.quiverquant.com/beta/bulk/congresstrading',
    headers: { 
      'accept': 'application/json', 
      'X-CSRFToken': 'TyTJwjuEC7VV7mOqZ622haRaaUr0x0Ng4nrwSRFKQs7vdoBcJlK9qjAS69ghzhFu', 
      'Authorization': 'Token 82af78c50f344c3615a406803c22430c314dc7df'
    }
  };
  
  axios.request(config)
  .then((response) => {
    let reps = []
    // let repObj =[]
    // console.log(JSON.stringify(response.data));
    // console.log(response.key)
    // for (var key in response){
    //     console.log( key + ": " + response[key]);
    // }
    // console.log(response.data[response.data.length - 1])
    // console.log(response.data.length)
    console.log(response.data)
    let topCount = 0;
    let biggestBoi = null
    console.log(response.data.length)
    for (let set of response.data){
        // console.log(set)
        // if(set.Amount > 500002 && set.Transaction == 'Purchase'){
        //     console.log(set)
        // }
        // if (!reps.includes(set.Representative.trim())){
        //     reps.push(set.Representative.trim())
        // }
        var rep = reps.find(item => item.name == set.Representative.trim());
        if(rep == undefined){
            reps.push({
                name: set.Representative.trim(),
                purchases: set.Transaction == 'Purchase' ? 1 : 0,
                sales: set.Transaction == 'Sale' ? 1 : 0,
                other: set.Transaction != 'Sale' || set.Transaction != 'Purchase' ? 1 : 0,
                transactions: [{
                    ticker: set.Ticker,
                    type: set.Transaction,
                    amount: set.Range,
                    date: set.TransactionDate
                }]
            })
        }else{
            if(set.Transaction == 'Sale'){
                rep.sales++;
            }else if(set.Transaction == 'Purchase'){
                rep.purchases++;
            }else{
                rep.other++;
            }
            rep.transactions.push({
                ticker: set.Ticker,
                type: set.Transaction,
                amount: set.Range,
                date: set.Date
            })
            if(rep.purchases > topCount){
                topCount = rep.purchases;
                biggestBoi = rep;
            }
        }
        
        // console.log(reps)
        // console.log(rep)
    }
    // console.log(reps)
    console.log(reps.length)
    // console.log(biggestBoi)
  })
  .catch((error) => {
    console.log(error);
  });
  