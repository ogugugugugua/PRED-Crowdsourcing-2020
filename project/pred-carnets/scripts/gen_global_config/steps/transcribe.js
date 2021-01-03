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
}