# Roughly set up initial environment
rm -rf temp
mkdir temp
cd temp

# The following comments correspond to step names in the workflow.

# Prepare staging
mkdir staging
mkdir staging/words

# Check out the workbench
mkdir workbench
rsync -a .. workbench --exclude .git --exclude temp

# Move static files to staging
# Using cp instead of mv for obvious reasons
cp -r workbench/public/* staging/

# Download the latest words build
wget -nv https://github.com/lw2904/words/releases/latest/download/words-ubuntu-latest
chmod +x words-ubuntu-latest

# Build words into staging
cd workbench/words/
mv ../../words-ubuntu-latest .
./words-ubuntu-latest --public ../../staging/words

# Prepend build time to HTML files
cd ../../staging
find -L . -type f -name "*.html" -exec bash -c \
    'sed -i "1 i<!-- Built on `date` -->" $0' {} \;

echo 'finished build'
