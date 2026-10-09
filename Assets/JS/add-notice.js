// ========================================
// ADD NOTICE - FACULTY
// ========================================

const API_URL = "http://localhost/apollo-backend";

const noticeForm = document.getElementById("noticeForm");
const noticeFormMessage = document.getElementById("noticeFormMessage");
const publishButton = noticeForm.querySelector(
    'button[type="submit"]'
);

// Show status message
function showNoticeMessage(message, isSuccess = false) {
    noticeFormMessage.textContent = message;

    noticeFormMessage.style.color = isSuccess
        ? "#15803d"
        : "#dc2626";
}

// Submit notice form
noticeForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("noticeTitle").value.trim();
    const message = document.getElementById("noticeMessage").value.trim();
    const targetRole = document.getElementById("targetRole").value;
    const category = document.getElementById("noticeCategory").value;

    // Validate form
    if (!title || !message) {
        showNoticeMessage("Please fill in all required fields.");
        return;
    }

    // Prevent repeated submissions
    publishButton.disabled = true;
    publishButton.textContent = "Publishing...";

    try {
        const response = await fetch(`${API_URL}/faculty/add-notice.php`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                message,
                target_role: targetRole,
                category: category
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to publish notice."
            );
        }

        showNoticeMessage(
            "Notice published successfully!",
            true
        );

        noticeForm.reset();

    } catch (error) {
        console.error("Add Notice Error:", error);

        showNoticeMessage(
            error.message || "Server error. Please try again."
        );
    } finally {
        publishButton.disabled = false;
        publishButton.textContent = "Publish Notice";
    }
});