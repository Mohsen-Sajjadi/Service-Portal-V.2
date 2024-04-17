const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '..', 'db.json');
const backupDir = 'C:\\Users\\MohsenSajjadi\\OneDrive - Triton Concepts\\Documents\\ServicePortal App\\triton-concepts-service-portal\\backup';

// Ensure the backup directory exists
if (!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir, { recursive: true });
}

const date = new Date().toISOString().split('T')[0]; // format as 'YYYY-MM-DD'
const backupFile = path.join(backupDir, `db-backup-${date}.json`);

fs.copyFile(sourceFile, backupFile, (err) => {
    if (err) throw err;
    console.log(`Backup was successful: ${backupFile}`);
});