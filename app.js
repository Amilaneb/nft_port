// app.js

const express = require("express")
const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");

  
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended : false }))
app.use(express.json())
  
// // Handling request 
function getNFT(body){    
    const data_body = JSON.stringify(body)

let url = 'https://api.nftport.xyz/v0/mints/easy/urls';

let options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'b8f48132-ed04-4a82-b23a-00eabc15c99e'
  },
  body: data_body
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));
}

app.post('/nft', (req, res) => {
  const body = req.body
  res.status(201).send(body)
  getNFT(body)
})
  
// Server Setup
app.listen(port, () => {
   console.log(`server is running at ${port}`);
});