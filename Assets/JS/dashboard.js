/* ================================
   SEARCH
================================ */

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchValue =
            this.value.toLowerCase();

        document.querySelectorAll(".menu-item").forEach(function (item) {

            if (
                item.textContent
                    .toLowerCase()
                    .includes(searchValue)
            ) {

                item.style.opacity = "1";

            } else {

                item.style.opacity = "0.45";

            }

        });

    });

}


/* ================================
   NOTIFICATION
================================ */

const notificationBtn =
    document.getElementById("notificationBtn");

if (notificationBtn) {

    notificationBtn.addEventListener("click", function () {

        alert("You have 3 new notifications.");

    });

}


/* ================================
   ATTENDANCE OVERVIEW
================================ */

async function loadAttendanceOverview() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/student/attendance.php",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        console.log("Attendance API Response:", data);

        console.log("Dashboard Attendance:", data);


        /* Check API response */

        if (data.status !== "success") {

            console.error(
                data.message || "Unable to load attendance."
            );

            return;
        }


        const attendance = data.attendance || [];


        /* ================================
           CALCULATE ATTENDANCE
        ================================= */

        let present = 0;
        let absent = 0;


        attendance.forEach(function (record) {

            if (record.status === "Present") {

                present++;

            }
            else if (record.status === "Absent") {

                absent++;

            }

        });


        const total = present + absent;


        /* Calculate percentage */

        let percentage = 0;

        if (total > 0) {

            percentage =
                (present / total) * 100;

        }


        /* Round to 2 decimal places */

        percentage =
            Math.round(percentage * 100) / 100;

        /* ================================
UPDATE TOP ATTENDANCE CARD
================================ */

        const dashboardAttendance =
            document.getElementById("dashboardAttendance");

        const attendanceProgress =
            document.getElementById("attendanceProgress");

        const attendanceMessage =
            document.getElementById("attendanceMessage");


        if (dashboardAttendance) {

            dashboardAttendance.textContent =
                percentage + "%";

        }


        if (attendanceProgress) {

            attendanceProgress.style.width =
                percentage + "%";

        }


        /* Attendance message */

        if (attendanceMessage) {

            if (percentage >= 75) {

                attendanceMessage.textContent =
                    "Good Job!";

            }
            else {

                attendanceMessage.textContent =
                    "Attendance is low";

            }

        }


        /* ================================
           UPDATE HTML
        ================================= */

        const percentageElement =
            document.getElementById("overallPercentage");

        const presentElement =
            document.getElementById("presentCount");

        const absentElement =
            document.getElementById("absentCount");

        const totalElement =
            document.getElementById("totalClasses");


        if (percentageElement) {

            percentageElement.textContent =
                percentage + "%";

        }


        if (presentElement) {

            presentElement.textContent =
                present;

        }


        if (absentElement) {

            absentElement.textContent =
                absent;

        }


        if (totalElement) {

            totalElement.textContent =
                total;

        }


        /* ================================
           UPDATE DONUT
        ================================= */

        const donut =
            document.getElementById("attendanceDonut");

        if (donut) {

            donut.style.background =
                `conic-gradient(
                    #49aa3f 0 ${percentage}%,
                    #e5e9ee ${percentage}% 100%
                )`;

        }

    }
    catch (error) {

        console.error(
            "Attendance Overview Error:",
            error
        );

    }

}


/* Load attendance */

loadAttendanceOverview();


/* ================================
   LOGOUT
================================ */

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        try {

            const response = await fetch(
                "http://localhost/apollo-backend/auth/logout.php",
                {
                    credentials: "include"
                }
            );

            const result =
                await response.text();

            console.log("Logout:", result);

            localStorage.removeItem("studentCourse");

            window.location.href =
                "http://localhost/apollo-attandance/index.html";

        }
        catch (error) {

            console.error(
                "Logout Error:",
                error
            );

            alert("Unable to logout.");

        }

    });

}

/* ================================
   TODAY'S CLASSES
================================ */

async function loadTodayClasses() {

    const tableBody =
        document.getElementById("todayClassesBody");


    if (!tableBody) {
        return;
    }


    try {

        const response = await fetch(
            "http://localhost/apollo-backend/student/today_classes.php",
            {
                credentials: "include"
            }
        );


        const data =
            await response.json();


        console.log(
            "Today's Classes:",
            data
        );


        if (data.status !== "success") {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Unable to load today's classes.
                    </td>
                </tr>
            `;

            return;
        }


        const classes =
            data.classes || [];


        /* No classes */

        if (classes.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No classes scheduled for today.
                    </td>
                </tr>
            `;

            return;
        }


        /* Clear table */

        tableBody.innerHTML = "";


        /* Add classes */

        classes.forEach(function (classItem) {

            const row =
                document.createElement("tr");


            const startTime =
                formatTime(classItem.start_time);

            const endTime =
                formatTime(classItem.end_time);


            row.innerHTML = `

                <td>
                    ${startTime} - ${endTime}
                </td>

                <td>
                    ${classItem.subject}
                </td>

                <td>
                    ${classItem.faculty_name}
                </td>

                <td>
                    ${classItem.room}
                </td>

            `;


            tableBody.appendChild(row);

        });

    }
    catch (error) {

        console.error(
            "Today's Classes Error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Unable to connect to server.
                </td>
            </tr>
        `;

    }

}


/* ================================
   FORMAT TIME
================================ */

function formatTime(time) {

    const parts =
        time.split(":");


    let hour =
        parseInt(parts[0]);

    const minute =
        parts[1];


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${period}`;

}


/* Load today's classes */

loadTodayClasses();