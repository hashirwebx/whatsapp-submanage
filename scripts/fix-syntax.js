#!/usr/bin/env node

/**
 * JSX Syntax Fixer
 * Fixes common JSX syntax errors in React/TypeScript files
 */

const fs = require('fs');
const path = require('path');

function fixJsxSyntax(filePath) {
    console.log(`🔧 Fixing JSX syntax in: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf-8');

    // Fix < section to <section
    content = content.replace(/< +section/g, '<section');

    // Fix </section > to </section>
    content = content.replace(/<\/section +>/g, '</section>');

    // Fix </div > to </div>
    content = content.replace(/<\/div +>/g, '</div>');

    // Fix </footer > to </footer>
    content = content.replace(/<\/footer +>/g, '</footer>');

    // Fix </nav > to </nav>
    content = content.replace(/<\/nav +>/g, '</nav>');

    // Fix className = to className=
    content = content.replace(/className += +/g, 'className=');

    // Fix comments like {/* Hero Section */ } to {/* Hero Section */}
    content = content.replace(/\*\/ }/g, '*/}');

    // Specific fixes
    content = content.replace(/< section className =/g, '<section className=');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('✅ Fixed JSX syntax errors');
}

// Get file path from command line or use default
const targetFile = process.argv[2] || path.join(__dirname, '..', 'src', 'components', 'LandingPage.tsx');

if (fs.existsSync(targetFile)) {
    fixJsxSyntax(targetFile);
} else {
    console.error(`❌ File not found: ${targetFile}`);
    process.exit(1);
}
