const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const brand = process.argv[2]
const brandPath = path.join(__dirname, `${brand}`)
const publicPath = path.join(__dirname, '../public')


const logoPath = path.join(brandPath, 'logo.png')
sharp(logoPath).resize(48).toFile(path.join(publicPath, 'favicon.ico'), (err) => {
    if (err) console.error(err)
    else console.log('favicon.ico created')
})

sharp(logoPath).resize(192).toFile(path.join(publicPath, 'android-chrome-192x192.png'), (err) => {
    if (err) console.error(err)
    else console.log('192x192 created')
})
sharp(logoPath).resize(512).toFile(path.join(publicPath, 'android-chrome-512x512.png'), (err) => {
    if (err) console.error(err)
    else console.log('512x512 created')
})
sharp(logoPath).resize(180).toFile(path.join(publicPath, 'apple-touch-icon.png'), (err) => {
    if (err) console.error(err)
    else console.log('apple-touch-icon.png created')
})

sharp(logoPath).resize(200).toFile(path.join(publicPath, 'logo.png'), (err) => {
    if (err) console.error(err)
    else console.log('Logo created')
})
sharp(logoPath).resize(60).toFile(path.join(publicPath, 'icon.png'), (err) => {
    if (err) console.error(err)
    else console.log('icon created')
})

const manifestPath = path.join(brandPath, 'branding.json')
const branding = JSON.parse(fs.readFileSync(manifestPath))
const manifest = {
    "short_name": branding.short_name,
    "name": branding.name,
    "icons": [
        {
            "src": "/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "start_url": "/",
    "background_color": branding.background_color,
    "display": "standalone",
    "theme_color": branding.theme_color
}
fs.writeFileSync(path.join(publicPath, 'manifest.json'), JSON.stringify(manifest, null, 2))
const rawPath = path.join(__dirname, 'raw')
const appFile = fs.readFileSync(path.join(rawPath, 'App.svelte'), 'utf8')
const appBranded = appFile.replace(/%BLOGNAME%/g, branding.name)
    .replace(/%BLOGSHORTNAME%/g, branding.short_name)
    .replace(/%BACKGROUND%/g, branding.background_color)
    .replace(/%TEXT%/g, branding.text_color);
fs.writeFileSync(path.join(__dirname, '../src/App.svelte'), appBranded)
const indexFile = fs.readFileSync(path.join(rawPath, 'index.html'), 'utf8')
const indexBranded = indexFile.replace(/%BLOGNAME%/g, branding.name)
fs.writeFileSync(path.join(__dirname, '../index.html'), indexBranded)