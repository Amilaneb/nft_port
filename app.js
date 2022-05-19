// app.js

const express = require("express")
const fetch = require("node-fetch");
const fs = require("fs");
require('dotenv').config()


const app = express();
const port = 3000;
app.use(express.urlencoded({ extended : false }))
app.use(express.json())
const API_KEY = process.env.NFT_PORT_KEY
const OWNER_ADRESS = process.env.OWNER_ADRESS
  
// // Handling request 
async function postRequests(body, url){
  const data_body = JSON.stringify(body)

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

async function deployContractAndMint(address, name, symbol,desc, file_url){
  const body_contract = JSON.stringify({
    "chain": "rinkeby",
    "name": name,
    "symbol": symbol,
    "owner_address": OWNER_ADRESS,
    "metadata_updatable": false,
    "type": "erc721"
  })
  
  const body_data = JSON.stringify({
    "name": name,
    "description": desc,
    "file_url": file_url
  })  

  const response = await postRequests(body_contract, 'https://api.nftport.xyz/v0/contracts')
  const ipfs_data = await postRequests(body_data, 'https://api.nftport.xyz/v0/metadata')
  
  const body_mint = JSON.stringify({
    "chain": "rinkeby",
    "contract_address": OWNER_ADRESS,
    "metadata_uri": ipfs_data.metadata_uri,
    "mint_to_address": address
  })

  const minted_custom = await postRequests(body_mint, 'https://api.nftport.xyz/v0/mints/customizable')
  return minted_custom
}


async function getMintedNFTs(){
  let url = 'https://api.nftport.xyz/v0/me/mints';

let options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: API_KEY
  }
};

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
  console.log(body)
  const nft = await postRequests(body,'https://api.nftport.xyz/v0/mints/easy/urls')
  res.send(nft)
  res.end()
  }
  catch(e){
    res.end(e)
  }
})

app.post('/mint', async (req, res)=>{
  try{
    const body = req.body
    const nft = await deployContractAndMint(
      body.address,
      body.name,
      body.symbol,
      body.description,
      body.file_url,
      'https://api.nftport.xyz/v0/mints/easy/urls')
    res.send(nft)
    res.end()
    }
    catch(e){
      res.end(e)
    }
})

app.get('/minted', async (req, res) =>{
  try{
    const nft = await getMintedNFTs()
    res.send(nft).status(200)
    res.end()
    }
    catch(e){
      res.end(e)
    }
})

app.post('/transfer', async (req, res) =>{
  try{
    const body = req.body
    const nft = await postRequests(body, 'https://api.nftport.xyz/v0/mints/transfers')
    res.send(nft).status(200)
    res.end()
    }
    catch(e){
      res.end(e)
    }
})

// Server Setup
app.listen(port,'0.0.0.0', () => {
   console.log(`server is running at ${port}`);
});