import dict from "./dictionary";
import * as Fin from "finnlp";
import "fin-negation";
import "fin-emphasis";

declare module "finnlp" {
	export interface Run {
		sentiment:()=>number[][];
	}
}

Fin.Run.prototype.sentiment = function(this:Fin.Run){
	const sentiment:number[][] = [];
	this.sentences.forEach((sentence,sentenceIndex)=>{
		sentiment[sentenceIndex] = [];
		sentence.tokens.forEach((token,tokenIndex)=>{
			sentiment[sentenceIndex][tokenIndex] = 0;
		});
		sentence.tokens.forEach((token,tokenIndex)=>{
			const sentimentNum = dict[token.toLowerCase()];
			if(sentimentNum) {
				const tag = sentence.tags[tokenIndex].charAt(0);
				const objectIndex = sentence.deps.findIndex(x=>/OB/.test(x.label) && x.parent === tokenIndex);
				const parentIndex = sentence.deps[tokenIndex].parent;
				const rootIndex = sentence.deps.findIndex(x=>x.parent === -1);
				const childCompliment = sentence.deps.findIndex(x=>x.parent === tokenIndex && /COMP|ADVCL/.test(x.label));
				if(tag === "V") { // if verb
					if(~objectIndex) // try to object
						sentiment[sentenceIndex][objectIndex] = multiply(sentimentNum,tokenIndex,sentenceIndex,this);
					else if(~childCompliment)
						sentiment[sentenceIndex][childCompliment] = multiply(sentimentNum,tokenIndex,sentenceIndex,this);
					else if(~parentIndex) // try to parent
						sentiment[sentenceIndex][parentIndex] = multiply(sentimentNum,tokenIndex,sentenceIndex,this);
					else // try to root
						sentiment[sentenceIndex][rootIndex] = multiply(sentimentNum,tokenIndex,sentenceIndex,this);
				}
				if(tag === "U") // Interjection: root
					sentiment[sentenceIndex][rootIndex] = multiply(sentimentNum,tokenIndex,sentenceIndex,this);
				else // all other
					sentiment[sentenceIndex][parentIndex] = multiply(sentimentNum,tokenIndex,sentenceIndex,this);
			}
		});
	});
	return sentiment;
};

function multiply(score:number,tokenIndex:number,sentenceIndex:number,instance:Fin.Run) {
	const negation = instance.negation();
	const emphasis = instance.emphasis();
	if(negation[sentenceIndex][tokenIndex]) score = score * -1;
	if(emphasis[sentenceIndex][tokenIndex]) score = score * emphasis[sentenceIndex][tokenIndex];
	return score;
}