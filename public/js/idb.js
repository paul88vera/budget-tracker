let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_tran", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadTran();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(tran) {
  const transaction = db.transaction(["new_tran"], "readwrite");

  const tranObjectStore = transaction.objectStore("new_tran");

  tranObjectStore.add(tran);

  return transaction.complete;
};

function uploadTran() {
  const transaction = db.transaction(["new_tran"], "readwrite");

  const tranObjectStore = transaction.objectStore("new_tran");

  const getAll = tranObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["new_tran"], "readwrite");
          const tranObjectStore = transaction.objectStore("new_tran");
          tranObjectStore.clear();

          alert("All saved transactions have been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadTran);
