
const API_URL = "http://localhost/apollo-backend";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("feedbackForm");
    const ratingInput = document.getElementById("feedbackRating");
    const feedbackInput = document.getElementById("feedbackMessage");
    const submitButton = document.getElementById("feedbackSubmit");
    const messageBox = document.getElementById("feedbackFormMessage");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const rating = Number(ratingInput.value);
        const feedback = feedbackInput.value.trim();

        if (!rating || rating < 1 || rating > 5) {
            messageBox.textContent = "Please select a rating.";
            messageBox.style.color = "#dc2626";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
        messageBox.textContent = "";

        try {
            const response = await fetch(
                `${API_URL}/student/submit-feedback.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        rating: rating,
                        feedback: feedback
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to submit feedback.");
            }

            messageBox.textContent = data.message;
            messageBox.style.color = "#15803d";

            form.reset();

        } catch (error) {
            console.error("Feedback Error:", error);

            messageBox.textContent =
                error.message || "Something went wrong. Please try again.";

            messageBox.style.color = "#dc2626";

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit Feedback";
        }
    });
});