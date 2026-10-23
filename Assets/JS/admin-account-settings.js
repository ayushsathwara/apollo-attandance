

const API_URL =
    window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
        ? "http://localhost/apollo-backend"
        : "http://localhost/apollo-backend";


const accountForm = document.getElementById("accountForm");
const message = document.getElementById("message");
const updateBtn = document.getElementById("updateBtn");

accountForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const accountType = document.getElementById("accountType").value;
    const accountId = document.getElementById("accountId").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "";
    updateBtn.disabled = true;
    updateBtn.textContent = "Updating...";

    try {
        const response = await fetch(`${API_URL}/admin/update-account.php`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                account_type: accountType,
                account_id: Number(accountId),
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not update account.");
        }

        message.textContent = data.message;
        message.style.color = "green";

        accountForm.reset();

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";
        console.error("Account update error:", error);
    } finally {
        updateBtn.disabled = false;
        updateBtn.textContent = "Update Account";
    }
});

const accountSearch = document.getElementById("accountSearch");
const accountResults = document.getElementById("accountResults");
const accountTypeSelect = document.getElementById("accountType");
const accountIdInput = document.getElementById("accountId");

let searchTimeout;

async function searchAccounts() {
    const type = accountTypeSelect.value;
    const query = accountSearch.value.trim();

    accountResults.replaceChildren();

    if (!type || query.length < 2) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/admin/search-accounts.php?type=${encodeURIComponent(type)}&q=${encodeURIComponent(query)}`,
            { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Search failed.");
        }

        if (data.accounts.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "No accounts found.";
            accountResults.appendChild(emptyMessage);
            return;
        }

        data.accounts.forEach(account => {
            const resultButton = document.createElement("button");
            resultButton.type = "button";
            resultButton.className = "account-result";
            resultButton.textContent =
                `${account.name} — ${account.email} (ID: ${account.id})`;

            resultButton.addEventListener("click", () => {
                accountIdInput.value = account.id;
                document.getElementById("email").value = account.email;
                accountResults.replaceChildren();
                accountSearch.value = `${account.name} — ${account.email}`;
            });

            accountResults.appendChild(resultButton);
        });

    } catch (error) {
        console.error("Account search error:", error);
        const errorMessage = document.createElement("p");
        errorMessage.textContent = error.message;
        accountResults.appendChild(errorMessage);
    }
}

accountSearch.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchAccounts, 300);
});

accountTypeSelect.addEventListener("change", () => {
    accountSearch.value = "";
    accountIdInput.value = "";
    document.getElementById("email").value = "";
    accountResults.replaceChildren();
});


const myAdminForm = document.getElementById("myAdminForm");

if (myAdminForm) {
    myAdminForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const currentPassword =
            document.getElementById("adminCurrentPassword").value;
        const newEmail =
            document.getElementById("adminNewEmail").value.trim();
        const newPassword =
            document.getElementById("adminNewPassword").value;
        const confirmPassword =
            document.getElementById("adminConfirmPassword").value;
        const adminMessage =
            document.getElementById("myAdminMessage");
        const submitButton =
            document.getElementById("myAdminUpdateBtn");

        adminMessage.textContent = "";

        if (newPassword !== confirmPassword) {
            adminMessage.textContent = "New passwords do not match.";
            adminMessage.style.color = "red";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Updating...";

        try {
            const response = await fetch(
                `${API_URL}/admin/update-my-account.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newEmail,
                        newPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Account update failed.");
            }

            adminMessage.textContent = data.message;
            adminMessage.style.color = "green";
            myAdminForm.reset();

        } catch (error) {
            adminMessage.textContent = error.message;
            adminMessage.style.color = "red";
            console.error("Admin account update error:", error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Update My Account";
        }
    });
}
