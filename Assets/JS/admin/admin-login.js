
const API_URL = "http://localhost/apollo-backend";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("adminLoginForm");
    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const loginButton = document.getElementById("adminLoginButton");
    const messageBox = document.getElementById("adminLoginMessage");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            messageBox.textContent = "Please enter your email and password.";
            messageBox.style.color = "#dc2626";
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Signing in...";
        messageBox.textContent = "";

        try {
            const response = await fetch(`${API_URL}/admin/login.php`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Login failed.");
            }

            messageBox.textContent = "Login successful! Opening dashboard...";
            messageBox.style.color = "#15803d";

            // Dashboard will be created in our next steps.
            window.location.href = "admin-dashboard.html";

        } catch (error) {
            console.error("Admin Login Error:", error);

            messageBox.textContent =
                error.message || "Unable to connect to the server.";

            messageBox.style.color = "#dc2626";
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Sign In";
        }
    });
});