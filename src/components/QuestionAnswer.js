import React, { useRef, useState } from 'react';
import axios from 'axios';
import { pdfjs } from 'react-pdf';
import { Worker, Viewer, Document, Page } from 'react-pdf';


// console.log(pdfjs.version);

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const QuestionAnswer = () => {
    const [pdfFile, setPdfFile] = useState(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [numPages, setNumPages] = useState(null);


  const handleFileDrop = async (e) => {
    e.preventDefault();
    const pdfFile = e.dataTransfer.files;
    if (pdfFile.length > 0 && pdfFile[0].type === 'application/pdf') {
      setPdfFile(pdfFile[0]);
      await uploadFile(pdfFile[0]);
    } else {
      alert('Please drop a PDF file.');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleFileChange = async (e) => {
    const pdfFile = e.target.files[0];
    if (pdfFile && pdfFile.type === 'application/pdf') {
      setPdfFile(pdfFile);
      await uploadFile(pdfFile);
    } else {
      alert('Please upload a PDF file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClickToUpload = () => {
    fileInputRef.current.click();
  };

  const handleAskQuestion = async () => {
    // Placeholder for processing the question
    if (!question.trim()) {
        alert('Please enter a question.');
        return;
    }
    if (!pdfFile) {
        alert('Please upload a PDF file before asking a question.');
        return;
      }
    
    const filename = pdfFile.name; 
    try {
        
        const response = await axios.post('http://127.0.0.1:8000/ask/', {
          "question":question,
          "filename" : filename
        });
        if (response.data && response.data.answer) {
          setAnswer(response.data.answer); // Update the state with the received answer
        } else {
          console.error('No answer received from the API');
          setAnswer('Sorry, I could not find an answer to your question.');
        }
      } catch (error) {
        console.error('Error asking question:', error);
        setAnswer('An error occurred while trying to process your question.');
      }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await axios.post('http://localhost:8000/upload-pdf/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',

        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.status === 200) {
        console.log('File uploaded successfully', response.data);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col justify-center items-center border-r">
        <div
          className="w-3/4 h-1/4 border-2 border-dashed border-gray-400 flex justify-center items-center cursor-pointer"
          onClick={handleClickToUpload}
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            ref={fileInputRef}
            className="hidden"
            name='file'
          />
          Drag and drop a PDF here or click to upload
        </div>
        <div>
            <br/>
            <hr/>
        </div>
        {isUploading && (
        <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
          <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${uploadProgress}%` }}>Uploading {uploadProgress}%</div>
        </div>
      )}
      <div className='pdfViewer'>
       {pdfFile && (
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          style={{ width: '100%', height: 'auto' }}
        >
          {Array.from(
            new Array(numPages),
            (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ),
          )}
        </Document>
        
      )}
      </div>
      </div>
      <div className="flex-1 flex flex-col p-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question"
          className="p-2 border mb-4"
        />
        <textarea
          value={answer}
          readOnly
          className="flex-1 p-2 border"
          placeholder="Answer will appear here..."
        ></textarea>
        <button onClick={handleAskQuestion} className="mt-4 bg-blue-500 text-white p-2">Ask</button>
      </div>
    </div>
  );
};

export default QuestionAnswer;
