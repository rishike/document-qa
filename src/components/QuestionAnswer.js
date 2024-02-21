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
    // const [presignedUrl, setPresignedUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDone, setIsDone] = useState(false);



  const S3Url = "http://localhost:8080/v1/s3fileupload/generateSignedUrl";
  const loadDocumentUrl = "http://127.0.0.1:8000/load_document";
  const askUrl = "http://127.0.0.1:8000/user_question";
  const bucketName = "rishillmstorage"

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

  const handleDocumentLoad = async (objectUrl) => {
    setIsLoading(true);
    await axios.post(loadDocumentUrl, {
      's3_presigned_url': objectUrl
      }, {
        headers: {
            "Content-Type": "application/json"
        }
      }).then(response => {
        console.log(response.data);
        setIsLoading(false); 
        setIsSuccess(true); 
        setTimeout(() => setIsSuccess(false), 3000)
    })
    .catch(error => {
        console.error('There was an error!', error);
        alert("Error !");
        setIsLoading(false);
    });
  }

  const handleAskQuestion = async () => {
    if (!question.trim()) {
        alert('Please enter a question.');
        return;
    }
    if (!pdfFile) {
        alert('Please upload a PDF file before asking a question.');
        return;
    }
    setIsProcessing(true);
    setIsDone(false); 
    try {
        const response = await axios.post(askUrl, { "question": question });
        if (response.data && response.data.answer) {
            setAnswer(response.data.answer); 
        } else {
            console.error('No answer received from the API');
            setAnswer('Sorry, I could not find an answer to your question.');
        }
        setIsDone(true); 
    } catch (error) {
        console.error('Error asking question:', error);
        setAnswer('An error occurred while trying to process your question.');
    } finally {
        setIsProcessing(false);
        setTimeout(() => setIsDone(false), 2000); 
    }
};


  const generatePresignedUrl = async () => {
    try {
      return axios.post(S3Url).then(res => {
        return res.data;
      });
    } catch (err) {
      console.error('Error generating presigned URL', err);
      return false;
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const presignedUrl = await generatePresignedUrl();
      console.log(presignedUrl);
      setIsUploading(true);
      const url = new URL(presignedUrl);
      const pdfFilename = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);

      const response = await axios.put(presignedUrl, file, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.status === 200) {
        console.log('File uploaded successfully', pdfFilename);
        const bucketUrl = `https://${bucketName}.s3.amazonaws.com/`;
        const objectUrl = bucketUrl + pdfFilename;
        handleDocumentLoad(objectUrl);
        
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
      // const response = await axios({
      //   url: pdfUrl,
      //   method: 'GET'
      // });
      // console.log(response);

      // const file = new Blob([response.data], { type: 'application/pdf' });
      // const filename = `pdf_${uuidv4()}.pdf`;
      // await uploadFile(new File(file, filename));
      handleDocumentLoad(pdfUrl);
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
      {isLoading && (
  <div className="flex justify-center items-center">
    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
  </div>
)}

{isSuccess && (
  <div className="flex justify-center items-center text-green-500">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
  </div>
)}


      <div className='pdfViewer'>

       {pdfFile && !pdfUrl && (
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
  
      {pdfUrl && (
        <div className="iframe-container" style={{ height: '500px', width: '100%' }}>
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            title="PDF Document"
          ></iframe>
         </div>
      )}
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
    <div className="flex flex-col justify-center items-center py-2">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
        <div className="text-center">Processing your question, please wait...</div>
    </div>
)}

{isDone && (
    <div className="text-center py-2 text-green-500">
        Done!
    </div>
)}

        <textarea
          value={answer}
          readOnly
          className="flex-1 p-2 border"
          placeholder="Answer will appear here..."
        ></textarea>
       <button
  onClick={handleAskQuestion}
  className={`mt-4 p-2 text-white ${isProcessing ? 'bg-blue-300' : 'bg-blue-500'}`}
  disabled={isProcessing}
>
  {isProcessing ? 'Processing...' : 'Ask'}
</button>

      </div>
    </div>
  );
};

export default QuestionAnswer;
