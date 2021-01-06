"use strict";
const fs = require('fs');
const strFormat = require('./utils/utils');
const _ = require('lodash');
const randomColor = require('randomcolor');

module.exports = function (config, subjects) {
    let markTasks = _.reduce(subjects, (acc, subject, idx, tab) => {

        let pickKey = "pick_" + subject.name;
        let markKey = "mark_" + subject.name;
        let nextPickKey = (idx < tab.length - 1 ? "pick_" + tab[idx + 1].name : null);

        /* Génération de la tâche pick associée au sujet*/
        acc[pickKey] = {
            instruction: config.instructions.pick ? strFormat(config.instructions.pick, { subject: subject.label }) : "",
            tool: "pickOne",
            help: { file: `pc_${pickKey}.md`},
            tool_config: {
                options: [
                    {
                        value: "yes",
                        label: "Oui",
                        next_task: markKey
                    },
                    {
                        value: "no",
                        label: "Non"
                    }
                ]
            },
            "next_task": nextPickKey
        };

    /* Génération de la tâche mark associée au sujet*/
        acc[markKey] = {
            instruction: config.instructions.pick ? strFormat(config.instructions.mark, { subject: subject.label }) : "",
            tool: "pickOneMarkOne",
            instruction: "",
            generates_subjects: true,
            tool_config: {},
            help: {file: `pc_${markKey}.md`},
            "next_task": nextPickKey
        };
    
        // tool config ici
        let colorsTab = randomColor({count: subject.categories.length});
        acc[markKey]['tool_config']['options'] = _.reduce(subject.categories, (acc2, cat, idx2) => {
            let newMarkTasks = {
                        type: "rectangleTool",
                        label: cat.label,
                        color: colorsTab[idx2],
                        generates_subject_type: `${subject.name}_${cat.name}`,
                        help: {
                            title:"Marquer un contenu de type " + (cat.description || "Nope"),
                            body: cat.description || ""
                    }
                }
            return [...acc2, newMarkTasks];
        },[]);   

        return acc;

    },{});


    // le fichier de config global
    let markConfig = _.clone(config);
    delete markConfig['instructions'];
    
    // generate help file
    let temp = { tasks : markTasks };
    console.log(markConfig);
    let markCfg = Object.assign(markConfig,temp);

    fs.writeFileSync('./output/'+config.name+'.json', JSON.stringify(markCfg,null,2));
    console.log("Mark config generated!");

}
