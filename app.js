const express = require("express");
const redis = require("redis");
const axios = require("axios");
const { promisify } = require("util");


const app = express();

const client = redis.createClient();


const GET_ASYNC = promisify(client.get).bind(client); // convert callbacks based apis to promise based
const SET_ASYNC = promisify(client.set).bind(client);

app.get('/users', async (req, res) => {
    try {
        const reply = await GET_ASYNC("users");        
        if (reply) {
          console.log("using cached data");
          res.send(JSON.parse(reply));
          return
        }
        const respone = await axios.get("https://apple-seeds.herokuapp.com/api/users/");
        await SET_ASYNC(
          "users",
          JSON.stringify(respone.data),
          "EX",
          15
        );
        console.log("new data cachedd");
        res.send(respone.data);
      } catch (error) {
        res.send(error.message);
      }
    });
app.listen(5000, console.log("running!"));
