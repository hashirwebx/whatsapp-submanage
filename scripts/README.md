# Scripts Directory

This directory contains JavaScript/Node.js utility scripts for the SubTrack Pro project.

## Available Scripts

### 1. Fix JSX Syntax (`fix-syntax.js`)
Automatically fixes common JSX syntax errors in React/TypeScript files.

**Usage:**
```bash
npm run fix-syntax
# or with a specific file
node scripts/fix-syntax.js path/to/file.tsx
```

**What it fixes:**
- Spacing issues in JSX tags (`< section` → `<section`)
- Closing tag spacing (`</div >` → `</div>`)
- className spacing (`className =` → `className=`)
- Comment formatting (`{/* ... */ }` → `{/* ... */}`)

### 2. Test WhatsApp Verification (`test-whatsapp-verification.js`)
Tests the WhatsApp verification flow end-to-end.

**Usage:**
```bash
npm run test-whatsapp
```

**What it does:**
1. Sends a verification code to a phone number via WhatsApp
2. Prompts you to enter the received code
3. Verifies the code against the backend
4. Reports success or failure with helpful debugging info

## Migration from Shell/Batch/Python

These JavaScript scripts replace the previous:
- `fix_syntax.py` → `scripts/fix-syntax.js`
- `test-whatsapp-verification.sh` → `scripts/test-whatsapp-verification.js`
- `test-whatsapp-verification.bat` → `scripts/test-whatsapp-verification.js`

**Benefits of JavaScript versions:**
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ No Python/Bash dependencies required
- ✅ Uses Node.js which is already in the project
- ✅ Easier to maintain alongside TypeScript codebase
- ✅ Better integration with npm scripts

## Requirements

- Node.js 16+ (already required for the project)
- No additional dependencies needed

## Adding New Scripts

When adding new utility scripts:
1. Create a new `.js` file in this directory
2. Add a shebang line: `#!/usr/bin/env node`
3. Add the script to `package.json` scripts section
4. Document it in this README
