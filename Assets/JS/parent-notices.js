/* =========================================
   APOLLO PARENT PORTAL
   Notices Page JavaScript
========================================= */

const API_URL = "http://localhost/apollo-backend";
const LOGIN_URL = "http://localhost/apollo-attandance/index.html";


// Format date
function formatNoticeDate(dateValue) {
    if (!dateValue) return "Date not available";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// Fetch parent notices
async function loadParentNotices() {

    const noticesList = document.getElementById("noticesList");
    const noticeTotal = document.getElementById("noticeTotal");
    const latestNoticeDate = document.getElementById("latestNoticeDate");
    const noticesMessage = document.getElementById("noticesMessage");

    try {

        const response = await fetch(
            `${API_URL}/parent/notices.php`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (response.status === 401) {
            window.location.href = LOGIN_URL;
            return;
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || "Unable to load notices.");
        }

        const notices = data.notices || [];

        // Total notices
        if (noticeTotal) {
            noticeTotal.textContent = notices.length;
        }

        // Empty notices
        if (notices.length === 0) {

            if (latestNoticeDate) {
                latestNoticeDate.textContent = "No notices yet";
            }

            noticesList.innerHTML = `
                <div class="empty-state">
                    <h3>No Notices Available</h3>
                    <p>There are currently no announcements from the college.</p>
                </div>
            `;

            if (noticesMessage) {
                noticesMessage.textContent = "You are all caught up!";
            }

            return;
        }

        // Latest notice date
        if (latestNoticeDate) {
            latestNoticeDate.textContent =
                formatNoticeDate(notices[0].created_at);
        }

        if (noticesMessage) {
            noticesMessage.textContent =
                `You have ${notices.length} college announcement(s).`;
        }

        // Display notices
        noticesList.innerHTML = notices.map(notice => {

            const title = notice.title || "Untitled Notice";
            const message = notice.message || "No description available.";
            const postedBy = notice.posted_by || "College Administration";
            const date = formatNoticeDate(notice.created_at);

            return `
                <article class="notice-card">

                    <div class="notice-card-header">
                        <div class="notice-icon">
                            <i class="fas fa-bullhorn"></i>
                        </div>

                        <div class="notice-heading">
                            <h3>${escapeHTML(title)}</h3>
                            <span class="notice-date">
                                <i class="far fa-calendar-alt"></i>
                                ${escapeHTML(date)}
                            </span>
                        </div>
                    </div>

                    <div class="notice-message">
                        ${escapeHTML(message).replace(/\n/g, "<br>")}
                    </div>

                    <div class="notice-posted-by">
                        <i class="fas fa-user-tie"></i>
                        Posted by: ${escapeHTML(postedBy)}
                    </div>

                </article>
            `;

        }).join("");

    } catch (error) {

        console.error("Notices Error:", error);

        if (noticesList) {
            noticesList.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to Load Notices</h3>
                    <p>Please refresh the page and try again.</p>
                </div>
            `;
        }

        if (noticesMessage) {
            noticesMessage.textContent = "Something went wrong while loading notices.";
        }
    }
}


// Prevent HTML injection in notice content
function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


// Parent logout
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        try {

            await fetch(`${API_URL}/auth/logout.php`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    role: "parent"
                })
            });

        } catch (error) {
            console.error("Logout Error:", error);
        }

        window.location.href = LOGIN_URL;
    });
}


// Load notices
document.addEventListener("DOMContentLoaded", function () {
    loadParentNotices();
});