// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
const https = require('https');
const http = require('http');
const functions = require('firebase-functions');

const host = 'www.alphavantage.co';
const wwoApiKey = 'b4066bf0c8f14a189db121229180706';
var prices = [];

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((req, res) => {
  // Get the city and date from the request
  let stock = req.body.queryResult.parameters['stock'];// city is a required param
 
  console.log('Stock: ' + stock);
  // Get the date for the weather forecast (if present)
  let date = '';
  if (req.body.queryResult.parameters['date-time']) {
    date = req.body.queryResult.parameters['date-time'];
    console.log('Date: ' + date);
  }

  // Call the stock API
  callStockApi(stock, date).then((output) => {
    res.json({ 'fulfillmentText': output }); // Return the results of the weather API to Dialogflow
  }).catch(() => {
    res.json({ 'fulfillmentText': `I am not sure, I hope it's goodd!` });
  });
});

function callStockApi (stock, date) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
   // let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
   //   '&q=' + city + '&key=' + wwoApiKey + '&date=' + date;
   
    let path = '/query?function=TIME_SERIES_DAILY&symbol=' + stock + '&apikey=HO4OJ5V0WA5EUVE3';
    
    // let path = '/query?function=TIME_SERIES_DAILY&symbol=AMZN&apikey=HO4OJ5V0WA5EUVE3';

    console.log('API Request: ' + host + path);

    // Make the HTTP request to get the weather
    https.get({host: host, path: path}, (res) => {
      let body = ''; // var to store the response chunks
      console.log(res.statusCode); // 200
      res.pipe(process.stdout); 
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        console.log('Response2: ' + body);
        let response = JSON.stringify(body);
        let sym = "";
        
        JSON.parse(response, (key, value) => {
         //console.log("Got a response: ", key);
		 //console.log("Got a response: ", value);
		JSON.parse(value, (key, value1) => {
          
			// console.log("Got a response2a: ", key);
          //console.log("Got a response2b: ", value1);
          if (key == '2. Symbol')
		 	sym = value1;
          
          if (key == '4. close') {
            //console.log("Got close price: ", value1);
            prices.push(value1);
          }
            
          
		}); 
     });  

      let output = sym + " is trading at " + prices[0];
       console.log(output);
        resolve(output);
       
      });
      res.on('error', (error) => {
        console.log(`Error calling the weather API: ${error}`)
        reject();
      });
    });
  });
}
