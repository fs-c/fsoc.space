rm -rf temp
mkdir temp
mkdir temp/words

cp -r public/* temp

cd words
../words.exe --public ../temp/words
