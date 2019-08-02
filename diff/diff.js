/**
 * `diff.js` takes two versions of services and/or two versions of schemas and outputs the
 * difference: i.e., additions and deletions
 */


module.exports = function diff(A, B) {

    // return difference (additions and deletions)
};

// ------------------------------------------
// BELOW IS THE OLD CODE FOR diff.js IMPLEMENTATION
// ------------------------------------------

// const jsDiff = require("diff");
// const fs = require("fs");
// const array = require("array-operations");
// const chalk = require("chalk");

// module.exports = function diff(oldFilePath, newFilePath) {

//     const oldJson = JSON.parse(fs.readFileSync(oldFilePath));
//     const newJson = JSON.parse(fs.readFileSync(newFilePath));

//     // Diff CustomTypes
//     // Newly added types
//     const newTypes = array.difference(Object.keys(newJson.types), Object.keys(oldJson.types));
//     if (newTypes.length > 0) {
//         console.log(`New types added (${newTypes.length}):`);
//         console.log(newTypes.map((s, i) => {
//             return `${i+1}. ${chalk.green(s)}`;
//         }).join("\n"));
//     }

//     // Modified Types
//     const sameTypes = array.intersection(Object.keys(newJson.types), Object.keys(oldJson.types));
//     for(const t of sameTypes) {

//         const typesDifference = jsDiff.diffJson(oldJson.types[t], newJson.types[t]);
//         const modifiedFields = [];
//         typesDifference.forEach(d => {
//             if (d.added) {
//                 modifiedFields.push({
//                     value: /"(\w+)"/.exec(d.value)[1],
//                     mod:   "added",
//                 });
//             } else if (d.removed) {
//                 modifiedFields.push({
//                     value: /"(\w+)"/.exec(d.value)[1],
//                     mod:   "removed",
//                 });
//             }
//         });

//         if (modifiedFields.length > 0) {
//             console.log(`Modified type "${t}":`);
//             modifiedFields.forEach(f => {
//                 if (f.mod === "added") {
//                     console.log(chalk.green("+", f.value));
//                 } else if (f.mod === "removed") {
//                     console.log(chalk.red("-", f.value));
//                 }
//             });
//         }
//     }
// };
