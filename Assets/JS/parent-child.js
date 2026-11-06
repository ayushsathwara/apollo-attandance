
/* =========================================
   APOLLO PARENT PORTAL
   MY CHILD - PROFILE JAVASCRIPT
========================================= */

const API_URL = "http://localhost/apollo-backend";
const LOGIN_URL = "http://localhost/apollo-attandance/index.html";


// Common API function
async function fetchParentData(endpoint) {

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        credentials: "include"
    });

    if (response.status === 401) {
        window.location.href = LOGIN_URL;
        throw new Error("Parent login required.");
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to load data.");
    }

    return data;
}


// Update text safely
function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent =
            value !== null && value !== undefined && value !== ""
                ? value
                : "—";
    }
}


// 1. Load Student and Parent Profile
async function loadParentProfile() {

    try {

        const data = await fetchParentData("/parent/profile.php");

        if (data.status !== "success") {
            throw new Error(data.message || "Profile not found.");
        }

        const profile = data.profile;

        // Student details
        setText("studentName", profile.student_name);
        setText("rollNo", profile.roll_no);
        setText("course", profile.course);
        setText("semester", profile.semester);

        // Parent details
        setText("parentName", profile.parent_name);
        setText("parentEmail", profile.parent_email);
        setText("parentPhone", profile.parent_phone);

        // Parent avatar
        const avatar = document.querySelector(".parent-avatar");

        if (avatar && profile.parent_name) {
            avatar.textContent =
                profile.parent_name.charAt(0).toUpperCase();
        }

        setText("profileMessage", "Profile loaded successfully.");

    } catch (error) {

        console.error("Profile Error:", error);

        setText("studentName", "Unable to load profile");
        setText("profileMessage", error.message);
    }
}


// 2. Load Attendance Summary
async function loadChildAttendance() {

    try {

        const data = await fetchParentData(
            "/parent/attendance-overview.php"
        );

        if (data.status !== "success") {
            throw new Error("Unable to load attendance.");
        }

        const summary = data.summary;

        setText("childAttendance", `${summary.percentage}%`);
        setText("childPresent", summary.present);
        setText("childAbsent", summary.absent);

    } catch (error) {

        console.error("Attendance Error:", error);

        setText("childAttendance", "—");
        setText("childPresent", "—");
        setText("childAbsent", "—");
    }
}


// 3. Load Assignment Summary
async function loadChildAssignments() {

    try {

        const data = await fetchParentData(
            "/parent/assignments.php"
        );

        if (data.status !== "success") {
            throw new Error("Unable to load assignments.");
        }

        const assignments = data.assignments || [];

        setText("childAssignments", assignments.length);

    } catch (error) {

        console.error("Assignments Error:", error);

        setText("childAssignments", "—");
    }
}


// 4. Parent Logout
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        try {

            const response = await fetch(
                `${API_URL}/auth/logout.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        role: "parent"
                    })
                }
            );

            if (!response.ok) {
                alert("Unable to log out. Please try again.");
                return;
            }

            window.location.href = LOGIN_URL;

        } catch (error) {

            console.error("Logout Error:", error);

            alert("Unable to connect to the server.");
        }
    });
}


// Load all profile information
document.addEventListener("DOMContentLoaded", function () {

    loadParentProfile();
    loadChildAttendance();
    loadChildAssignments();

});
