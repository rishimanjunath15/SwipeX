import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import apiClient from '../lib/api';

/**
 * ResumeUpload Component
 * Handles resume file upload (PDF or DOCX)
 */
export default function ResumeUpload({ onUploadSuccess, onUploadError }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    
    if (!selectedFile) {
      return;
    }

    // Check file type
    const allowedTypes = ['.pdf', '.docx', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const fileExt = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (fileExt !== '.pdf' && fileExt !== '.docx') {
      setError('Only PDF/DOCX allowed. Please upload a supported resume.');
      return;
    }

    // Check file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await apiClient.post('/api/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Success - pass data to parent
      onUploadSuccess(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to upload resume. Please try again.';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>
          Upload your resume in PDF or DOCX format to begin the interview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            {file ? (
              <>
                <FileText size={48} className="text-primary" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </>
            ) : (
              <>
                <Upload size={48} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF or DOCX • Max 10MB
                  </p>
                </div>
              </>
            )}
            
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => document.getElementById('resume-upload').click()}
              className="cursor-pointer"
            >
              {file ? 'Change File' : 'Select File'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Uploading...
            </>
          ) : (
            'Upload Resume'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
