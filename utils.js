const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

module.exports = {
    formatDir(dirPath) {
        let count = 0;
        console.log('formatted directory...');
        let fileNames = fs.readdirSync(dirPath);
        let files = fileNames.map(fname => fs.readFileSync(path.join(dirPath, fname), {encoding: 'utf8'}));
        for(let i = 0; i < files.length; i++) {
            const formatted = prettier.format(String(files[i].toString()), {
                parser: 'typescript',
            });
            count++;
            fs.writeFile(path.join(dirPath, '/' + fileNames[i]), formatted, (err) => {
                if (err) return console.error(err);
            });
        }
        console.log(`done formatting ${count} files in "${dirPath}"`);
    },

    readJSONFile(filePath) {
        if (!filePath) {
            console.error('"filePath" must be specified');
            return;
        }
        let text = '', json = null;
        try {
            text = fs.readFileSync(filePath);
        } catch (err) {
            console.error(`Coudln't read filePath="${filePath}" error:`, err);
        }
        try {
            json = JSON.parse(text);
        } catch (err) {
            console.error(`Coudln't JSON.parse schema at "${filePath}" error:`, err);
        }
        if (!text || !json) {
            console.error('Unknown error!');
            return;
        }
        return json;
    },
};