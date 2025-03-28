const fs = require('fs');
const path = require('path');
const util = require('util');

const copyFileAsync = util.promisify(fs.copyFile);
const statAsync = util.promisify(fs.stat);
const readdirAsync = util.promisify(fs.readdir);
const mkdirAsync = util.promisify(fs.mkdir);
const rmAsync = util.promisify(fs.rm);
const appendFileAsync = util.promisify(fs.appendFile);

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

async function logError(message) {
    const logFile = path.join(__dirname, 'file-move.log');
    const timestamp = new Date().toISOString();
    await appendFileAsync(logFile, `[${timestamp}] ERROR: ${message}\n`);
}

async function copyRecursive(source, destination, excludeItems) {
    if (excludeItems.includes(path.basename(source))) {
        console.log(`Skipped: ${source}`);
        return;
    }
    
    try {
        const stats = await statAsync(source);
        
        if (stats.isDirectory()) {
            if (fs.existsSync(destination)) {
                await rmAsync(destination, { recursive: true, force: true });
            }
            await mkdirAsync(destination, { recursive: true });
            const items = await readdirAsync(source);
            
            for (const item of items) {
                await copyRecursive(
                    path.join(source, item),
                    path.join(destination, item),
                    excludeItems
                );
            }
        } else {
            if (fs.existsSync(destination)) {
                await rmAsync(destination, { force: true });
            }
            await copyFileAsync(source, destination);
            console.log(`Copied: ${source} -> ${destination}`);
        }
    } catch (err) {
        const errorMsg = `Error processing "${source}": ${err.message}`;
        console.error(errorMsg);
        await logError(errorMsg);
    }
}

async function copyFiles(sourceDir, destinationDir, excludeItems = []) {
    console.log(`Operation started at: ${getCurrentTime()}`);
    const startTime = getCurrentTime();

    if (!fs.existsSync(sourceDir)) {
        const errorMsg = `Source directory "${sourceDir}" does not exist.`;
        console.error(errorMsg);
        await logError(errorMsg);
        return;
    }
    if (!fs.existsSync(destinationDir)) {
        await mkdirAsync(destinationDir, { recursive: true });
    }
    
    try {
        const items = await readdirAsync(sourceDir);
        
        for (const item of items) {
            await copyRecursive(
                path.join(sourceDir, item),
                path.join(destinationDir, item),
                excludeItems
            );
        }
    } catch (err) {
        console.error('Error reading source directory:', err);
        await logError(`Error reading source directory: ${err.message}`);
    }
    
    const endTime = getCurrentTime();
    console.log(`Operation started at: ${startTime}`);
    console.log(`Operation ended at: ${endTime}`);
}


// Example usage
const sourceFolder = 'F:\\FOLDER_2025\\SANDBOXES';
const destinationFolder = 'D:\\FOLDER_2025\\SANDBOXES';

const itemsToExclude = ['.vscode', 'node_modules'];

copyFiles(sourceFolder, destinationFolder, itemsToExclude);
