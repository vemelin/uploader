Data Grid Manager - React App
An interactive data grid application built with React for uploading, viewing, and editing CSV and JSON files.

Features
📁 File Upload - Drag & drop or click to upload CSV/JSON files
📊 Interactive Table - View and edit data in a responsive grid
🔍 Search & Filter - Real-time search across all data
✏️ Inline Editing - Click any cell to edit data
➕ Add/Delete Rows - Full CRUD operations
📤 Export Data - Download edited data as CSV
🔄 Reset/Exit - Return to upload state
🎯 Footer Actions - EXIT and SUBMIT buttons
Installation
Create the project directory:
bash
mkdir data-grid-app
cd data-grid-app
Copy all the provided files into their respective locations:
package.json (root)
src/DataGrid.js
src/App.js
src/index.js
src/index.css
src/App.css
tailwind.config.js (root)
postcss.config.js (root)
public/index.html
Install dependencies:
bash
npm install
Start the development server:
bash
npm start
Open your browser to:
http://localhost:3000
Usage
Upload Data: Drag and drop or click to upload CSV/JSON files
View & Edit: Click any cell to edit data inline
Search: Use the search bar to filter data
Sort: Click column headers to sort data
Manage Rows: Add new rows or delete selected rows
Export: Download your edited data as CSV
Reset: Use EXIT or New Upload to start over
Dependencies
React 18 - Core framework
Lucide React - Icons
PapaParse - CSV parsing
Tailwind CSS - Styling
File Structure
data-grid-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── App.css
│   ├── DataGrid.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
Available Scripts
npm start - Run development server
npm build - Build for production
npm test - Run tests
npm eject - Eject from Create React App
Browser Support
Works in all modern browsers that support ES6+ and React 18.

License
MIT License - feel free to use this project for personal or commercial purposes.