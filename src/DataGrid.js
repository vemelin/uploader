import React, { useState, useCallback } from 'react';
import { Upload, Download, Search, Filter, Trash2, Plus, Edit3 } from 'lucide-react';
import Papa from 'papaparse';

const DataGrid = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);

  // Reset to initial state
  const resetDataGrid = () => {
    setData([]);
    setColumns([]);
    setFilteredData([]);
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
    setSelectedRows(new Set());
    setEditingCell(null);
  };

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const cols = Object.keys(results.data[0]).map(key => ({
              key: key.trim(),
              label: key.trim(),
              type: 'text'
            }));
            setColumns(cols);
            setData(results.data);
            setFilteredData(results.data);
          }
          setIsUploading(false);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          setIsUploading(false);
        }
      });
    } else if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          const arrayData = Array.isArray(jsonData) ? jsonData : [jsonData];
          
          if (arrayData.length > 0) {
            const cols = Object.keys(arrayData[0]).map(key => ({
              key,
              label: key,
              type: 'text'
            }));
            setColumns(cols);
            setData(arrayData);
            setFilteredData(arrayData);
          }
        } catch (error) {
          console.error('JSON parsing error:', error);
        }
        setIsUploading(false);
      };
      reader.readAsText(file);
    }
    
    // Reset file input
    event.target.value = '';
  }, []);

  // Search functionality
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(term.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [data]);

  // Sort functionality
  const handleSort = useCallback((columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(sorted);
    setSortConfig({ key: columnKey, direction });
  }, [filteredData, sortConfig]);

  // Row selection
  const toggleRowSelection = (rowIndex) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    setSelectedRows(newSelected);
  };

  // Cell editing
  const handleCellEdit = (rowIndex, columnKey, newValue) => {
    const newData = [...data];
    const actualRowIndex = data.findIndex(row => row === filteredData[rowIndex]);
    newData[actualRowIndex] = { ...newData[actualRowIndex], [columnKey]: newValue };
    setData(newData);
    
    const newFilteredData = [...filteredData];
    newFilteredData[rowIndex] = { ...newFilteredData[rowIndex], [columnKey]: newValue };
    setFilteredData(newFilteredData);
    setEditingCell(null);
  };

  // Add new row
  const addNewRow = () => {
    const newRow = {};
    columns.forEach(col => {
      newRow[col.key] = '';
    });
    const newData = [...data, newRow];
    setData(newData);
    setFilteredData(newData);
  };

  // Delete selected rows
  const deleteSelectedRows = () => {
    const selectedIndices = Array.from(selectedRows);
    const rowsToDelete = selectedIndices.map(index => filteredData[index]);
    
    const newData = data.filter(row => !rowsToDelete.includes(row));
    setData(newData);
    setFilteredData(newData);
    setSelectedRows(new Set());
  };

  // Export data
  const exportData = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Method Data Manager</h1>
        <p className="text-gray-600">Upload CSV or JSON files to view and edit your data</p>
      </div>

      {/* Show uploader when no data, show table when data exists */}
      {data.length === 0 ? (
        /* Upload Section */
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="text-lg font-medium text-gray-700 hover:text-blue-600">
                {isUploading ? 'Processing...' : 'Click to upload or drag and drop'}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".csv,.json"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">CSV or JSON files supported</p>
          </div>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={addNewRow}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetDataGrid}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                New Upload
              </button>
              {selectedRows.size > 0 && (
                <button
                  onClick={deleteSelectedRows}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedRows.size})
                </button>
              )}
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Data Stats */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredData.length} of {data.length} rows
          </div>

          {/* Data Grid */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(filteredData.map((_, i) => i)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {sortConfig.key === column.key && (
                          <span className="text-blue-600">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={selectedRows.has(rowIndex) ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={() => toggleRowSelection(rowIndex)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                        {editingCell?.row === rowIndex && editingCell?.column === column.key ? (
                          <input
                            type="text"
                            value={row[column.key] || ''}
                            onChange={(e) => handleCellEdit(rowIndex, column.key, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                setEditingCell(null);
                              }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded group flex items-center justify-between"
                            onClick={() => setEditingCell({ row: rowIndex, column: column.key })}
                          >
                            <span>{row[column.key] || ''}</span>
                            <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              No results found for "{searchTerm}"
            </div>
          )}
        </>
      )}

      {/* Footer CTA - Only show when data is loaded */}
      {data.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <button 
            onClick={resetDataGrid}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
          >
            EXIT
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
            SUBMIT
          </button>
        </div>
      )}
    </div>
  );
};

export default DataGrid;