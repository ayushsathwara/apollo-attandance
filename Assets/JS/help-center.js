
const API_URL = "http://localhost/apollo-backend";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("supportForm");

    if (!form) return;

    const messageBox = document.getElementById("supportFormMessage");
    const submitButton = document.getElementById("supportSubmit");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const category = document.getElementById("supportCategory").value;
        const subject = document.getElementById("supportSubject").value.trim();
        const message = document.getElementById("supportMessage").value.trim();

        if (!category || !subject || !message) {
            messageBox.textContent = "Please fill in all required fields.";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
        messageBox.textContent = "";

        try {
            const response = await fetch(
                `${API_URL}/student/submit-support.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        category,
                        subject,
                        message
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to submit request.");
            }

            messageBox.textContent = data.message;
            messageBox.style.color = "#15803d";
            form.reset();

        } catch (error) {
            console.error("Support Request Error:", error);
            messageBox.textContent =
                error.message || "Unable to submit request.";
            messageBox.style.color = "#dc2626";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit Support Request";
        }
    });
});