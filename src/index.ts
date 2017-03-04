import {Fin} from "finnlp";
import dict from "./dictionary";

export namespace Fin {
    export interface FinReturn {
        sentiment:()=>number[][];
    }
}

export function sentiment(input:Fin.FinReturn){

    // initialize all with 0
    const sentiment:number[][] = [];
    input.tokens.forEach((sentenceTokens,sentenceIndex)=>{
        sentiment[sentenceIndex] = []; 
        sentenceTokens.forEach((token,tokenIndex)=>{
            sentiment[sentenceIndex][tokenIndex] = 0;
        });
    });

    // analyze and add scores
    input.tokens.forEach((sentenceTokens,sentenceIndex)=>{
        sentenceTokens.forEach((token,tokenIndex)=>{
            const sentimentNum = dict[token];
            if(sentimentNum) {
                const type = input.tags[sentenceIndex][tokenIndex].charAt(0).toUpperCase();

                // Verbs: apply to subjects and objects
                if (type === "V") {
                    const dependents:number[] = [];
                    input.deps[sentenceIndex].forEach((node,index)=>{
                        if(node.parent === tokenIndex && node.label.toUpperCase().endsWith("BJ")) dependents.push(index);
                    });
                    dependents.forEach((index)=>{
                        sentiment[sentenceIndex][index] += sentimentNum;
                    });
                }

                // interjections: apply to the sentence root
                else if(type === "U"){
                    const rootIndex = input.deps[sentenceIndex].findIndex(depsNode=>depsNode.parent === -1);
                    sentiment[sentenceIndex][rootIndex] += sentimentNum;
                }

                // all other: apply to parent
                else {
                    const parentIndex = input.deps[sentenceIndex][tokenIndex].parent;
                    sentiment[sentenceIndex][parentIndex] += sentimentNum;
                }
            }
        });
    });

    return Object.assign(input,{sentiment});
}