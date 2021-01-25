"use strict";
const fs = require('fs');
const strFormat = require('./utils/utils');
const _ = require('lodash');

module.exports = function (config, subjects) {
  
  let verifyConfig = _.clone(config);
  let verifyTasks = {};
  let helpFiles = [];

  for(let i = 0; i < subjects.length; i++){
    for(let j = 0; j < subjects[i].categories.length; j++){
      let suppElts = subjects[i].categories[j].structure;
      

        let name = `${subjects[i].name}_${subjects[i].categories[j].name}`;
        let helpObjCont = {
          fileName : 'pc_vf_'+name+'.md',
          content: `#Comment vérifier le contenu principal de la catégorie *${subjects[i].categories[j].label} ?\n<p>...</p>`
        };

        verifyTasks[`transcribed_${name}_content`] = {
          instruction: config.instructions,
          tool: "verifyTool",
          tool_config: {
            "displays_transcribe_button": true
          },
          help: { "file": helpObjCont.fileName.split('.')[0] },
          generates_subject_type: "consensus_" + name + "_content"
        };
        helpFiles.push(helpObjCont);

      for (let k = 0; k < subjects[i].categories[j].structure.length; k++){
        if (!subjects[i].categories[j].structure[k].toVerify === false) continue;
        let speName = subjects[i].name + '_' + subjects[i].categories[j].name + '_' + subjects[i].categories[j].structure[k].name;

        let helpObjStruct = {
          fileName : 'pc_vf_'+speName+'.md',
          content: `#Comment vérifier la transcription du sous-contenu *${subjects[i].categories[j].structure[k].label} ?\n<p>...</p>`
        };
        verifyTasks["transcribed_" + speName] = {
            instruction: config.instructions['verify'],
            tool: "verifyTool",
            tool_config: {
              "displays_transcribe_button": true
            },
            help:{file:helpObjStruct.fileName.split('.')[0]},
            generates_subject_type: "consensus_" + speName
          };
          helpFiles.push(helpObjStruct);
      }
    }
  }
    
  delete verifyConfig['instructions'];

  let globalVerifyConfig = Object.assign(
    verifyConfig,
    {
      tasks : verifyTasks
    })

  fs.writeFileSync('./output/'+config.name+'.json', JSON.stringify(globalVerifyConfig,null,2));
  helpFiles.forEach((file) => fs.writeFileSync('./../../content/help/'+file.fileName, file.content));

  console.log("Verify config and help files generated");
}