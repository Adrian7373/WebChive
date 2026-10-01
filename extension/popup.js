document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveBtn');
    const tagsInput = document.getElementById('tags');
    const statusDiv = document.getElementById('status');

    // Automatically focus the input so you can start typing tags immediately
    tagsInput.focus();

    saveBtn.addEventListener('click', async () => {
        try {
            saveBtn.disabled = true;
            statusDiv.textContent = 'Extracting and saving...';
            statusDiv.style.color = '#9CA3AF';

            // Retrieve the active tab's metadata
            const [tab
            ] = await chrome.tabs.query({ active: true, currentWindow: true
            });
            
            // Clean up the comma-separated tags
            const rawTags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
            const tags = rawTags.length > 0 ? rawTags : ['inbox'
            ];

            // POST to the local Express pipeline
            const response = await fetch("http://localhost:3000/api/v1/articles",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: tab.url, tags
                })
            });

            if (response.ok) {
                statusDiv.textContent = 'Archived successfully!';
                statusDiv.style.color = '#10B981'; 
                
                // Close the popup automatically after a brief success message
                setTimeout(() => window.close(),
                1200);
            } else {
                throw new Error('API rejected request');
            }
        } catch (error) {
            statusDiv.textContent = 'Error saving article. Is Express running?';
            statusDiv.style.color = '#EF4444';
            saveBtn.disabled = false;
        }
    });

    // Allow pressing 'Enter' inside the input to trigger the save
    tagsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
});