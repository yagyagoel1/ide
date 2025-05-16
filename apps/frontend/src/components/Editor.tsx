import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
// import dotenv from "dotenv"
const languages = [
  { value: 'node', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
]
// dotenv.config()

export default function CodeEditor() {
  const [code, setCode] = useState('console.log("Hello, World!");');
  const [language, setLanguage] = useState('node');
  const [input, setInput] = useState('');
  const [data, setData] = useState<any>(null);
  const handleRun = async () => {
    const payload = {
      code,
      language,
      input: input.trim()||" ",
    };
    console.log('Running code:', payload);
    toast.success('Running code...');
    try{
    const response = await axios.post(`https://bf5c-2401-4900-1c61-29e7-4a24-a0f9-a049-5db2.ngrok-free.app/api/v2/submissions/create`, payload);
    console.log('Response:', response.data);
    const taskId = response.data.data;
    // Poll the API to get the status of the job
    const interval = setInterval(async () => {
      try{
      const statusResponse = await axios.post(`https://bf5c-2401-4900-1c61-29e7-4a24-a0f9-a049-5db2.ngrok-free.app/api/v2/submissions/isdone`,{token:taskId});
      console.log('Status:', statusResponse.data);
      if (statusResponse.data.message === 'Submission completed') {
        clearInterval(interval);
        console.log('Job completed:', statusResponse.data.data);
        setData(statusResponse.data.data);
        toast.success("Execution completed");
      }
      else if (statusResponse.data.message === 'Submission failed') {
        console.log('Job failed:', statusResponse.data);
        clearInterval(interval);
        setData({dockerError:"there was some error in the code"});
        toast.error("Execution failed");
      }else{
        console.log('Job is still in progress:', statusResponse.data);
      }
    }catch(err){
      clearInterval(interval);
      setData({dockerError:"there was some error in the code"});
      toast.error("Execution failed");
    }
  }, 1000);
  
}catch(err){
  console.log(err);
  toast.error("Execution failed");
}}

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div className="flex items-center space-x-4">
          <select
            value={language}
            onChange={(e) =>{ setLanguage(e.target.value)
              return  e.target.value==="python"?setCode("print('Hello, World!')"):setCode("console.log('Hello, World!')")}}
            className="bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleRun}
          className="flex items-center space-x-2 px-6 py-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          <Play size={18} />
          <span>Run</span>
        </button>
      </div>

      <div className="flex-1 grid" style={{ gridTemplateRows: '2fr 0.5fr' }}> {/* Adjust grid template rows */}
        <div className="relative">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

       {!data&& <div className="border-t border-gray-700 bg-gray-800 p-4">
          <div className="h-32 flex flex-col">
            <label className="text-sm text-gray-400 mb-2">Program Input:</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-gray-900 text-white p-3 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your program input here..."
            />
          </div>
        </div>}
        {data && (
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <div className="h-full flex flex-col">
            <label className="text-sm text-gray-400 mb-2">Output:</label>
            <pre className="flex-1 bg-gray-900 text-white p-3 rounded-md overflow-auto" style={{ maxHeight: '200px' }}>
              {data.dockerData + "\n" + data.dockerError}
            </pre>
          </div>
        </div>
      )}
      </div>
     
    </div>
  );
}