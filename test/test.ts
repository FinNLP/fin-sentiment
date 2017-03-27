/// <reference path="../node_modules/@types/node/index.d.ts" />

/**
 * 
 * Not finished..
 * I still need to figure out an easy way to test
 * the sentiment of each token
 * 
 */

import * as Fin from "finnlp";
import "../src/index";


function fail (msg:string){
	console.error(`\t ❌ Fail: ${msg}`);
	process.exit(1);
}

function pass (msg:string) {
	console.log(`\t ✔ Passed: ${msg}`);
}

function assert (sentence:string,expected?:string) {
	const inst = new Fin.Run(sentence);
	inst.sentiment();
}


// verbs
assert("I'd hate to see him");
assert("fuck the police");
assert("I love that");
assert("I've abandoned him for good");
assert("He's accused of shop lifting");
assert("I can't admit to this");
assert("I admit that I couldn't finish the project");