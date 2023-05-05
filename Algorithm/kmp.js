const { con, getQuestions, getAnswers, insertQuestions, updateAnswer, deleteQuestion } = require("../db");
const { calculateEquation } = require("./calculator");
const { getDayOfWeek } = require("./date");
const { getSimilarity, levenshteinDistance } = require("./similarity");

/**
 * @param {string} text
 * @param {string} pattern
 * Pencarian pertanyaan yang paling mirip dengan pertanyaan yang diberikan pengguna dilakukan dengan 
 * algoritma pencocokan string Knuth-Morris-Pratt (KMP)
 * @returns {string} 
 * 
 * @todo Implementasi algoritma KMP
 * */
function kmp(text) {
    console.log("KMP");
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
            var i = -1;
            var result;

            getQuestions()
                .then(function(result) {
                    qResult = result;
                    do {
                        i++;
                        if(i == qResult.length){
                            break;
                        } else {
                            validation = kmpMatch(text.toLowerCase(), qResult[i].question);
                            // console.log(validation);
                        }
                    } while (validation == -1);

                    if (validation == -1){
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
                                    if (qResult.length < 3){
                                        for (let i = 0; i < qResult.length; i++) {
                                            result += "\n" + (i + 1) + ". " + similarStrings[i].string;
                                        }
                                    }else {
                                        for (let i = 0; i < 3; i++) {
                                            result += "\n" + (i + 1) + ". " + similarStrings[i].string;
                                        } 
                                    }
                                    // console.log(result + " (BM)");
                                    resolve(result); // resolve the result here
                            }
                                
                            }
    
                            });
                        // result = 'Maaf jawaban dari pertanyaan belum ada di database :( (KMP) '; 
                        // resolve(result); // resolve the result here
                    } else {
                        getAnswers(qResult[i].question)
                            .then(function(result) {
                                result = result[0].answer;
                                result =
                                result == "DATE" ? new Date().toLocaleDateString() : 
                                result == "TIME" ? new Date().toLocaleTimeString() : 
                                result == "CALC" ? calculateEquation(text) :
                                result;
                                console.log(result + " (KMP)");
                                resolve(result); // resolve the result here
                        });
                    } 
            });
        });
    }
}

/**
 * 
 * @param {String} text 
 * @param {String} pattern
 */
function kmpMatch(text, pattern){
    var n = text.length;
    var m = pattern.length;
    var fail = computeFail(pattern);
    var i = 0;
    var j = 0;

    while (i < n){
        if(pattern.charAt(j)==text.charAt(i)){
            if(j == m - 1){
                return i - m + 1;
            }
            i++;
            j++;
        } else if (j > 0){
            j = fail[j-1];
        } else {
            i++;
        }
    }
    return -1;
}

function computeFail(pattern) {
    const fail = new Array(pattern.length);
    fail[0] = 0;
    var m = pattern.length;
    var j = 0;
    var i = 1;
    while (i < m){
        if(pattern.charAt(j) == pattern.charAt(i)){
            fail[i] = j+1;
            i++;
            j++;
        } else if (j > 0){
            j = fail[j-1];
        } else {
            fail[i]=0;
            i++;
        }
    }
    return fail;
}




module.exports = {kmp};