const express = require("express")
const fetch = require("node-fetch");
const fs = require("fs");


const app = express();
const port = 3000;
app.use(express.urlencoded({ extended : false }))
app.use(express.json())
const API_KEY = process.env.NFT_PORT_KEY


// // Handling request 
async function getNFT(body){
  const data_body = JSON.stringify(body)
  
  let url = 'https://api.nftport.xyz/v0/mints/easy/urls';
  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEY
    },
    body: data_body
  }
  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (err) {
   // handle error
    console.error(err);
  }
}


app.post('/nft', async (req, res) => {
  try{
  const body = req.body
  const nft = await getNFT(body)
  res.send(nft).status(200)
  res.end()
  }
  catch(e){
    res.end(e)
  }
})


app.get('/', (req, res) => {
  res.send('nft_generator');
});


// Server Setup
app.listen(port,'0.0.0.0', () => {
   console.log(`server is running at ${port}`);
});