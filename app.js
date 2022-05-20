// app.js

const express = require("express")
const fetch = require("node-fetch");
const fs = require("fs");
const { json } = require("express");
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

async function deployContractAndMint(address, name, desc, file_url){

  const body_data = {
    "name": name,
    "description": desc,
    "file_url": file_url
  }

  try{
  const ipfs_data = await postRequests(body_data, 'https://api.nftport.xyz/v0/metadata')
  console.log(ipfs_data)
  }
  catch(e)
  {
    console.log(e)
  }
  const body_mint = {
      "chain": "rinkeby",
      "contract_address": '0xcd9eaf45916f142aaa628e70a2c5eb3fea9353ce',
      "metadata_uri": ipfs_data.metadata_uri,
      "mint_to_address": address
  }
    
  try{
    const minted_custom = await postRequests(body_mint, 'https://api.nftport.xyz/v0/mints/customizable')
    console.log(minted_custom)
    return minted_custom
  }catch(e){
    console.log(e)
  }

  
}

async function getMintedNFTs(address){
  let url = 'https://api.nftport.xyz/v0/accounts/'+address+'?chain=rinkeby';
  console.log(url)

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
  const body = {
    "chain": "rinkeby",
    "name": req.body.name,
    "description": req.body.description,
    "file_url": req.body.file_url,
    "mint_to_address": req.body.mint_to_address
  }
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
      body.description,
      body.file_url
      )
    const ipfs_data = await postRequests(data_to_store,'https://api.nftport.xyz/v0/metadata')
    console.log(ipfs_data)
    res.send(nft).status(200)
    res.end()
    }
    catch(e){
      res.end(e)
    }
})

app.get('/minted', async (req, res) =>{
  try{
    console.log(req.query)
    const nft = await getMintedNFTs(req.query.address)
    res.send(nft).status(200)
    res.end()
    }
    catch(e){
      res.status(500)
      res.end(e)
    }
})

app.post('/transfer', async (req, res) =>{
  try{
    const body = req.body
    const nft = await postRequests(body, 'https://api.nftport.xyz/v0/mints/transfers')
    res.send(nft)
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