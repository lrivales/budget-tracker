let db;

const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_tx', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.online) {
        uploadTx();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_tx'], 'readwrite');
    const txObjectStore = transaction.objectStore('new_tx');
    txObjectStore.add(record);
};

function uploadTx() {
    const transaction = db.transaction(['new_tx'], 'readwrite');
    const txObjectStore = transaction.objectStore('new_tx');
    const getAll = txObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_tx'], 'readwrite');
                const txObjectStore = transaction.objectStore('new_tx');
                txObjectStore.clear();
                alert('All offline transactions have been uploaded.');
            })
            .catch(err => console.log(err));
        }
    }
}

window.addEventListener('online', uploadTx);