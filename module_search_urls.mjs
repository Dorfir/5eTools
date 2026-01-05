#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
// const fs = require('fs');
// const path = require('path');

function findUrlsInText(text) {
  const results = [];
  const lines = text.split(/\r?\n/);
//   const mdLinkRe = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
//   const bareUrlRe = /(https?:\/\/[^\s)]+)(?=[\s)|]|$])/g;
  const mdLinkRe = /\[([^\]]+)\]\((img\/[^)\s]+)\)/g;
  const bareUrlRe = /(img\/[^\s)]+)(?=[\s)|]|$])/g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    while ((m = mdLinkRe.exec(line)) !== null) {
      results.push({type: 'markdown-link', text: m[1], url: m[2], line: i+1});
    }
    // reset lastIndex for next regex
    mdLinkRe.lastIndex = 0;
    while ((m = bareUrlRe.exec(line)) !== null) {
      results.push({type: 'bare-url', url: m[1], line: i+1});
    }
    bareUrlRe.lastIndex = 0;
  }
  return results;
}

function readFileSyncUtf8(filePath) {
  return fs.readFileSync(filePath, {encoding: 'utf8'});
}

function collectMdFiles(inputPath, recursive = false) {
  const out = [];
  function walk(p) {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      const entries = fs.readdirSync(p);
      for (const e of entries) {
        const full = path.join(p, e);
        const s = fs.statSync(full);
        if (s.isDirectory()) {
          if (recursive) walk(full);
        } else if (s.isFile() && full.toLowerCase().endsWith('.md')) {
          out.push(full);
        }
      }
    } else if (stat.isFile() && p.toLowerCase().endsWith('.md')) {
      out.push(p);
    }
  }
  walk(inputPath);
  return out;
}

function usage() {
  console.log('Usage: node search_urls.js <file-or-dir> [--json]');
  process.exit(1);
}

export async function main(inputPath, isRecursive, isJson, outputFile) {
  // const args = process.argv.slice(2);
  // if (args.length === 0) usage();
  let jsonOut = isJson;
  let recursive = isRecursive;
  let outFile = outputFile;
  let target = inputPath;
  
  if (!fs.existsSync(target)) {
    throw new Error('Path not found:', target)
    // console.error('Path not found:', target);
    // process.exit(2);
  }
  const files = collectMdFiles(target, recursive);
  const allMatches = [];
  for (const file of files) {
    try {
      const text = readFileSyncUtf8(file);
      const matches = findUrlsInText(text);
      matches.forEach(m => m.file = path.relative(process.cwd(), file));
      allMatches.push(...matches);
    } catch (err) {
     throw new Error('Failed reading', file, err.message);
    }
  }

  let output = '';
  if (jsonOut) output = JSON.stringify(allMatches, null, 2);
  else {
    if (allMatches.length === 0) {
      output = 'No URLs found.';
    } else {
      const byFile = {};
      for (const m of allMatches) {
        byFile[m.file] = byFile[m.file] || [];
        byFile[m.file].push(m);
      }
      for (const f of Object.keys(byFile)) {
        output += `\nFile: ${f}\n`;
        byFile[f].forEach(m => {
          if (m.type === 'markdown-link') output += ` L${m.line}: [${m.text}] -> ${m.url}\n`;
          else output += ` L${m.line}: ${m.url}\n`;
        });
      }
      output += `\nTotal URLs found: ${allMatches.length}`;
    }
  }

  if (outFile) {
    try {
      fs.writeFileSync(outFile, output, {encoding: 'utf8'});
      console.log('Wrote output to', outFile);
    } catch (err) {
      throw new Error('Failed to write output to', outFile, err.message);
    }
  } else {
    console.log(output);
  }
}

// async function main() {
//   const args = process.argv.slice(2);
//   if (args.length === 0) usage();
//   let jsonOut = false;
//   let recursive = false;
//   let outFile = null;
//   let target = null;
//   for (let i = 0; i < args.length; i++) {
//     const a = args[i];
//     if (a === '--json') jsonOut = true;
//     else if (a === '-r' || a === '--recursive') recursive = true;
//     else if (a === '-o' || a === '--out') {
//       i++;
//       outFile = args[i];
//     } else {
//       if (!target) target = a;
//     }
//   }
//   if (!target) usage();
//   if (!fs.existsSync(target)) {
//     console.error('Path not found:', target);
//     process.exit(2);
//   }
//   const files = collectMdFiles(target, recursive);
//   const allMatches = [];
//   for (const file of files) {
//     try {
//       const text = readFileSyncUtf8(file);
//       const matches = findUrlsInText(text);
//       matches.forEach(m => m.file = path.relative(process.cwd(), file));
//       allMatches.push(...matches);
//     } catch (err) {
//       console.error('Failed reading', file, err.message);
//     }
//   }

//   let output = '';
//   if (jsonOut) output = JSON.stringify(allMatches, null, 2);
//   else {
//     if (allMatches.length === 0) {
//       output = 'No URLs found.';
//     } else {
//       const byFile = {};
//       for (const m of allMatches) {
//         byFile[m.file] = byFile[m.file] || [];
//         byFile[m.file].push(m);
//       }
//       for (const f of Object.keys(byFile)) {
//         output += `\nFile: ${f}\n`;
//         byFile[f].forEach(m => {
//           if (m.type === 'markdown-link') output += ` L${m.line}: [${m.text}] -> ${m.url}\n`;
//           else output += ` L${m.line}: ${m.url}\n`;
//         });
//       }
//       output += `\nTotal URLs found: ${allMatches.length}`;
//     }
//   }

//   if (outFile) {
//     try {
//       fs.writeFileSync(outFile, output, {encoding: 'utf8'});
//       console.log('Wrote output to', outFile);
//     } catch (err) {
//       console.error('Failed to write output to', outFile, err.message);
//     }
//   } else {
//     console.log(output);
//   }
// }

// if (require.main === module) main();
