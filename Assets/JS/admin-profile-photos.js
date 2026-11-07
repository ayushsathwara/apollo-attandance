
const API_URL = "http://localhost/apollo-backend";

document.addEventListener("DOMContentLoaded", function () {

    const accountType = document.getElementById("accountType");
    const accountSearch = document.getElementById("accountSearch");
    const searchButton = document.getElementById("searchButton");

    const accountResults = document.getElementById("accountResults");
    const searchMessage = document.getElementById("searchMessage");

    const photoEditor = document.getElementById("photoEditor");
    const selectedName = document.getElementById("selectedName");
    const selectedDetails = document.getElementById("selectedDetails");

    const photoPreview = document.getElementById("photoPreview");
    const photoStatus = document.getElementById("photoStatus");
    const profilePhoto = document.getElementById("profilePhoto");

    const savePhotoButton = document.getElementById("savePhotoButton");
    const removePhotoButton = document.getElementById("removePhotoButton");
    const photoMessage = document.getElementById("photoMessage");

    const logoutButton = document.getElementById("logoutButton");

    let selectedAccount = null;
    let originalPhoto = null;
    let previewObjectUrl = null;

    // =====================================
    // DEFAULT PROFILE IMAGE
    // =====================================

    const defaultPhoto =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
                <rect width="200" height="200" fill="#e2e8f0"/>
                <circle cx="100" cy="75" r="38" fill="#94a3b8"/>
                <path d="M25 200c5-48 32-72 75-72s70 24 75 72"
                    fill="#94a3b8"/>
            </svg>
        `);

    // =====================================
    // IMAGE URL
    // =====================================

    function getPhotoUrl(path) {

        if (!path) {
            return defaultPhoto;
        }

        const cleanPath = String(path).replace(/\\/g, "/");

        if (
            cleanPath.startsWith("http://") ||
            cleanPath.startsWith("https://")
        ) {
            return cleanPath;
        }

        return `${API_URL}/${cleanPath.replace(/^\/+/, "")}`;
    }

    // =====================================
    // SHOW MESSAGES
    // =====================================

    function showSearchMessage(message) {
        searchMessage.textContent = message;
    }

    function showPhotoMessage(message) {
        photoMessage.textContent = message;
    }

    // =====================================
    // SEARCH ACCOUNTS
    // =====================================

    async function searchAccounts() {

        const type = accountType.value;
        const query = accountSearch.value.trim();

        accountResults.innerHTML = "";
        photoEditor.hidden = true;

        selectedAccount = null;
        profilePhoto.value = "";

        showSearchMessage("");
        showPhotoMessage("");

        if (!type) {
            showSearchMessage("Please select an account type.");
            return;
        }

        if (!query) {
            showSearchMessage("Please enter a name, email or ID.");
            return;
        }

        searchButton.disabled = true;
        searchButton.textContent = "Searching...";

        try {

            const response = await fetch(
                `${API_URL}/admin/search-accounts.php?type=${encodeURIComponent(type)}&q=${encodeURIComponent(query)}`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                window.location.href = "admin-login.html";
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Account search failed.");
            }

            if (!data.accounts || data.accounts.length === 0) {
                showSearchMessage("No accounts found.");
                return;
            }

            showSearchMessage(
                `${data.accounts.length} account(s) found. Select an account.`
            );

            data.accounts.forEach(account => {

                const result = document.createElement("div");
                result.className = "account-result";

                const info = document.createElement("div");
                info.className = "account-result-info";

                const name = document.createElement("strong");
                name.textContent = account.name;

                const details = document.createElement("span");

                details.textContent =
                    `ID: ${account.id} | ${account.email}` +
                    (account.phone ? ` | ${account.phone}` : "");

                const selectButton = document.createElement("button");
                selectButton.type = "button";
                selectButton.className = "select-account-button";
                selectButton.textContent = "Select";

                selectButton.addEventListener("click", function () {
                    selectAccount(account);
                });

                info.appendChild(name);
                info.appendChild(details);

                result.appendChild(info);
                result.appendChild(selectButton);

                accountResults.appendChild(result);

            });

        } catch (error) {

            console.error("Account Search Error:", error);

            showSearchMessage(error.message);

        } finally {

            searchButton.disabled = false;
            searchButton.textContent = "Search";

        }
    }

    // =====================================
    // SELECT ACCOUNT
    // =====================================

    function selectAccount(account) {

        selectedAccount = account;
        originalPhoto = account.profile_photo || null;

        selectedName.textContent = account.name;

        selectedDetails.textContent =
            `Account ID: ${account.id} | ${account.email}`;

        photoPreview.src = getPhotoUrl(originalPhoto);

        photoStatus.textContent = originalPhoto
            ? "Current Profile Photo"
            : "No profile photo uploaded";

        photoEditor.hidden = false;

        profilePhoto.value = "";

        if (previewObjectUrl) {
            URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl = null;
        }

        showPhotoMessage("");

        photoEditor.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    // =====================================
    // PREVIEW NEW PHOTO
    // =====================================

    profilePhoto.addEventListener("change", function () {

        const file = profilePhoto.files[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {

            alert("Only JPG, PNG and WEBP images are allowed.");

            profilePhoto.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {

            alert("Photo size must not exceed 5 MB.");

            profilePhoto.value = "";
            return;
        }

        if (previewObjectUrl) {
            URL.revokeObjectURL(previewObjectUrl);
        }

        previewObjectUrl = URL.createObjectURL(file);

        photoPreview.src = previewObjectUrl;

        photoStatus.textContent = "New Photo Preview";

        showPhotoMessage("");
    });

    // =====================================
    // UPLOAD / REPLACE PHOTO
    // =====================================

    async function saveProfilePhoto() {

        if (!selectedAccount) {
            showPhotoMessage("Please select an account first.");
            return;
        }

        const file = profilePhoto.files[0];

        if (!file) {
            showPhotoMessage("Please select a new photo.");
            return;
        }

        const formData = new FormData();

        formData.append("type", accountType.value);
        formData.append("account_id", selectedAccount.id);
        formData.append("action", "upload");
        formData.append("profile_photo", file);

        savePhotoButton.disabled = true;
        savePhotoButton.textContent = "Uploading...";

        try {

            const response = await fetch(
                `${API_URL}/admin/manage-profile-photo.php`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                window.location.href = "admin-login.html";
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Photo upload failed.");
            }

            selectedAccount.profile_photo = data.profile_photo;
            originalPhoto = data.profile_photo;

            photoPreview.src =
                getPhotoUrl(data.profile_photo) +
                "?t=" + Date.now();

            photoStatus.textContent = "Profile Photo Updated";

            profilePhoto.value = "";

            if (previewObjectUrl) {
                URL.revokeObjectURL(previewObjectUrl);
                previewObjectUrl = null;
            }

            showPhotoMessage(data.message);

        } catch (error) {

            console.error("Photo Upload Error:", error);

            showPhotoMessage(error.message);

        } finally {

            savePhotoButton.disabled = false;
            savePhotoButton.textContent = "Save Profile Photo";

        }
    }

    // =====================================
    // REMOVE PHOTO
    // =====================================

    async function removeProfilePhoto() {

        if (!selectedAccount) {
            showPhotoMessage("Please select an account first.");
            return;
        }

        if (!originalPhoto) {
            showPhotoMessage("This account has no uploaded photo.");
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to remove this profile photo?"
        );

        if (!confirmed) {
            return;
        }

        const formData = new FormData();

        formData.append("type", accountType.value);
        formData.append("account_id", selectedAccount.id);
        formData.append("action", "remove");

        removePhotoButton.disabled = true;
        removePhotoButton.textContent = "Removing...";

        try {

            const response = await fetch(
                `${API_URL}/admin/manage-profile-photo.php`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                window.location.href = "admin-login.html";
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not remove photo.");
            }

            originalPhoto = null;
            selectedAccount.profile_photo = null;

            photoPreview.src = defaultPhoto;
            photoStatus.textContent = "No profile photo uploaded";

            profilePhoto.value = "";

            if (previewObjectUrl) {
                URL.revokeObjectURL(previewObjectUrl);
                previewObjectUrl = null;
            }

            showPhotoMessage(data.message);

        } catch (error) {

            console.error("Photo Removal Error:", error);

            showPhotoMessage(error.message);

        } finally {

            removePhotoButton.disabled = false;
            removePhotoButton.textContent = "Remove Photo";

        }
    }

    // =====================================
    // ADMIN LOGOUT
    // =====================================

    async function logoutAdmin() {

        try {

            const response = await fetch(
                `${API_URL}/admin/logout.php`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Logout request failed.");
            }

            window.location.href = "admin-login.html";

        } catch (error) {

            console.error("Logout Error:", error);

            alert("Could not log out. Please try again.");

        }
    }

    // =====================================
    // EVENT LISTENERS
    // =====================================

    searchButton.addEventListener("click", searchAccounts);

    accountSearch.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            searchAccounts();
        }
    });

    savePhotoButton.addEventListener("click", saveProfilePhoto);

    removePhotoButton.addEventListener("click", removeProfilePhoto);

    logoutButton.addEventListener("click", logoutAdmin);

});
