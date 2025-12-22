import fs from 'fs'

export function iterate(myfile) {

    if(!fs.existsSync(myfile)) {
        throw new Error('Fichier introuvable')
    }

    let json = fs.readFileSync(myfile, {encoding: 'utf8'})
    json = JSON.parse(json)
    console.log(json[0].url)
    // console.log(json)
}