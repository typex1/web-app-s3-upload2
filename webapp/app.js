document.addEventListener('DOMContentLoaded', () => {
    // API endpoint for getting pre-signed URL (will be replaced during deployment)
    const API_ENDPOINT = 'API_ENDPOINT_PLACEHOLDER';
    
    // DOM elements
    const fileInput = document.getElementById('file-input');
    const fileName = document.getElementById('file-name');
    const uploadButton = document.getElementById('upload-button');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const statusMessage = document.getElementById('status-message');
    
    // Selected file
    let selectedFile = null;
    
    // Event listeners
    fileInput.addEventListener('change', handleFileSelect);
    uploadButton.addEventListener('click', handleUpload);
    
    // Handle file selection
    function handleFileSelect(event) {
        selectedFile = event.target.files[0];
        
        if (selectedFile) {
            fileName.textContent = selectedFile.name;
            uploadButton.disabled = false;
            resetUI();
        } else {
            fileName.textContent = 'No file chosen';
            uploadButton.disabled = true;
        }
    }
    
    // Handle file upload
    async function handleUpload() {
        if (!selectedFile) {
            showStatus('Please select a file first.', 'error');
            return;
        }
        
        try {
            resetUI();
            uploadButton.disabled = true;
            progressContainer.classList.remove('hidden');
            
            // Step 1: Get pre-signed URL from API Gateway
            const presignedUrl = await getPresignedUrl(selectedFile);
            
            // Step 2: Upload file to S3 using the pre-signed URL
            await uploadFileToS3(presignedUrl.uploadUrl, selectedFile);
            
            // Success
            showStatus(`File "${selectedFile.name}" uploaded successfully!`, 'success');
            fileInput.value = '';
            fileName.textContent = 'No file chosen';
            selectedFile = null;
        } catch (error) {
            console.error('Upload error:', error);
            showStatus(`Upload failed: ${error.message}`, 'error');
            uploadButton.disabled = false;
        }
    }
    
    // Get pre-signed URL from API Gateway
    async function getPresignedUrl(file) {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get pre-signed URL: ${errorText}`);
        }
        
        return response.json();
    }
    
    // Upload file to S3 using pre-signed URL
    async function uploadFileToS3(presignedUrl, file) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    updateProgress(percentComplete);
                }
            });
            
            // Handle response
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    updateProgress(100);
                    resolve();
                } else {
                    reject(new Error(`HTTP Error: ${xhr.status}`));
                }
            });
            
            xhr.addEventListener('error', () => {
                reject(new Error('Network error occurred'));
            });
            
            xhr.addEventListener('abort', () => {
                reject(new Error('Upload aborted'));
            });
            
            // Open connection and send the file
            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });
    }
    
    // Update progress bar
    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
    }
    
    // Show status message
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message';
        
        if (type) {
            statusMessage.classList.add(type);
        }
    }
    
    // Reset UI elements
    function resetUI() {
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
    }
});