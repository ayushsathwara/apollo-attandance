
const API_URL = "http://localhost/apollo-backend";

document.addEventListener("DOMContentLoaded", function () {
    const requestsList = document.getElementById("requestsList");
    const pageMessage = document.getElementById("pageMessage");
    const refreshButton = document.getElementById("refreshButton");

    const totalCount = document.getElementById("totalCount");
    const openCount = document.getElementById("openCount");
    const progressCount = document.getElementById("progressCount");
    const resolvedCount = document.getElementById("resolvedCount");

    async function loadSupportRequests() {
        refreshButton.disabled = true;
        refreshButton.textContent = "Loading...";
        pageMessage.textContent = "Loading support requests...";
        requestsList.replaceChildren();

        try {
            const response = await fetch(
                `${API_URL}/admin/support-requests.php`,
                { credentials: "include" }
            );

            const data = await response.json();

            if (response.status === 401) {
                window.location.href = "admin-login.html";
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Could not load support requests."
                );
            }

            const requests = data.requests || [];

            totalCount.textContent = requests.length;
            openCount.textContent = requests.filter(
                request => request.status === "Open"
            ).length;
            progressCount.textContent = requests.filter(
                request => request.status === "In Progress"
            ).length;
            resolvedCount.textContent = requests.filter(
                request => request.status === "Resolved"
            ).length;

            if (requests.length === 0) {
                pageMessage.textContent =
                    "No support requests have been submitted yet.";
                return;
            }

            pageMessage.textContent =
                `Showing ${requests.length} support request(s).`;

            requests.forEach(function (request) {
                const card = document.createElement("article");
                card.className = "request-card";

                const top = document.createElement("div");
                top.className = "request-top";

                const details = document.createElement("div");

                const title = document.createElement("h3");
                title.textContent = request.subject;

                const meta = document.createElement("p");
                meta.className = "request-meta";
                meta.textContent =
                    `Request #${request.id} · Student: ` +
                    `${request.student_name || "Unknown student"} ` +
                    `(ID: ${request.student_id})`;

                const date = document.createElement("p");
                date.className = "request-meta";
                date.textContent =
                    `Submitted: ${request.created_at}`;

                const category = document.createElement("span");
                category.className = "request-category";
                category.textContent = request.category;

                details.append(title, meta, date, category);
                top.appendChild(details);

                const message = document.createElement("p");
                message.className = "request-message";
                message.textContent = request.message;

                const footer = document.createElement("div");
                footer.className = "request-footer";

                const label = document.createElement("label");
                label.textContent = "Request status";

                const select = document.createElement("select");
                select.className = "status-select";
                select.setAttribute(
                    "aria-label",
                    `Status for request ${request.id}`
                );

                ["Open", "In Progress", "Resolved"].forEach(status => {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status;
                    select.appendChild(option);
                });

                select.value = request.status;
                select.dataset.requestId = request.id;

                select.addEventListener("change", updateRequestStatus);

                label.htmlFor = `status-${request.id}`;
                select.id = `status-${request.id}`;

                footer.append(label, select);
                card.append(top, message, footer);
                requestsList.appendChild(card);
            });

        } catch (error) {
            console.error("Support Requests Error:", error);
            pageMessage.textContent =
                error.message || "Unable to load support requests.";
        } finally {
            refreshButton.disabled = false;
            refreshButton.textContent = "Refresh";
        }
    }

    async function updateRequestStatus(event) {
        const select = event.target;
        const requestId = Number(select.dataset.requestId);
        const newStatus = select.value;

        select.disabled = true;
        pageMessage.textContent = `Updating request #${requestId}...`;

        try {
            const response = await fetch(
                `${API_URL}/admin/update-support-status.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        request_id: requestId,
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                window.location.href = "admin-login.html";
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Could not update request status."
                );
            }

            pageMessage.textContent =
                `Request #${requestId} updated to ${newStatus}.`;

            await loadSupportRequests();

        } catch (error) {
            console.error("Status Update Error:", error);
            pageMessage.textContent =
                error.message || "Unable to update request status.";

            await loadSupportRequests();

        } finally {
            select.disabled = false;
        }
    }

    refreshButton.addEventListener("click", loadSupportRequests);

    loadSupportRequests();
});