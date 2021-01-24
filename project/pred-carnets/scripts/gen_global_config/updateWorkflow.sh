#!/usr/bin/bash
if node index.js; then
	echo "Workflow generated"
	rm ../../workflows/*
	echo "Empty workflows folder"
	cp ./output/*.json ../../workflows/
	echo "New workflow copied into project folder"
	cd ../../../../
	if rake project:load[pred-carnets,workflows]; then
		echo "Workflow successfully reloaded"
		rails s
	else
		echo "Error occurred during workflow reloading"
	fi
	
else
	echo "Failure,exit status: $?"
fi

