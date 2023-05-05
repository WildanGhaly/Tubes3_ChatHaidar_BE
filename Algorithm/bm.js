const { con, getQuestions, getAnswers } = require("../db");
const { calculateEquation } = require("./calculator");
const { getSimilarity, levenshteinDistance } = require("./similarity");
/**
 * @param {string} text
 * Pencarian pertanyaan yang paling mirip dengan pertanyaan yang diberikan pengguna dilakukan dengan 
 * algoritma pencocokan string Boyer-Moore (BM)
 * @returns {string} 
 * 
 * @todo Implementasi algoritma BM
 * */
function bm (text) {
    console.log("BM");
    console.log(text);
    const addQuestionRegex = /^tambahkan pertanyaan\s*(.+)\s*dengan jawaban\s*(.+)\s*$/i;
    const removeQuestionRegex = /^hapus pertanyaan\s*(.+)\s*$/i;
    const mathExpressionRegex = /([\+\-\*\/\^\\%\|\&\(\)])/;
    const dateExpressionRegex = /^((0[1-9]|[1-2][0-9]|3[0-1])-(0[1-9]|1[0-2])-\d{4})|((0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4})|(\d{4}\/(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2]))|(\d{4}-(0[1-9]|[1-2][0-9]|3[0-1])-(0[1-9]|1[0-2]))$/
                                   /*  dd-mm-yyyy  */                                 /*  dd/mm/yyyy  */                                   /* yyyy/mm/dd */                                    /* yyyy-mm-dd */

    if (addQuestionRegex.test(text)) {
        return new Promise(function(resolve, reject) {
            const matches = text.match(addQuestionRegex);
            const question = matches[1].toLowerCase().trim();
            const answer = matches[2];
            getAnswers(question).then(function(result){
                if (result.length == 0){
                    insertQuestions(question, answer);
                    resolve("Pertanyaan " + question + " telah ditambahkan (KMP)" );
                } else {
                    updateAnswer(question, answer);
                    resolve("Pertanyaan " + question + " sudah ada! jawaban diupdate ke " + answer);
                }
            });
        });
    } else if (removeQuestionRegex.test(text)) {
        return new Promise(function(resolve, reject) {
            const matches = text.match(removeQuestionRegex);
            const question = matches[1].toLowerCase();
            getAnswers(question).then(function(result){
                if (result.length == 0){
                    resolve("Tidak ada pertanyaan " + question + " pada database!");
                } else {
                    deleteQuestion(question);
                    resolve("Pertanyaan " + question + " telah dihapus");
                }
            }); 
        });
    } else if (dateExpressionRegex.test(text)){
        return new Promise(function(resolve, reject) {
            resolve(getDayOfWeek(text));
        });
    } else if (mathExpressionRegex.test(text)){
        return new Promise(function(resolve, reject) {
            resolve(calculateEquation(text));
        });
    } else {
    return new Promise(function(resolve, reject) {
        var validation = -1;
        var qResult = [];
        const final_question = [];
        var i = -1;
        var result;

        getQuestions()
                .then(function(result) {
                    qResult = result;
                    // console.log(qResult);
                    do {
                        i++;
                        if(i == qResult.length){
                            break;
                        } else {
                            validation = bmMatch(text, qResult[i].question);
                            // console.log(validation);
                        }
                    } while (validation == -1);

                    if (validation == -1){
                        // const similarStrings = 
                        getSimilarity(text).then(function(result) {
                        const similarStrings = result;
                        // console.log(similarStrings);
                        // console.log(similarStrings.length);
                        // console.log("test");
                        // console.log(similarStrings[0]);
                        if (similarStrings.length == 0){
                            result = 'Maaf jawaban dari pertanyaan belum ada di database :( (BM) '; 
                            resolve(result); // resolve the result here
                        } else {
                            if (similarStrings[0].similarity >= 0.9) {
                                getAnswers(similarStrings[0].string)
                                    .then(function(result) {
                                        result = result[0].answer;
                                        // result =
                                        // // result == "DATE" ? new Date().toLocaleDateString() : 
                                        // // result == "TIME" ? new Date().toLocaleTimeString() : 
                                        // // result == "CALC" ? calculateEquation(text) :
                                        // result;
                                        console.log(result + " (BM)");
                                        resolve(result); // resolve the result here
                                });
                            }
                            else {
                            result = 'Apakah yang anda maksud adalah : ';
                            for (let i = 0; i < 3; i++) {
                                result += "\n" + (i + 1) + ". " + similarStrings[i].string;
                            } 
                            resolve(result); // resolve the result here
                        }
                            
                        }

                        });

                    } else {
                        getAnswers(qResult[i].question)
                            .then(function(result) {
                                result = result[0].answer;
                                // result =
                                // result == "DATE" ? new Date().toLocaleDateString() : 
                                // result == "TIME" ? new Date().toLocaleTimeString() : 
                                // result == "CALC" ? calculateEquation(text) :
                                // result;
                                console.log(result + " (BM)");
                                resolve(result); // resolve the result here
                        });
                    } 

    // TODO: implementasi algoritma BM
    // function boyerMooreSearch(text, pattern) {
        });
    });
}
}
    
function bmMatch(question, pattern){
    let m = pattern.length;
    let n = question.length;

    let badSymbol = new Array(n).fill(0);
    let goodSuffix = new Array(m).fill(0);
    
    makingTable(pattern, badSymbol, goodSuffix);
    
    let i = 0;

    while (i <= n - m) {
        let j = m - 1;
        
        while (j >= 0 && pattern[j] === question[i + j]) {
        j--;
        }
        
        if (j === -1) {
            return 1;
        }
        
        i += Math.max(goodSuffix[j], j - badSymbol[question.charCodeAt(i + j)]);
    }
    return -1;
    }

function makingTable(pattern, badSymbol, goodSuffix) {
    let m = pattern.length;
    // badSymbol table
    for (let i = 0; i < m; i++) {
        badSymbol[pattern.charCodeAt(i)] = i;
        // console.log(badSymbol[pattern.charCodeAt(i)]);
    }
    
    // goodSuffix table
    let lastPrefix = m;
    for (let i = m - 1; i >= 0; i--) {

        if (isPrefix(pattern, i + 1)) {
        lastPrefix = i + 1;
        }
        goodSuffix[i] = lastPrefix - i + m - 1;
    }
    
    for (let i = 0; i < m - 1; i++) {

        let slen = goodSuffix.length - 1;
        let j = goodSuffix.length - 2;

        if (j >= i && goodSuffix[j - i] < slen - i) {
        goodSuffix[j] = Math.min(slen - i, goodSuffix[j - i]);
        }
    }
}

function isPrefix(pattern, p) {
let m = pattern.length;

for (let i = p, j = 0; i < m; i++, j++) {
    if (pattern[i] !== pattern[j]) {
    return false;
    }
}
return true;
}


module.exports = {bm};