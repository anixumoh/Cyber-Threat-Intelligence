import fs from 'fs'

let indexHTML = fs.readFileSync('./build/index.html').toString()
let inlineScripts = indexHTML.matchAll(/<script>(?<script>.*)<\/script>/gms)

for (const match of inlineScripts) {
    const uuid = Math.random().toString(36).substr(2)
    const scriptName = `/assets/inline.${uuid}.js`
    
    let scriptContent = match.groups.script.trim().replace(/\s\s+/g, ' ');
    scriptContent = scriptContent.replace('__sveltekit', 'let __sveltekit')
    scriptContent = scriptContent.replace('document.currentScript.parentElement', 'document.getElementById(\'svelte-app\')')

    fs.writeFileSync(`./build${scriptName}`, scriptContent)

    const newStartScript = `<script src="${scriptName}" defer type="module"></script>`
    indexHTML = indexHTML.replace('</head>', `${newStartScript}\n</head>`)
}

indexHTML = indexHTML.replace(/<script>(.*)<\/script>/gms, "")

fs.writeFileSync('./build/index.html', indexHTML)
