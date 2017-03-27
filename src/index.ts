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
				const subjectIndex = sentence.deps.findIndex(x=>x.label.endsWith("SUBJ") && x.parent === tokenIndex);
				const objectIndex = sentence.deps.findIndex(x=>(x.label.endsWith("OBJ") || x.label.endsWith("OBL")) && x.parent === tokenIndex);
				const parentIndex = sentence.deps[tokenIndex].parent;
				const rootIndex = sentence.deps.findIndex(x=>x.parent === -1);
				if(tag === "V") { // if verb
					if(~subjectIndex) // try to subject
						sentiment[sentenceIndex][subjectIndex] = sentiment[sentenceIndex][subjectIndex] + sentimentNum;
					else if(~objectIndex) // try to object
						sentiment[sentenceIndex][objectIndex] = sentiment[sentenceIndex][objectIndex] + sentimentNum;
					else if(~parentIndex) // try to parent
						sentiment[sentenceIndex][parentIndex] = sentiment[sentenceIndex][parentIndex] + sentimentNum;
					else // try to root
						sentiment[sentenceIndex][rootIndex] = sentiment[sentenceIndex][rootIndex] + sentimentNum;
				}
				if(tag === "U") // Interjection: root
					sentiment[sentenceIndex][rootIndex] = sentiment[sentenceIndex][rootIndex] + sentimentNum;
				else // all other
					sentiment[sentenceIndex][parentIndex] = sentiment[sentenceIndex][parentIndex] + sentimentNum;
			}
		});
	});

	const negation = this.negation();
	const emphasis = this.emphasis();
	sentiment.forEach((sentence,si)=>{
		// multiply by -1 if negated
		sentence.forEach((score,ti)=>{
			if(score && negation[si][ti]) sentiment[si][ti] *= -1;
			if(emphasis[si][ti]) sentiment[si][ti] *= emphasis[si][ti];
		});
	});
	return sentiment;
};