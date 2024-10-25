rm /tmp/amcharts.zip
rm -rf /tmp/amcharts

curl -Lo /tmp/amcharts.zip https://www.amcharts.com/dl/amcharts4/
unzip /tmp/amcharts.zip -d /tmp/amcharts

rm -rf src/assets/amcharts/

mkdir -p src/assets/amcharts/
mkdir -p src/assets/amcharts/plugins
mkdir -p src/assets/amcharts/themes
mkdir -p src/assets/amcharts/deps

cp /tmp/amcharts/core.js src/assets/amcharts/core.js
cp /tmp/amcharts/charts.js src/assets/amcharts/charts.js
cp /tmp/amcharts/plugins/annotation.js src/assets/amcharts/plugins/annotation.js
cp /tmp/amcharts/themes/animated.js src/assets/amcharts/themes/animated.js
cp /tmp/amcharts/deps/pdfmake.js src/assets/amcharts/deps/pdfmake.js
cp /tmp/amcharts/deps/xlsx.js src/assets/amcharts/deps/xlsx.js
cp /tmp/amcharts/deps/canvg.js src/assets/amcharts/deps/canvg.js
