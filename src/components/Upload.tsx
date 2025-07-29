'use client';

import { useState, FormEvent } from 'react';

export default function FileUpload() {
  // State to hold the selected file
  const [file, setFile] = useState<File | null>(null);
  // State to manage loading status
  const [uploading, setUploading] = useState(false);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);
  // State to store the URL of the uploaded image
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  /**
   * Handles the form submission.
   * @param e - The form event.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadedImageUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // If response is not OK, throw an error with details from the server
        throw new Error(data.error || 'Something went wrong');
      }

      // Construct the image URL using the filename returned from the API
      const imageUrl = `/api/image/${data.filename}`;
      setUploadedImageUrl(imageUrl);

    } catch (err: any) {
      // Set the error message to display to the user
      setError(err.message);
      console.error('Upload failed:', err);
    } finally {
      // Reset loading state regardless of outcome
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Upload an Image</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept="image/*" // Accept only image files
          />
        </div>
        
        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {/* Display error messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Display the uploaded image */}
      {uploadedImageUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Successful!</h3>
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={uploadedImageUrl} 
              alt="Uploaded content" 
              className="w-full h-auto object-cover"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Image URL: <a href={uploadedImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{uploadedImageUrl}</a>
          </p>
        </div>
      )}
    </div>
  );
}
