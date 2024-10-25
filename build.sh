npm run build:angular
mv dist/index.html dist/index.angular.html
cp src/app.html /tmp/app.html
node copyIndexHash.js
npm run build:svelte
rm src/app.html
mv /tmp/app.html src/app.html
node solveCSP.js
rm -rf dist
mv build dist
