/* example usage: node cleaner.js german_stopwords.txt stopwords.txt */
const fs = require('fs');

console.log("transforming "+process.argv[2]+" to "+process.argv[3]);
// Read the input file
fs.readFile(process.argv[2], 'utf8', (err, data) => {
  if (err) throw err;

  // Split the input file into lines
  const lines = data.split('\n');

  // Extract the first word of each line
  const words = lines.map(line => line.split(' ')[0]).filter(word => word.length > 1);

  // Write the words to the output file
  fs.writeFile(process.argv[3], words.join('\n'), err => {
    if (err) throw err;
    console.log('Word list saved to output.txt');
  });
});
