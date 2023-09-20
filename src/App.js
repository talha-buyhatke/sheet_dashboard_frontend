import React, { useState } from 'react';
import FileUploadForm from './FileUploadForm';
import DataDisplayTable from './DataDisplayTable';

function App() {
  const [jsonData, setJsonData] = useState(null);

  const handleUpload = (data) => {
    setJsonData(data);
  };

  return (
    <div>
      <h1>XLSX Data Processor</h1>
      <FileUploadForm onUpload={handleUpload} />
      {jsonData && <DataDisplayTable data={jsonData} />}
    </div>
  );
}

export default App;
