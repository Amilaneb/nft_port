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

  const body_mint = {
    "chain": "rinkeby",
    "contract_address": '0xcd9eaf45916f142aaa628e70a2c5eb3fea9353ce',
    "metadata_uri": ipfs_data.metadata_uri,
    "mint_to_address": address
  }
  const minted_custom = await postRequests(body_mint, 'https://api.nftport.xyz/v0/mints/customizable')
  console.log(minted_custom)
  return minted_custom

  }catch(e){
    console.log(e)
  }

  
}

async function getRequests(url, paramss){
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

async function getToken(hash){
  const token = await getRequests('https://api.nftport.xyz/v0/mints/'+hash+'?chain=rinkeby')
  return token
}

async function transfer(body){

  const getToken = await getRequests('https://api.nftport.xyz/v0/mints/'+body.hash+'?chain=rinkeby')
  console.log(getToken)
    
  const body_transfer = {
    "chain":"rinkeby",
    "contract_address":"0xcd9eaf45916f142aaa628e70a2c5eb3fea9353ce",
    "token_id": getToken.token_id,
    "transfer_to_address": getToken.address
  }

  const transaction = await postRequests(body_transfer, 'https://api.nftport.xyz/v0/mints/transfers')
  
  return transaction
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
    const result = await deployContractAndMint(
      body.address,
      body.name,
      body.description,
      body.file_url
      )
      // const getToken = await getRequests('https://api.nftport.xyz/v0/mints/'+result.transaction_hash+'?chain=rinkeby')
      // console.log(getToken)
      const nft = {
        "token_id":getToken.token_id,
        "transaction_hash":result.transaction_hash,
        "contract_address":result.contract_address
      }
    res.send(nft).status(200)
    res.end()
    }
    catch(e){
      res.end(e)
    }
})

app.get('/token', async(req,res)=>{
  try{
    const hash = {
      "hash":req.query.hash
    }
    console.log(req.query.hash)
    const token = await getToken(hash.hash)
    console.log(token)
    const token_id = {
      "token_id":token.token_id
    }
    res.send(token_id).status(200)
    res.end()
  }catch(e){
    console.log(e)
  }
})

app.get('/minted', async (req, res) =>{
  try{
    console.log(req.query)
    const nft = await getRequests('https://api.nftport.xyz/v0/accounts/'+req.query.address+'?chain=rinkeby')
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
    console.log(req.body)
    const body = {
      "hash": req.body.hash,
      "address": req.body.address       
    }
    const nft = await transfer(body)
    console.log(nft)
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