const { kmp } = require('./kmp');
const { bm } = require('./bm');

/**
 * @param {string} text
 * @param {string} algorithm what algorithm to use
 * @returns {string}
 */
function searchAll(text, algorithm) {
    return new Promise(function(resolve, reject) {
        const inputs = text.split(/\?+/).map(s => s.trim()).filter(Boolean);
        const promises = [];

        inputs.forEach(function(input) {
            switch (algorithm) {
                case 'kmp':
                    promises.push(kmp(input));
                    break;
                case 'bm':
                    promises.push(bm(input));
                    break;
                default:
                    promises.push(Promise.resolve('Algorithm not found'));
                    break;
            }
        });

        Promise.all(promises)
            .then(function(resolvedResults) {
                const output = resolvedResults.map(function(result, index) {
                    return inputs.length === 1 ? result : `${index + 1}. ${result}`;
                }).join('\n');
                resolve(output);
            })
            .catch(function(err) {
                reject(err);
            });
    });
}


module.exports = { searchAll };