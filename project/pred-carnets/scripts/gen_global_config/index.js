/*
    2/ construire la config de chaque step 
        2.1/ Mark 
            - Ajout config générale
            - génération des différentes tâches et des noms de subjects (?)
            - générer pick pour chaque subject
                - tool : pickOne
                - instruction : voir config générale à parser
                - gestion next_task
            - générer mark pour chaque subject
                - 

*/
const fs = require('fs');
const globalConfig = require('./global_config.json');


(() => globalConfig.stepsCfg.forEach((step) => require('./steps/'+step.name+'.js')(step,globalConfig.subjects)))();
