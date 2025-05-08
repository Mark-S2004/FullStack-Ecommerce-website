const fs = require('fs');
const path = require('path');

// Define the root directory of the source code
const srcDir = path.join(__dirname, 'src');

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Map of path aliases to their relative path functions
const aliasMapping = {
  '@/': (fromDir) => {
    const relativePath = path.relative(fromDir, srcDir);
    return relativePath ? relativePath + '/' : './';
  },
  '@config': (fromDir) => {
    const configDir = path.join(srcDir, 'config');
    return path.relative(fromDir, configDir);
  },
  '@controllers/': (fromDir) => {
    const controllersDir = path.join(srcDir, 'controllers');
    return path.relative(fromDir, controllersDir) + '/';
  },
  '@databases': (fromDir) => {
    const databasesDir = path.join(srcDir, 'databases');
    return path.relative(fromDir, databasesDir);
  },
  '@dtos/': (fromDir) => {
    const dtosDir = path.join(srcDir, 'dtos');
    return path.relative(fromDir, dtosDir) + '/';
  },
  '@exceptions/': (fromDir) => {
    const exceptionsDir = path.join(srcDir, 'exceptions');
    return path.relative(fromDir, exceptionsDir) + '/';
  },
  '@interfaces/': (fromDir) => {
    const interfacesDir = path.join(srcDir, 'interfaces');
    return path.relative(fromDir, interfacesDir) + '/';
  },
  '@middlewares/': (fromDir) => {
    const middlewaresDir = path.join(srcDir, 'middlewares');
    return path.relative(fromDir, middlewaresDir) + '/';
  },
  '@models/': (fromDir) => {
    const modelsDir = path.join(srcDir, 'models');
    return path.relative(fromDir, modelsDir) + '/';
  },
  '@routes/': (fromDir) => {
    const routesDir = path.join(srcDir, 'routes');
    return path.relative(fromDir, routesDir) + '/';
  },
  '@services/': (fromDir) => {
    const servicesDir = path.join(srcDir, 'services');
    return path.relative(fromDir, servicesDir) + '/';
  },
  '@utils/': (fromDir) => {
    const utilsDir = path.join(srcDir, 'utils');
    return path.relative(fromDir, utilsDir) + '/';
  }
};

// Replace the path aliases with relative paths
function replacePathAliases(filePath) {
  console.log(`Processing ${filePath}`);
  
  const fileDir = path.dirname(filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match import statements with path aliases
  const importRegex = /import\s+(?:(?:{[^}]*}|\*\s+as\s+\w+|\w+)?(?:\s*,\s*(?:{[^}]*}|\*\s+as\s+\w+|\w+))?)?\s+from\s+['"](@[^'"]+)['"]\s*;/g;
  
  const updatedContent = content.replace(importRegex, (match, alias) => {
    for (const [aliasPrefix, getRelativePath] of Object.entries(aliasMapping)) {
      if (alias === aliasPrefix || alias.startsWith(aliasPrefix)) {
        const suffix = alias === aliasPrefix ? '' : alias.substring(aliasPrefix.length);
        const relativePath = getRelativePath(fileDir);
        // Make sure we use proper './' prefix for relative paths
        const finalPath = relativePath.startsWith('.') ? `${relativePath}${suffix}` : `./${relativePath}${suffix}`;
        modified = true;
        
        // Reconstruct the import statement
        return match.replace(`'${alias}'`, `'${finalPath}'`).replace(`"${alias}"`, `"${finalPath}"`);
      }
    }
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${filePath}`);
  }
}

// Find all TypeScript files and replace path aliases
const tsFiles = findTsFiles(srcDir);
console.log(`Found ${tsFiles.length} TypeScript files`);

tsFiles.forEach(filePath => {
  replacePathAliases(filePath);
});

console.log('All imports have been updated!'); 