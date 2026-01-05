import fs from 'fs'

export function iterate(myfile) {

    if(!fs.existsSync(myfile)) {
        throw new Error('Fichier introuvable')
    }

    let json = fs.readFileSync(myfile, {encoding: 'utf8'})
    json = JSON.parse(json)
    let short_json = Array()
    json.forEach(element => {
        if (element.url.endsWith('webp'))
        short_json.push({'url': element.url})
    });
    return short_json
    // console.log(json)
}