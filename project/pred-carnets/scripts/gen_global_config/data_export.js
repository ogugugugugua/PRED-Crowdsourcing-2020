'use strict';

const fs = require('fs');
const readline = require('readline');
// const program = require('commander');

var output_filename = "./data_converted.json";
var valid_time = new Date('2021-01-24');    //get rid of the older and useless records in the database

// program
// .option('-v, --valid_time [type]','Valid since this time')
// .parse(process.argv);
// if (program.valid_time) {
//     valid_time = new Date(Date.parse(program.valid_time));
// }

var mk = [];                //array to store the mark content
var ctn = new Map();        //map to store the transcription content
var result = [];            //final result

var reg_mk = /^mk_./;       //regular expression to judge if a record belongs to the mark stage
var reg_ctn = /^ctn_./;     //regular expression to judge if a record belongs to the transcription stage

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
        fs.writeFileSync(output_filename, JSON.stringify(res, null, 4));    //save intermediate result
    }).then(()=>{

        var data = JSON.parse(fs.readFileSync(output_filename));
        for(var i=0; i<data.length;i++){
            var updateTime = new Date(Date.parse(data[i]["updated_at"]["$date"])); 
            if (updateTime>=valid_time) {
                if (reg_mk.test(data[i]["task_key"])) {                     //get mark task and store it
                    // console.log("mk: "+data[i]["task_key"]+"\t\t"+i);
                    mk.push(data[i]);
                }else if(reg_ctn.test(data[i]["task_key"])){                //get transcription task
                    // console.log("ctn: "+data[i]["task_key"]+"\t\t"+i);
                    ctn.set(data[i]["subject_id"]["$oid"], data[i]);        //store it in a Map with its subject_id and itself
                }
            }
        }

        for(var i = 0; i < mk.length; i++){                                 //iterate through the mk array
            var cur = {};
            cur["mark"] = mk[i];                                            //put the mark into the new tuple
            var child_subject_id = mk[i]["child_subject_id"]["$oid"];       //get its corresponding transcription subject_id
            cur["transcription"] = ctn.get(child_subject_id);               //get the corresponding transcription
            if(cur["transcription"]!=null){
                result.push(cur);                                           //push the tuple into the result if the transcription is not null
            }
        }
        var data_formatted = "./data_formatted.json";       
        fs.writeFileSync(data_formatted, JSON.stringify(result, null, 4));  //write the final result into a json file
        console.log("Data has been formatted into <data_formatted.json>");
    })
    .catch(err => console.error(err));
}

Process();