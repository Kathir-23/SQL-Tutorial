const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      if (content.includes('damato@sql')) {
        content = content.replace(/damato@sql/g, 'kathir@sql');
        changed = true;
      }
      if (content.includes('damato-sql.vercel.app')) {
        content = content.replace(/damato-sql\.vercel\.app/g, 'sql-tutorial.vercel.app');
        changed = true;
      }
      if (content.includes('damato · xp')) {
        content = content.replace(/damato · xp/g, 'kathir · xp');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

['app', 'components', 'lib'].forEach(replaceInDir);
console.log("Done replacing hardcoded names!");
