var trigrams = require('./trigrams.js');
var file = Object.keys(trigrams)[0];
var keys = Object.keys(trigrams[file]);
module.exports = () => {
  
  const data = { trigrams: [] }
  // Create 1000 users
  for (let i = 0; i < keys.length; i++) {
    data.trigrams.push({ text: file, data: keys[i], count: trigrams.The_Image[keys[i]]  })
    if (i>100) break;
  }
  return data;
}
