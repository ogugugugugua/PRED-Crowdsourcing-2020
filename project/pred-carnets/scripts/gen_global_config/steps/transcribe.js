"use strict";
const fs = require('fs');
const strFormat = require('./utils/utils');

module.exports = function(config,subjects){
     
    var json = config;
    var tasks = {};
    var eachTask = {};
    let helpFiles = [];

    // iterate on subjects
    for(var j = 0; j < subjects.length; j++){

      // iterate on subjects' categories
      for(var i = 0; i < subjects[j].categories.length; i ++){

        // transcribe step name
        var taskName = subjects[j].name + '_' + subjects[j].categories[i].name;
        
        let pickTasks = {};
        
        let helpObjTransc = {
          fileName: `pc_tr_${taskName}.md`,
          content: `#Comment transcrire un contenu de la catégorie *${subjects[j].categories[i].label}*\n<p>...</p>`
        };


        // transcribe task config
        let name = 'transcribe_'+taskName;
        var tool = {"tool": "compositeTool"};
        var generates_subjects = {"generates_subjects" : true};
        var instruction = {"instruction":subjects[j].categories[i].description};
        var temp = {};        
        var tool_config = {};
        

        // if subsubjects exist
        if(subjects[j].categories[i].structure){
          for(var k = 0; k < subjects[j].categories[i].structure.length; k++){
            
            // help file object
            let helpObjStruct = {
              fileName: `pc_struct_${taskName}.md`,
              content: `#${subjects[j].categories[i].structure[k].label}\n<p>${subjects[j].categories[i].structure[k].description}</p>`
            };

            // transcribe subtask object
            var toolName = 'tr_'+subjects[j].name + '_' + subjects[j].categories[i].name + '_' + subjects[j].categories[i].structure[k].name;
            var toolType = subjects[j].categories[i].structure[k].toolType;
            var toolLabel = subjects[j].categories[i].structure[k].label;
            var generates_subject_type = "transcribed_" + subjects[j].name + '_' + subjects[j].categories[i].name + '_' + subjects[j].categories[i].structure[k].name;
            let tmp_tool_config = {}

            // adding subtask and help file
            temp[toolName] = {"tool":toolType, "tool_config":tmp_tool_config, "label":toolLabel, "help":{file: helpObjStruct.fileName.split('.')[0]}, "generates_subject_type":generates_subject_type};
            helpFiles.push(helpObjStruct);
          } 
        }

        // main transcribe task
        temp['tr_'+name] = {"tool": "textAreaTool", "tool_config": {}, "label": "Contenu principal", "generates_subject_type": "transcribed_" + taskName + "_content"};

        // if there are tags to pick 
        if(subjects[j].categories[i].tags){
          for(let l = 0; l < subjects[j].categories[i].tags.length; l++){

            // tag picking subtask object
            let tagTask = subjects[j].categories[i].tags[l];
            tagTask['options'].push({label:"Non identifiable", value: "uknown"});
            let tagTaskName = 'picktag_'+taskName+'_'+tagTask.name;
            
            // help file
            let helpObjTag = {
              fileName: `pc_tag_${tagTaskName}.md`,
              content: `#${subjects[j].categories[i].tags[l].label}\n<p>${subjects[j].categories[i].tags[l].description}</p>`
            };
            
            let tt = {
              tool:tagTask['toolType'],
              label: strFormat(subjects[j].categories[i].tags[l].instruction,{subject: subjects[j].categories[i].label}),
              help:{file:helpObjTag.fileName.split('.')[0]},
              tool_config:{
              options : tagTask['options']
              }
            };

            temp[tagTaskName] = tt; 

            helpFiles.push(helpObjTag);
        } 
        }


        tool_config["tools"] = temp;

          eachTask[name] = {
            "tool": "compositeTool",
            "instruction": strFormat(config['instructions']['transcribe'],{subject: subjects[j].categories[i].label}),
            "generates_subjects" : true,
            "help": {file: helpObjTransc.fileName.split('.')[0]},
            "tool_config":tool_config
          };
          helpFiles.push(helpObjTransc);
      }  
      
    }
    
    json["tasks"] = eachTask;
    delete json['instructions'];

    // convert JSON object to string
    const data = JSON.stringify(json, null, 4);

    // write JSON string to a file
    fs.writeFileSync('output/transcribe.json', data);
    helpFiles.map((file) => fs.writeFileSync("./../../content/help/"+file.fileName, file.content));
    console.log("Transcribe config and help files generated!");
        
}
