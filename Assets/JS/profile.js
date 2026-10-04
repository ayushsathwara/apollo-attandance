document.addEventListener("DOMContentLoaded", async function () {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/student/profile.php"
        );

        const data = await response.json();

        console.log("Profile Data:", data);

        if (data.status !== "success") {

            alert(data.message || "Unable to load profile.");

            return;
        }


        const student = data.student;


        // =========================
        // BASIC STUDENT DATA
        // =========================

        const name = student.name || "Student";
        const roll = student.roll_no || "—";
        const email = student.email || "—";
        const course = student.course || "—";
        const semester = student.semester || "—";


        // =========================
        // HEADER
        // =========================

        document.getElementById("headerName").textContent =
            name.split(" ")[0];

        document.getElementById("miniName").textContent =
            name;


        // =========================
        // AVATAR
        // =========================

        const firstLetter =
            name.charAt(0).toUpperCase();

        document.getElementById("profileInitial").textContent =
            firstLetter;

        document.getElementById("miniAvatar").textContent =
            firstLetter;


        // =========================
        // PROFILE HERO
        // =========================

        document.getElementById("profileName").textContent =
            name;

        document.getElementById("profileRoll").textContent =
            roll;

        document.getElementById("profileCourse").textContent =
            course;

        document.getElementById("profileEmail").textContent =
            email;


        // =========================
        // PERSONAL INFORMATION
        // =========================

        document.getElementById("personalName").textContent =
            name;

        document.getElementById("personalRoll").textContent =
            roll;

        document.getElementById("personalEmail").textContent =
            email;

        document.getElementById("personalCourse").textContent =
            course;

        document.getElementById("personalSemester").textContent =
            semester;


        // =========================
        // ACADEMIC DETAILS
        // =========================

        document.getElementById("academicCourse").textContent =
            course;

        document.getElementById("academicSemester").textContent =
            semester;


        // =========================
        // CURRENT YEAR
        // =========================

        if (Number(semester) <= 2) {

            document.getElementById("currentYear").textContent =
                "1st Year";

        } else if (Number(semester) <= 4) {

            document.getElementById("currentYear").textContent =
                "2nd Year";

        } else {

            document.getElementById("currentYear").textContent =
                "3rd Year";
        }


    } catch (error) {

        console.error("Profile Error:", error);

        alert("Unable to connect to server.");

    }

});


function editProfile() {

    alert(
        "Edit Profile will be available after we add the profile update system."
    );

}