import { download } from "./module_upload.js";
import { main } from "./module_search_urls.js"
import { iterate } from "./module_iterate.js";


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


try {
  iterate('export.json')
} catch(err) {
  console.log(err)
}
