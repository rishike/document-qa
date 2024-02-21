import React from 'react';

export function Test() {
  const url = 'https://icseindia.org/document/sample.pdf';

  return (
    <div className="App">
      <h1>Hello React.</h1>
      <h2>Start editing to see some magic happen!</h2>
      
      <h1>URL Preview</h1>
      <URLPreview url={url} />
    </div>
  );
}

const URLPreview = ({ url }) => {
  return (
    <div className="url-preview">
      <iframe src={url} title="URL Preview" width="100%" height="500px" />
    </div>
  );
};

export default Test;
