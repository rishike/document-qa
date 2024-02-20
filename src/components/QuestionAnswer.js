import React, { useRef, useState } from 'react';
import axios from 'axios';
import { pdfjs } from 'react-pdf';
import { Document, Page } from 'react-pdf';
import { v4 as uuidv4 } from 'uuid';

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
    const [pdfUrl, setPdfUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

  const S3Url = "http://127.0.0.1:8000/load_document";
  const askUrl = "http://127.0.0.1:8000/user_question";

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
    setIsProcessing(true); 
    // const filename = pdfFile.name;
    try {
        
        const response = await axios.post(askUrl, {
          "question":question,
          // "filename" : filename
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
      } finally {
        setIsProcessing(false);
      }
  };

  const uploadFile = async (file) => {
    // const formData = new FormData();
    // formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await axios.post(S3Url, {
      "s3_presigned_url" : pdfUrl 
      }, {
        headers: {
          'Content-Type': 'application/json',
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

  const handleUrlSubmit = async () => {
    if (!pdfUrl.trim()) {
      alert('Please enter a valid PDF URL.')
    }
    try {
      setIsUploading(true);
      const response = await axios({
        url: pdfUrl,
        method: 'GET',
        responseType: 'blob',
      });

      const file = new Blob([response.data], { type: 'application/pdf' });
      const filename = `pdf_${uuidv4()}.pdf`;
      await uploadFile(new File([file], filename, { type: 'application/pdf' }));
      setPdfFile(pdfUrl);
    } catch (error) {
      console.error('Error Downloading or uploading file :', error)
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col justify-center items-center border-r">
        <div
          className="w-3/4 h-1/4 border-2 border-dashed border-gray-400 flex justify-center items-center cursor-pointer p-2"
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
            name="file"
          />
          Drag and drop a PDF here or click to upload
        </div>
        <div className="flex-2 flex-col p-2">
          <input type="text" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)}
          placeholder="Enter PDF URL"
          className="p-1 border mb-1"
          />
          <button onClick={handleUrlSubmit} className="mb-2 bg-blue-500 text-white p-1">Upload from URL</button>
        </div>
        <div>
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
      {/* {pdfUrl && (
        <div className="iframe-container" style={{ height: '500px', width: '100%' }}>
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            title="PDF Document"
          ></iframe>
        </div>
      )} */}
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
        {isProcessing && (
        <div className="text-center py-2">
          <b>Processing your question, please wait ...</b>
        </div>
      )}
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
