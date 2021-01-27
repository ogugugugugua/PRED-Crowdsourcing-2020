'use strict';

const fs = require('fs');
const readline = require('readline');
const program = require('commander');

var output_filename = "./data_converted.json";
var valid_time = new Date('2021-01-25');    //get rid of the older and useless records in the database

program
.option('-v, --valid_time [type]','Valid since this time')
.parse(process.argv);
if (program.valid_time) {
    valid_time = new Date(Date.parse(program.valid_time));
}

var mk = [];
var ctn = [];
var result = [];

var reg_mk = /^mk_./;
var reg_ctn = /^ctn_./;

function convert(file) {

    return new Promise((resolve, reject) => {
    
        const stream = fs.createReadStream(file);
        // Handle stream error (IE: file not found)
        stream.on('error', reject);
    
        const reader = readline.createInterface({
            input: stream
        });
    
        const array = [];
    
        reader.on('line', line => {
            array.push(JSON.parse(line));
        });
    
        reader.on('close', () => resolve(array));
    });
}

function Process(){
    convert('./data.json')
    .then(res => {
        // console.log(res);
        fs.writeFileSync(output_filename, JSON.stringify(res, null, 4));
    }).then(()=>{
        // console.log("data length: "+data.length);
        // var map_child_subject_id = new Map();
        // var map_subject_id = new Map();
        var data = JSON.parse(fs.readFileSync(output_filename));


        for(var i=0; i<data.length;i++){
            var updateTime = new Date(Date.parse(data[i]["updated_at"]["$date"]));
            if (updateTime>=valid_time) {
                // console.log("data[i][updated_at][$date]:"+data[i]["updated_at"]["$date"]+"\ttransformed:"+updateTime);
                // map_subject_id.set(data[i]["subject_id"]["$oid"], i);
                // console.log(data[i]["subject_id"]["$oid"]+"\t\t"+i);
                if (reg_mk.test(data[i]["task_key"])) {
                    // console.log("mk: "+data[i]["task_key"]+"\t\t"+i);
                    mk.push(data[i]);
                }else if(reg_ctn.test(data[i]["task_key"])){
                    // console.log("ctn: "+data[i]["task_key"]+"\t\t"+i);
                    ctn.push(data[i]);
                }
    
                // if(data[i]["child_subject_id"]!=null){
                //     map_child_subject_id.set(data[i]["child_subject_id"], i);
                // }
                // else{
                //     map_child_subject_id.set(i, 0);
                // }
            }
            
        }
        // console.log(mk.length);
        // console.log(ctn.length);
    
        // console.log("ctn length:"+ctn.length);
        for(var i = 0; i < ctn.length; i++){
            var cur = {};
            cur["mark"] = mk[i];
            cur["transcription"] = ctn[i];
            result.push(cur);
        }
        // console.log("result.length: "+result.length);
        // console.log(result);
        var data_formatted = "./data_formatted.json";
        fs.writeFileSync(data_formatted, JSON.stringify(result, null, 4));
        console.log("Data has been formatted into <data_formatted.json>");
        // map_subject_id.forEach(function(value, key) {
        //   console.log(key + " = " + value);
        // });
        // console.log("length: "+map_subject_id.size);
        // // console.log(map_child_subject_id.get(map_subject_id.get(data[0]["subject_id"])));
        // var concat = [];
        // var num = 0;
        // for(var i = 0; i < data.length; i++){
        //     if(data[i]["child_subject_id"] == null){
        //         concat.push(data[i]);
        //     }else{
        //         var child_i = map_subject_id.get(data[i]["child_subject_id"]["$oid"]);
        //         // console.log(child_i);
        //         num++;
        //     }
    
        // }
        // console.log(num);
    })
    .catch(err => console.error(err));
    // console.log("success");
}

Process();