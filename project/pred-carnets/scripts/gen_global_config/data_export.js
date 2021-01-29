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


/** DATA STRUCTURE EXPLAINATION
**   mk : map( data[i][subject_id][$oid]_i, {"mk":data[i], "transcription_list":[1st,2nd,3rd]})
**   ctn: map( data[i][subject_id][$oid], data[i])
**/
var mk = new Map();                //array to store the mark content
var ctn = new Map();        //map to store the transcription content
var result = [];            //final result

var reg_mk = /^mk_./;       //regular expression to judge if a record belongs to the mark stage
var reg_ctn = /^ctn_./;     //regular expression to judge if a record belongs to the transcription stage


function convert(file) {
    return new Promise((resolve, reject) => {
    
        const stream = fs.createReadStream(file);
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


//check if the previous record has the same zone as the present one
//return the previous subject_id if found, -1 if not
function hasSameZone(mk, data, position){
    for (var item of mk.entries()) {
        if (item[1]["mk"]["subject_id"]["$oid"] == data[position]["subject_id"]["$oid"]) {//check if they have the same subject_id, will pass directly without diving in the next if
            if (item[1]["mk"]["annotation"]["x"] == data[position]["annotation"]["x"]
                && item[1]["mk"]["annotation"]["y"] == data[position]["annotation"]["y"]){//check if the zone is identical 
                return item[0];//return the previous subject_id for reference purpose
            }           
        }
    }
    return -1;
}

function Process(){
    convert('./data.json')
    .then(res => {
        fs.writeFileSync(output_filename, JSON.stringify(res, null, 4));    //save intermediate result
    }).then(()=>{

        var data = JSON.parse(fs.readFileSync(output_filename));

        for(var i=0; i<data.length;i++){   //data filtering
            var updateTime = new Date(Date.parse(data[i]["updated_at"]["$date"]));//get the update time in case we have abnormal records in the database

            if (updateTime>=valid_time) {

                if (reg_mk.test(data[i]["task_key"])) {                     //get mark task
                    
                    var same_zone_id = hasSameZone(mk, data, i);
                    if (same_zone_id != -1) {//has previous subject with the same zone
                        var temp = mk.get(same_zone_id);   //get the previous one
                        temp["transcription_list"].push(data[i]["child_subject_id"]["$oid"]);//put the actual child_subject_id into the transcription list
                        mk.set(same_zone_id, temp);//update the information in the Map
                    }

                    else{//do not have previous subject with the same zone, will add directly the actual record into the Map
                        var temp = {"mk":data[i], "transcription_list":[data[i]["child_subject_id"]["$oid"]]};//create new structure
                        mk.set(data[i]["subject_id"]["$oid"]+"_"+i, temp);  //IMPORTANT! add "_i" to avoid the same subject with different zone
                    }
                }

                else if(reg_ctn.test(data[i]["task_key"])){                //get transcription task
                    ctn.set(data[i]["subject_id"]["$oid"], data[i]);        //store it in a Map with its subject_id and itself
                }
            }
        }

        for (var value of mk.values()) {    //data reconstruction
            var cur = {};                   //tuple to store the current mark and its corresponding transcriptions
            cur["mark"] = value["mk"];      //add directly the mark since there will only be one
            var transcription = [];         //array to hold all the transcriptions
            for(var i = 0; i < value["transcription_list"].length; i++){
                transcription.push(ctn.get(value["transcription_list"][i]));//get the transcriptions by referencing the subject_id
            }
            cur["transcription"] = transcription;
            result.push(cur);               //remember to update the result
        }   

        var data_formatted = "./data_formatted.json";       
        fs.writeFileSync(data_formatted, JSON.stringify(result, null, 4));  //write the final result into a json file
        console.log("Data has been formatted into <data_formatted.json>");
    })
    .catch(err => console.error(err));
}

Process();