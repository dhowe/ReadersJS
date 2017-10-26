import nltk
f = open('image_cn_spcs_notags.txt')
raw = f.read()
characters = nltk.word_tokenize(raw)
bgs = nltk.bigrams(characters)
fdist = nltk.FreqDist(bgs)
outfile = open('cn-bigrams.js','w')
print("var cnBigrams = {", file=outfile)
for k,v in fdist.items():
    print('"' + k[0] + ' ' + k[1] + '": ' + str(v) + ',', file=outfile)
print("};", file=outfile)
outfile.close()