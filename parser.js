import { download } from "./module_upload.mjs";
import { main } from "./module_search_urls.mjs"
import { iterate } from "./module_iterate.mjs";
import EventEmitter from "node:events";


const url_prefix_distant = 'https://5e.tools/'
const url_prefix_local = 'img/'
const eventEmitter = new EventEmitter();


// download('https://5e.tools/img/adventure/CoS/001-cos01-01a.webp', 'img/001-cos01-01a.wbep', function(err) {
//   if (err) {
//     console.log('Download failed: ' + err);
//     } else {
//     console.log('Download succeeded');
//     }
// });

// try {
//   main('curse_of_strahd.md', false, true, 'export.txt')
// } catch(err) {
//   console.log(err)
// }



function launchSetOfDownloads(url_set) {

  let valid_downloads = []

  eventEmitter.on('download_complete', (index) => {
    // console.log('download_complete event received, n°' + index)
    valid_downloads[index] = true
    let is_all_valid = true
    valid_downloads.forEach(entry => {
      is_all_valid = (is_all_valid && entry)
    })
    if (is_all_valid) eventEmitter.emit('set_of_downloads_complete')
  })

  url_set.forEach((url_entry, url_index) => {
    valid_downloads.push(false)
    download(url_prefix_distant + url_entry.url, url_prefix_local + url_entry.url.split('/').splice(-1), function(err) {
      if (err) {
        console.log('Download '+ url_index +' failed: ' + err)
      } else {
        // console.log('Download '+ url_index +' succeeded')
        eventEmitter.emit('download_complete', url_index)
      }
    })
  });
}


function chunkArray(arr, size) {
  const res = []
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
  return res
}



try {
  let clean_list = iterate('export.json')
  let split_list = chunkArray(clean_list, 5)

  let index_chunk = 62
  console.log(split_list.length)
  console.log(split_list[62])
  launchSetOfDownloads(split_list[index_chunk])
  eventEmitter.on('set_of_downloads_complete', () => {
    console.log(`-- set_of_downloads_complete - ${index_chunk}`)
    index_chunk++
    if (index_chunk < split_list.length) {
      setTimeout(() => {
        launchSetOfDownloads(split_list[index_chunk])
      }, 1000)
    }
  })

} catch(err) {
  console.log(err)

}


/* Divers */


// try {
//   let clean_list = iterate('export.json')

//   for (var i=0; i < clean_list.length; i=i+10) {

//     for (var j=0; j < 10; j++) {

//       let index = i + j
//       if (index < clean_list.length) {
//         console.log(clean_list[index].url)
//       }

//     }

//     setTimeout(() => {
//       console.log('-------------')
//     }, 1000)

//   }

// } catch(err) {
//   console.log(err)
// }
