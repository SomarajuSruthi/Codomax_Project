fetch("http://localhost:5000/api/test")
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.log("Error:", error);
    });