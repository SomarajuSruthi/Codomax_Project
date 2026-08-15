const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault(); message.textContent = "";
    try {
        const response = await fetch("/api/users/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: document.getElementById("name").value.trim(), email: document.getElementById("email").value.trim(), password: document.getElementById("password").value }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message);
        message.textContent = "Registration successful. Redirecting to login…";
        setTimeout(() => { window.location.href = "login.html"; }, 900);
    } catch (error) { message.textContent = error.message || "Unable to connect to backend."; }
});
