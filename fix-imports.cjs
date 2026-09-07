const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Specifically target imports
      const newContent = content
        .replace(/from '\.\.\/\.\.\/\.\.\/data/g, "from '../../data")
        .replace(/from '\.\.\/\.\.\/\.\.\/services/g, "from '../../services");
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
