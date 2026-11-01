
document.addEventListener("DOMContentLoaded", async function () {

    const API_URL = "http://localhost/apollo-backend/student/profile.php";

    // Get element safely
    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value ?? "—";
        }
    }

    try {

        const response = await fetch(API_URL, {
            credentials: "include"
        });

        const data = await response.json();

        console.log("Profile Data:", data);

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Unable to load profile.");
        }

        const student = data.student;

        // =========================
        // STUDENT BASIC INFORMATION
        // =========================

        const name = student.name || "Student";
        const roll = student.roll_no || "—";
        const email = student.email || "—";
        const course = student.course || "—";
        const semester = Number(student.semester);
        const studentId = student.id || "—";

        const firstLetter = name.trim().charAt(0).toUpperCase() || "S";

        // =========================
        // HEADER
        // =========================

        setText("headerName", name.split(" ")[0]);
        setText("miniName", name);

        // =========================
        // PROFILE AVATAR
        // =========================

        setText("profileInitial", firstLetter);
        setText("miniAvatar", firstLetter);

        // =========================
        // PROFILE PHOTO
        // =========================

        const profilePhoto = document.getElementById("profilePhoto");
        const profileInitial = document.getElementById("profileInitial");

        if (student.profile_photo && profilePhoto) {

            const photoPath = student.profile_photo;

            // Use the stored relative upload path.
            const photoURL = photoPath.startsWith("http")
                ? photoPath
                : "http://localhost/apollo-backend/" + photoPath.replace(/^\/+/, "");

            profilePhoto.onload = function () {
                profilePhoto.hidden = false;
                profileInitial.style.display = "none";
            };

            profilePhoto.onerror = function () {
                profilePhoto.hidden = true;
                profileInitial.style.display = "flex";
            };

            profilePhoto.src = photoURL;

        } else if (profilePhoto) {

            profilePhoto.hidden = true;
            profileInitial.style.display = "flex";

        }

        // =========================
        // PROFILE HERO
        // =========================

        setText("profileName", name);
        setText("profileRoll", roll);
        setText("profileCourse", course);
        setText("profileEmail", email);

        // =========================
        // PERSONAL INFORMATION
        // =========================

        setText("personalName", name);
        setText("personalId", studentId);
        setText("personalRoll", roll);
        setText("personalEmail", email);

        // =========================
        // ACADEMIC DETAILS
        // =========================

        setText("academicCourse", course);

        if (Number.isFinite(semester) && semester > 0) {

            setText("academicSemester", "Semester " + semester);

            let currentYear = "";
            let yearNumber = 0;

            if (semester <= 2) {
                currentYear = "1st Year";
                yearNumber = 1;
            } else if (semester <= 4) {
                currentYear = "2nd Year";
                yearNumber = 2;
            } else if (semester <= 6) {
                currentYear = "3rd Year";
                yearNumber = 3;
            } else {
                currentYear = "Semester " + semester;
            }

            setText("currentYear", currentYear);

            // Academic year is calculated from the current calendar year.
            const today = new Date();
            const month = today.getMonth(); // January = 0

            // Assumption: academic year starts in June.
            const startYear = month >= 5
                ? today.getFullYear()
                : today.getFullYear() - 1;

            const academicStart = startYear + (yearNumber - 1);
            const academicEnd = academicStart + 1;

            setText(
                "academicYear",
                yearNumber > 0
                    ? academicStart + " - " + academicEnd
                    : "—"
            );

        } else {

            setText("academicSemester", "—");
            setText("currentYear", "—");
            setText("academicYear", "—");

        }

    } catch (error) {

        console.error("Profile Error:", error);

        alert(error.message || "Unable to load student profile.");

    }

});

