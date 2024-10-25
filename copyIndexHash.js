import fs from 'fs'

const filenames = ['runtime', 'polyfills', 'scripts', 'main', 'styles']
const fileContent = fs.readFileSync('./dist/index.angular.html').toString()
const hashes = filenames.map(
    filename => fileContent.match(new RegExp(`${filename}\.([\\w]+)\.(js|css)`))[1]
)

let appHtml = fs.readFileSync('./src/app.html').toString()

for (let i = 0; i < filenames.length; i++) {
    const name = filenames[i];
    const hash = hashes[i];
    appHtml = appHtml.replace(`/${name}`, `/${name}.${hash}`)
}

const randomId = Math.random().toString(16).slice(2)
appHtml = appHtml.replace('/assets/env/env.js', `/assets/env/env.js?v=${randomId}`)

fs.writeFileSync('./src/app.html', appHtml)
