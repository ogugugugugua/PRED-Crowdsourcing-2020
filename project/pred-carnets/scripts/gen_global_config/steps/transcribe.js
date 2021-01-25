"use strict";
const fs = require('fs');
const strFormat = require('./utils/utils');

module.exports = function(config,subjects){
     
    var json = config;
    var tasks = {};
    var eachTask = {};
    let helpFiles = [];

    // on itère sur les subjects
    for(var j = 0; j < subjects.length; j++){

      // on itère sur les catégories de subjects
      for(var i = 0; i < subjects[j].categories.length; i ++){

        var entryTaskName = subjects[j].name + '_' + subjects[j].categories[i].name;
        let pickTasks = {};
        let helpObjTransc = {
          fileName: `pc_tr_${entryTaskName}.md`,
          content: `#Comment transcrire un contenu de la catégorie *${subjects[j].categories[i].label}*\n<p>...</p>`
        };


        let name = Object.keys(pickTasks).length === 0 ? entryTaskName : 'transcribe_'+entryTaskName;
        var tool = {"tool": "compositeTool"};
        var generates_subjects = {"generates_subjects" : true};
        var instruction = {"instruction":subjects[j].categories[i].description};
        var temp = {};        
        var tool_config = {};
        
        if(subjects[j].categories[i].structure){
        // on crée les tâches pour la structure proposée
        for(var k = 0; k < subjects[j].categories[i].structure.length; k++){
            
          let helpObjStruct = {
            fileName: `pc_struct_${entryTaskName}.md`,
            content: `#${subjects[j].categories[i].structure[k].label}\n<p>${subjects[j].categories[i].structure[k].description}</p>`
          };

          var toolName = 'tr_'+subjects[j].name + '_' + subjects[j].categories[i].name + '_' + subjects[j].categories[i].structure[k].name;
          var toolType = subjects[j].categories[i].structure[k].toolType;
          var toolLabel = subjects[j].categories[i].structure[k].label;
          var generates_subject_type = "transcribed_" + subjects[j].name + '_' + subjects[j].categories[i].name + '_' + subjects[j].categories[i].structure[k].name;
          let tmp_tool_config = {}

          temp[toolName] = {"tool":toolType, "tool_config":tmp_tool_config, "label":toolLabel, "help":{file: helpObjStruct.fileName.split('.')[0]}, "generates_subject_type":generates_subject_type};
          helpFiles.push(helpObjStruct);
        } 
        }
        // on crée la tâche de transcription principale
        temp['tr_'+name] = {"tool": "textAreaTool", "tool_config": {}, "label": "Contenu principal", "generates_subject_type": "transcribed_" + entryTaskName + "_content"};

        if(subjects[j].categories[i].tags){
        // on crée les tâches de choix de tags si elles existent
          for(let l = 0; l < subjects[j].categories[i].tags.length; l++){
            let tagTask = subjects[j].categories[i].tags[l];
            let tagTaskName = 'picktag_'+entryTaskName+'_'+tagTask.name;
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
