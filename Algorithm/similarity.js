const { con, getQuestions, getAnswers } = require("../db");
const { calculateEquation } = require("./calculator");

/**
 * @param {string} text
 * @param {string} pattern
 * Pencarian pertanyaan yang paling mirip dengan pertanyaan yang diberikan pengguna dilakukan dengan 
 * algoritma pencocokan string Knuth-Morris-Pratt (KMP)
 * @returns {string} 
 * 
 * @todo Implementasi algoritma KMP
 * */

function levenshteinDistance(string1, string2) {
    const m = string1.length;
    const n = string2.length;
    const distances = Array.from(Array(m + 1), () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      distances[i][0] = i;
    }
    for (let j = 1; j <= n; j++) {
      distances[0][j] = j;
    }
    for (let j = 1; j <= n; j++) {
      for (let i = 1; i <= m; i++) {
        const substitutionCost = string1[i - 1] === string2[j - 1] ? 0 : 1;
        distances[i][j] = Math.min(
          distances[i - 1][j] + 1,
          distances[i][j - 1] + 1,
          distances[i - 1][j - 1] + substitutionCost
        );
      }
    }
    // console.log(distances[m][n]);
    return distances[m][n];
}

// function getSimilar(){
// }

function getSimilarity(pattern) {
    console.log("smiliarity");
    // const similarityT = 0.9;
    return new Promise(function(resolve, reject) {
        var validation = -1;
        var qResult = [];
        var i = -1;
        var result;
        
        getQuestions()
                .then(function(result) {
                    qResult = result;
                    console.log(qResult);
                    const similarStrings = [];
                    do {
                        i++;
                        if(i == qResult.length){
                            similarStrings.sort((a, b) => b.similarity - a.similarity);
                            // similarStrings.splice(3);
                            break;
                            // return similarStrings;

                        } else {
                            const distance = levenshteinDistance(pattern, qResult[i].question);
                            const similarity = 1 - distance / Math.max(pattern.length, qResult[i].question.length);
                            // console.log(similarity);
                            // if (similarity >= similarityT) {
                            similarStrings.push({ index: i, similarity: similarity, string: qResult[i].question });
                            // }
                        }
                            // validation = bmMatch(text, qResult[i].question);
                            // console.log(validation);
                    
                        } while (validation == -1);
                        // console.log(similarStrings);
                        // for (let i = 0; i < similarStrings.length; i++) {
                        //     const obj = similarStrings[i];
                        //     console.log(`Similar string ${i + 1}: '${obj.string}', similarity score: ${obj.similarity}`);
                        // }

                        resolve(similarStrings);
                });
            });

    
    // const similarStrings = strings.map((str, index) => {
    //     const distance = levenshteinDistance(pattern, str);
    //     const similarity = 1 - distance / Math.max(pattern.length, str.length);
    //     return { index: index, similarity: similarity, string: str };
    //     }).filter(obj => obj.similarity >= similarityT)
    //     .sort((a, b) => b.similarity - a.similarity)
    //     .slice(0, 3)
    //     .reduce((obj, item) => {
    //         obj[item.index] = item.string;
    //         return obj;
    //     }, {});
    // return similarStrings;
}

module.exports = { levenshteinDistance, getSimilarity };



