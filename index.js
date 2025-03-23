const fs = require('fs');
const path = require('path');
const util = require('util');

const copyFileAsync = util.promisify(fs.copyFile);
const statAsync = util.promisify(fs.stat);
const readdirAsync = util.promisify(fs.readdir);
const appendFileAsync = util.promisify(fs.appendFile);

async function logError(message) {
    const logFile = path.join(__dirname, 'file-move.log');
    const timestamp = new Date().toISOString();
    await appendFileAsync(logFile, `[${timestamp}] ERROR: ${message}\n`);
}

async function copyFiles(sourceDir, destinationDir, excludeItems = []) {
    if (!fs.existsSync(sourceDir)) {
        const errorMsg = `Source directory "${sourceDir}" does not exist.`;
        console.error(errorMsg);
        await logError(errorMsg);
        return;
    }
    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
    }
    
    try {
        const items = await readdirAsync(sourceDir);
        
        for (const item of items) {
            if (!excludeItems.includes(item)) {
                const sourcePath = path.join(sourceDir, item);
                const destinationPath = path.join(destinationDir, item);
                
                try {
                    const stats = await statAsync(sourcePath);
                    
                    if (stats.isDirectory()) {
                        console.log(`Skipped directory: ${item}`);
                    } else {
                        await copyFileAsync(sourcePath, destinationPath);
                        console.log(`Copied: ${item}`);
                    }
                } catch (err) {
                    const errorMsg = `Error accessing "${item}": ${err.message}`;
                    console.error(errorMsg);
                    await logError(errorMsg);
                }
            } else {
                console.log(`Skipped: ${item}`);
            }
        }
    } catch (err) {
        console.error('Error reading source directory:', err);
        await logError(`Error reading source directory: ${err.message}`);
    }
}

// Example usage
const sourceFolder = 'D:\\2022_Reinit\\SANDBOXES\\0000_GET_OUT';
const destinationFolder = 'F:\\FOLDER_2025\\SANDBOXES\\0000_GET_OUT';

const itemsToExclude = ['.vscode', 'node_modules'];

copyFiles(sourceFolder, destinationFolder, itemsToExclude);
