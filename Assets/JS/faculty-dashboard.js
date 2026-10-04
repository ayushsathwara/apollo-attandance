document.addEventListener("DOMContentLoaded", function () {

    loadFacultyProfile();
    setupLogout();

});


async function loadFacultyProfile() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/profile.php"
        );

        const data = await response.json();

        console.log("Faculty Data:", data);


        if (data.status !== "success") {

            alert(data.message || "Unable to load faculty profile.");

            return;
        }


        const faculty = data.faculty;

        const name = faculty.name || "Faculty";
        const employeeId = faculty.employee_id || "—";
        const email = faculty.email || "—";
        const department = faculty.department || "—";


        // Header name
        document.getElementById("facultyName").textContent =
            name;


        // Welcome name
        document.getElementById("welcomeName").textContent =
            name;


        // Faculty initial
        document.getElementById("facultyInitial").textContent =
            name.charAt(0).toUpperCase();


        // Information cards
        document.getElementById("infoName").textContent =
            name;

        document.getElementById("infoEmployeeId").textContent =
            employeeId;

        document.getElementById("infoEmail").textContent =
            email;

        document.getElementById("infoDepartment").textContent =
            department;


    } catch (error) {

        console.error("Faculty Profile Error:", error);

        alert("Unable to connect to server.");

    }

}


function setupLogout() {

    const logoutBtn =
        document.getElementById("logoutBtn");


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener("click", async function () {

        try {

            const response = await fetch(
                "http://localhost/apollo-backend/auth/logout.php"
            );

            const result = await response.text();

            console.log("Logout:", result);


            window.location.href =
                "http://localhost/apollo-attandance/index.html";


        } catch (error) {

            console.error("Logout Error:", error);

            alert("Unable to logout.");

        }

    });

}