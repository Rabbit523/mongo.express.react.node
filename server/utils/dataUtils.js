const axios = require("axios");
const Symbol = require('../model/symbol'); // Import Symbol Model
const Ticker = require('../model/ticker'); // Import Ticker Model
const API_URL = "https://api.polygon.io/v2/aggs/ticker/";
const API_KEY = "AKGYAR3MFJ6ELH6UZUV7";

const insertData = async (symbol, item, ticker) => {
  if ((symbol || {})._id) {
    return null;
  } else {
    let symbol = new Symbol();
    symbol.ticker = ticker;
    symbol.time_t = item.t;
    symbol.time_o = item.o;
    try {
      return await symbol.save();
    } catch (err) {
      return null;
    }
  }
}

async function captureData(req) {
  try {
    const endpoint = req.endpoint;
    const res = await axios.get(`${API_URL}${endpoint}?apiKey=${API_KEY}`);
    const { data } = res || {};
    const results = (data || {}).results || [];
    // find object in the db and save it if it's not existed
    let promises = results.map(item => {
      return Symbol.findOne({ ticker: data.ticker, time_t: item.t }).exec();
    });
    const searchResults = await Promise.all(promises);
    
    promises = searchResults.map((symbol, i) => {
      return insertData(symbol, results[i], data.ticker);
    });
    let saveResults = await Promise.all(promises);
    saveResults = saveResults.filter(item => item !== null);
    return { success: true, data: saveResults };
  } catch (err) {
    console.error(err);
    return { success: false, data: err };
  }
}

async function getData(req) {
  try {
    const symbols = req.symbols;
    const increases = req.increments;
    const dates = req.dates;

    const filters = [];
    symbols.forEach(symbol => {
      Object.values(dates).forEach(_date => {
        let date = new Date(_date.toString());
        filters.push({ symbol, date });
      })
    })
    
    let promises = filters.map(filter => {
      return Symbol.findOne({ ticker: filter.symbol, time_t: filter.date }).exec();
    });
    let searchResults = await Promise.all(promises);
    
    let results = [];
    symbols.forEach(symbol => {
      let result = {};
      searchResults.forEach(item => {
        if (item == null) {
          result.symbol = symbol;
        } else if (item.ticker == symbol) {
          result.symbol = item.ticker;
          Object.keys(dates).forEach(key => {
            let date = new Date(dates[key]);
            if (item.time_t.toString() === date.toString()) {
              result[key] = item.time_o;
            }
          })
        }
      });
      Object.values(increases).forEach((sel, key) => {
        let first_index = 'time_o_' + sel.split('-')[0];
        let second_index = 'time_o_' + sel.split('-')[1];
        if (result[first_index] && result[second_index]) {
          let index= key + 1;
          let increase_key = 'increase' + index;
          let percent = result[second_index] > result[first_index] ? ( result[second_index] - result[first_index] ) / result[first_index] * 100 : ( result[first_index] - result[second_index] ) / result[first_index] * 100 ;
          result[increase_key] = result[second_index] > result[first_index] ? `-${percent.toFixed(2)}` : `+${percent.toFixed(2)}`;
        }
      });
      results.push(result);
    });
    return { success: true, data: results };
  } catch(err) {
    console.error(err);
    return { success: false, data: err };
  }
}

const insertTicker = async (ticker) => {
  if ((ticker || {})._id) {
    return null;
  } else {
    let _ticker = new Ticker();
    _ticker.ticker = ticker;
    try {
      return await _ticker.save();
    } catch (err) {
      return null;
    }
  }
}

async function saveSymbols(req) {
  try {
    const symbols = req.data;
    let promises = symbols.map(item => {
      return Ticker.findOne({ ticker: item }).exec();
    });
    let searchResults = await Promise.all(promises);
    searchResults = searchResults.filter(item => item !== null);
    
    let filters = [];
    symbols.forEach(ticker => {
      if(!searchResults.some(item => item.ticker == ticker)) {
        filters.push(ticker);
      }
    })
    
    promises = filters.map(ticker => {
      return insertTicker(ticker);
    });
    let saveResults = await Promise.all(promises);
    return { success: true, data:  saveResults };
  } catch(err) {
    console.error(err);
    return { success: false, data: err };
  }
}

module.exports = {
  captureData,
  getData,
  saveSymbols
};
