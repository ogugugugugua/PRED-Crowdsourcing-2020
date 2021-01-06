/*
    1) récupérer la config globale
    2) générer les tâches
        2.1) iterate over subjects + categories
            2.1.1) créer le tool (si supp_element>0 alors composite)
            2.1.2) générer les attributs nécessaires (instructions, examples, help{title,body}, generate_subject ...)
            2.1.3) si composite => crée toolConfig => iterate over supp_element et peuplé tools (idem que précédemment pour générer que les attributs)       

*/
const fs = require('fs');


/*
Cas composite tool
"XXXXX": {
      "tool": "compositeTool",
      "instruction": "",
      "generates_subjects": true,
      "tool_config": {
        "tools": {
          "XXXXXX_content": {
            "tool": "textAreaTool",
            "tool_config": {},
            "label": "XXXX",
            "generates_subject_type": "transcribed_XXXX"
          },
          "XXXXX":{
            "tool": "XXXX",
            "tool_config": {},
            "label": "XXXX",
            "generates_subject_type": "transcribed_XXXX"
          }
        }
      }
    }

*/

module.exports = function(config,subjects){
    console.log("Transcribe config generated!");
     
    var json = config;
    var tasks = {};
    var eachTask = {};

    for(var j = 0; j < subjects.length; j++){

      for(var i = 0; i < subjects[j].categories.length; i ++){
        var name = subjects[j].name + '_' + subjects[j].categories[i].name;
        var tool = {"tool": "compositeTool"};
        var generates_subjects = {"generates_subjects" : true};
        var instruction = {"instruction":subjects[j].categories[i].description};
        
        var temp = {};
        temp['tr_'+name] = {"tool": "textAreaTool", "tool_config": {}, "label": subjects[j].categories[i].label, "generates_subject_type": "transcribed_"+name};
        var tool_config = {};
        
        for(var k = 0; k < subjects[j].categories[i].supp_elements.length; k++){
          var toolName = 'tr_'+subjects[j].name + '_' + subjects[j].categories[i].name + '_' + subjects[j].categories[i].supp_elements[k].name;
          var toolType = subjects[j].categories[i].supp_elements[k].toolType;
          var toolLabel = subjects[j].categories[i].supp_elements[k].label;
          var generates_subject_type = "transcribed_" + toolName;

          temp[toolName] = {"tool":toolType, "tool_config":{}, "label":toolLabel, "generates_subject_type":generates_subject_type};
        }
        tool_config["tools"] = temp;

        if(typeof(subjects[j].categories[i].description)=="undefined"){
          eachTask[name] = {"tool": "compositeTool", "instruction": "", "generates_subjects" : true, "tool_config":tool_config};
        }else{
          eachTask[name] = {"tool": "compositeTool", "instruction": subjects[j].categories[i].description, "generates_subjects" : true, "tool_config":tool_config};
        }
      }  
      
    }
    
    json["tasks"] = eachTask;

    // convert JSON object to string
    const data = JSON.stringify(json, null, 4);

    // write JSON string to a file
    fs.writeFile('output/test_transcribe.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
    
}
