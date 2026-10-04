document.addEventListener("DOMContentLoaded", function () {

    loadAttendance();

});


async function loadAttendance() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/student/attendance.php"
        );

        const data = await response.json();

        console.log("Attendance Data:", data);

        if (data.status !== "success") {

            alert(data.message || "Unable to load attendance.");

            return;
        }

        const attendance = data.attendance;

        if (attendance.length === 0) {

            document.getElementById("subjectList").innerHTML =
                "<p>No attendance records found.</p>";

            return;
        }

        calculateAttendance(attendance);

    } catch (error) {

        console.error("Attendance Error:", error);

        alert("Unable to connect to server.");

    }

}


function calculateAttendance(attendance) {

    let totalLectures = attendance.length;

    let presentLectures = attendance.filter(function (record) {

        return record.status === "Present";

    }).length;


    let overallPercentage =
        (presentLectures / totalLectures) * 100;


    overallPercentage =
        overallPercentage.toFixed(2);


    document.getElementById(
        "overallPercentage"
    ).textContent =
        overallPercentage + "%";


    document.getElementById(
        "circlePercentage"
    ).textContent =
        Math.round(overallPercentage) + "%";


    if (overallPercentage >= 75) {

        document.getElementById(
            "attendanceMessage"
        ).textContent =
            "Good Attendance";

    } else {

        document.getElementById(
            "attendanceMessage"
        ).textContent =
            "Attendance is below 75%";

    }


    showSubjectAttendance(attendance);

}


function showSubjectAttendance(attendance) {

    const subjectList =
        document.getElementById("subjectList");

    subjectList.innerHTML = "";


    const subjects = {};


    attendance.forEach(function (record) {

        if (!subjects[record.subject]) {

            subjects[record.subject] = {
                total: 0,
                present: 0
            };

        }


        subjects[record.subject].total++;


        if (record.status === "Present") {

            subjects[record.subject].present++;

        }

    });


    Object.keys(subjects).forEach(function (subject) {

        const total =
            subjects[subject].total;

        const present =
            subjects[subject].present;


        const percentage =
            ((present / total) * 100).toFixed(2);


        const card =
            document.createElement("div");

        card.className = "subject-card";


        card.innerHTML = `

            <div>

                <h3>${subject}</h3>

                <p>
                    ${present} Present /
                    ${total} Lectures
                </p>

            </div>

            <strong>
                ${percentage}%
            </strong>

        `;


        subjectList.appendChild(card);

    });

}