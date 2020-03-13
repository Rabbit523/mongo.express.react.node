import axios from "axios";

export async function uploadData(params) {
  var response = await axios.post('/api/capture', params);
  return response.data;
}

export async function fetchData(params) {
  var response = await axios.post('/api/load', params);
  return response.data;
}

export async function uploadSymbol(params) {
  var response = await axios.post('/api/save/symbols', params);
  return response.data;
}