const fs = require('fs');
const { strFormat } = require('./utils/utils');
const _ = require('lodash');

module.exports = function (config, subjects) {
  
  let verifyConfig = _.clone(config);
  let verifyTasks = {};

  for(let i = 0; i < subjects.length; i++){
    for(let j = 0; j < subjects[i].categories.length; j++){
      let suppElts = subjects[i].categories[j].supp_elements;
      let name = `tr_${subjects[i].name}_${subjects[i].categories[j].name}`
      verifyTasks[`transcribed_${name}`] = {
        instruction: config.instructions,
        tool: "verifyTool",
        tool_config: {
          "displays_transcribe_button": true
        },
        help: { "file": "" },
        generates_subject_type: "consensus_" + name
      }

      for (let k = 0; k < subjects[i].categories[j].supp_elements.length; k++){
        if (!subjects[i].categories[j].supp_elements[k].toVerify) continue;
        let speName = name + '_' + subjects[i].categories[j].supp_elements[k]
        verifyTasks[`transcribed_${speName}`] = {
            instruction: config.instructions,
            tool: "verifyTool",
            tool_config: {
              "displays_transcribe_button": true
            },
            help: { "file": "" },
            generates_subject_type: "consensus_" + speName
          }
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

  console.log("Verify config file generated");
}