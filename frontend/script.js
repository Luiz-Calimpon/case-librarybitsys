const API_URL = window.location.origin;

function handleErrors(response) {
    if (!response.ok) {
        return response.json().then(err => { throw err; });
    }
    return response;
}

function fetchCases() {
    fetch(`${API_URL}/cases`)
        .then(handleErrors)
        .then(response => response.json())
        .then(data => {
            renderCases(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch cases: ' + (error.error || 'Unknown error'));
        });
}

function renderCases(cases) {
    const tbody = document.getElementById('casesBody');
    tbody.innerHTML = '';
    cases.forEach(caseItem => {
        const row = `
            <tr data-id="${caseItem.id}">
                <td><input type="checkbox" class="checkbox"></td>
                <td class="case-title">${caseItem.title}</td>
                <td class="case-type">${caseItem.type}</td>
                <td class="case-no">${caseItem.case_number}</td>
                <td class="case-location">${caseItem.location}</td>
                <td>
                    <button class="edit-button" onclick="editCase('${caseItem.id}')">Edit</button>
                    <button class="delete-button" onclick="deleteCase('${caseItem.id}')">Delete</button>
                    <button class="view-btn" onclick="viewContent('${caseItem.id}')">View</button>
                </td>
            </tr>
            <tr class="case-content" data-id="${caseItem.id}" style="display: none;">
                <td colspan="6">${caseItem.content}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function searchCases() {
    const query = document.getElementById('searchInput').value;
    fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`)
        .then(handleErrors)
        .then(response => response.json())
        .then(data => {
            renderCases(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Search failed: ' + (error.error || 'Unknown error'));
        });
}

function editCase(id) {
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('passwordModal').dataset.caseId = id;
}

function confirmEdit() {
    const password = document.getElementById('passwordInput').value;
    const caseId = document.getElementById('passwordModal').dataset.caseId;
    const caseElement = document.querySelector(`tr[data-id="${caseId}"]`);
    
    const updatedCase = {
        id: caseId,
        title: caseElement.querySelector('.case-title').textContent,
        type: caseElement.querySelector('.case-type').textContent,
        case_number: caseElement.querySelector('.case-no').textContent,
        location: caseElement.querySelector('.case-location').textContent,
        content: document.querySelector(`.case-content[data-id="${caseId}"] td`).textContent
    };

    fetch(`${API_URL}/edit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Edit-Password': password
        },
        body: JSON.stringify(updatedCase),
    })
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Case edited successfully');
            fetchCases();
        } else {
            alert('Failed to edit case: ' + data.error);
        }
        closeModal('passwordModal');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to edit case: ' + (error.error || 'Unknown error'));
        closeModal('passwordModal');
    });
}

function deleteCase(id) {
    document.getElementById('deleteModal').style.display = 'block';
    document.getElementById('deleteModal').dataset.caseId = id;
}

function confirmDelete() {
    const caseId = document.getElementById('deleteModal').dataset.caseId;
    const password = prompt("Enter the edit password to confirm deletion:");

    fetch(`${API_URL}/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Edit-Password': password
        },
        body: JSON.stringify({ id: caseId }),
    })
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Case deleted successfully');
            fetchCases();
        } else {
            alert('Failed to delete case: ' + data.error);
        }
        closeModal('deleteModal');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete case: ' + (error.error || 'Unknown error'));
        closeModal('deleteModal');
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function viewContent(id) {
    const contentRow = document.querySelector(`.case-content[data-id="${id}"]`);
    contentRow.style.display = contentRow.style.display === 'none' ? 'table-row' : 'none';
}

document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
    })
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('File uploaded successfully');
            fetchCases();  // Refresh the case list after successful upload
        } else {
            throw new Error('File upload failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('File upload failed: ' + (error.error || 'Unknown error'));
    });
});

// Fetch cases on page load
window.onload = fetchCases;