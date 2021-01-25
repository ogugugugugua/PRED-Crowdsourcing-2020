"use strict";
const fs = require('fs');
const strFormat = require('./utils/utils');
const _ = require('lodash');
const randomColor = require('randomcolor');

module.exports = function (config, subjects) {
    let helpFiles = [];
    let subjectColorsTab = randomColor({count:subjects.length, luminosity:'dark'});

    let markTasks = _.reduce(subjects, (acc, subject, idx, tab) => {

        let pickKey = "pk_" + subject.name;
        let markKey = "mk_" + subject.name;
        let nextPickKey = (idx < tab.length - 1 ? "pk_" + tab[idx + 1].name : null);

        let helpObjSubjPick = {
            fileName : `pc_${pickKey}.md`,
            content : `#${subject.label}\n<p>${subject.description}</p>`
        };

        let helpObjSubjMark = {
            fileName : `pc_${markKey}.md`,
            content : `#Comment marquer un contenu de type *${subject.label}*\n<p>${subject.description}</p>`
        }

        /* Génération de la tâche pick associée au sujet*/
        acc[pickKey] = {
            instruction: strFormat(config.instructions.pick, { subject: subject.label, color: subjectColorsTab[idx] }),
            tool: "pickOne",
            help: { file: helpObjSubjPick.fileName.split('.')[0]},
            tool_config: {
                "displays_transcribe_button": false,
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
            instruction: strFormat(config.instructions.mark, { subject: subject.label,color: subjectColorsTab[idx] }),
            tool: "pickOneMarkOne",
            generates_subjects: true,
            tool_config: {},
            help: {file: helpObjSubjMark.fileName.split('.')[0]},
            next_task: nextPickKey
        };

        // tool config ici
        let catColorsTab = randomColor({count: subject.categories.length});
        acc[markKey]['tool_config']['options'] = _.reduce(subject.categories, (acc2, cat, idx2) => {
            let helpObjCat = {
                fileName :`pc_cat_${subject.name}_${cat.name}.md`,
                content: `#${cat.label}\n<p>${cat.description}</p>\n`
            };
        acc[markKey]['tool_config']["displays_transcribe_button"] = false;
            let newMarkTasks = {
                        type: "rectangleTool",
                        label: cat.label,
                        color: catColorsTab[idx2],
                        generates_subject_type: `${subject.name}_${cat.name}`,
                        help: {file: helpObjCat.fileName.split('.')[0]}
                };
            helpFiles.push(helpObjCat);
            return [...acc2, newMarkTasks];
        },[]);   
        helpFiles.push(helpObjSubjPick);
        helpFiles.push(helpObjSubjMark);

        return acc;

    },{});


    // le fichier de config global
    let markConfig = _.clone(config);
    delete markConfig['instructions'];
    
    // generate help file
    let temp = { tasks : markTasks };

    let markCfg = Object.assign(markConfig,temp);

    fs.writeFileSync('./output/'+config.name+'.json', JSON.stringify(markCfg,null,2));
    helpFiles.forEach((file) => fs.writeFileSync('./../../content/help/'+file.fileName, file.content));
    console.log("Mark config and help files generated!");

}
