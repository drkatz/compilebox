/*
        *File: app.js
        *Author: Asad Memon / Osman Ali Mian
        *Last Modified: 5th June 2014
        *Revised on: 30th June 2014 (Introduced Express-Brute for Bruteforce protection)
*/


const express = require('express');
const http = require('http');
const arr = require('./compilers');
const sandBox = require('./DockerSandbox');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);
const port = 8080;


const ExpressBrute = require('express-brute');
const store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
const bruteforce = new ExpressBrute(store, {
    freeRetries: 50,
    lifetime: 3600
});

app.use(express.static(__dirname));
app.use(bodyParser());

app.all('*', function(req, res, next) 
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

function random(size) {
    //returns a crypto-safe random
    return require("crypto").randomBytes(size).toString('hex');
}


app.post('/compile',bruteforce.prevent,function(req, res) 
{

    const language = req.body.language;
    const code = req.body.code;
    const stdin = req.body.stdin;

    const folder = 'temp/' + random(10); //folder in which the temporary folder will be saved
    const path = __dirname + "/"; //current working path
    const vm_name = 'virtual_machine'; //name of virtual machine that we want to execute
    const timeout_value = 20;//Timeout Value, In Seconds

    //details of this are present in DockerSandbox.js
    const sandboxType = new sandBox(timeout_value, path, folder, vm_name, arr.compilerArray[language][0], arr.compilerArray[language][1], code, arr.compilerArray[language][2], arr.compilerArray[language][3], arr.compilerArray[language][4], stdin);


    //data will contain the output of the compiled/interpreted code
    //the result maybe normal program output, list of error messages or a Timeout error
    sandboxType.run(function(data,exec_time,err)
    {
        //console.log("Data: received: "+ data)
    	res.send({output:data, langid: language,code:code, errors:err, time:exec_time});
    });
   
});


app.get('/', function(req, res) 
{
    res.sendfile("./index.html");
});

console.log("Listening at",port);
server.listen(port);
