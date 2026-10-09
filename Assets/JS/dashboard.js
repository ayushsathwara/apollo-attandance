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
   PENDING ASSIGNMENTS
================================ */

async function loadPendingAssignments() {

    const pendingElement =
        document.getElementById("pendingAssignments");


    if (!pendingElement) {
        return;
    }


    try {

        const response = await fetch(
            "http://localhost/apollo-backend/student/assignments.php",
            {
                credentials: "include"
            }
        );


        const data =
            await response.json();


        console.log(
            "Assignments:",
            data
        );


        if (data.status !== "success") {

            console.error(
                data.message || "Unable to load assignments."
            );

            return;
        }


        const assignments =
            data.assignments || [];


        /*
            Count only Pending assignments
        */

        let pendingCount = 0;


        assignments.forEach(function (assignment) {

            if (assignment.status === "Pending") {

                pendingCount++;

            }

        });


        /*
            Update dashboard
        */

        pendingElement.textContent =
            pendingCount;

    }
    catch (error) {

        console.error(
            "Pending Assignments Error:",
            error
        );

    }

}


/* Load pending assignments */

loadPendingAssignments();

/* ================================
   ASSIGNMENT STATUS
================================ */

async function loadAssignmentStatus() {

    const totalElement =
        document.getElementById("assignmentTotal");

    const submittedElement =
        document.getElementById("submittedAssignments");

    const pendingElement =
        document.getElementById("pendingStatusAssignments");

    const overdueElement =
        document.getElementById("overdueAssignments");

    const submittedPercentageElement =
        document.getElementById("submittedPercentage");

    const pendingPercentageElement =
        document.getElementById("pendingPercentage");

    const overduePercentageElement =
        document.getElementById("overduePercentage");

    const donut =
        document.getElementById("assignmentDonut");


    /*
        Check whether card exists
    */

    if (
        !totalElement ||
        !submittedElement ||
        !pendingElement ||
        !overdueElement
    ) {

        return;

    }


    try {

        const response = await fetch(
            "http://localhost/apollo-backend/student/assignments.php",
            {
                credentials: "include"
            }
        );


        const data =
            await response.json();


        console.log(
            "Assignment Status:",
            data
        );


        if (data.status !== "success") {

            console.error(
                data.message ||
                "Unable to load assignment status."
            );

            return;

        }


        const assignments =
            data.assignments || [];


        /*
            Count statuses
        */

        let submitted = 0;
        let pending = 0;
        let overdue = 0;


        assignments.forEach(function (assignment) {

            if (assignment.status === "Submitted") {

                submitted++;

            }
            else if (assignment.status === "Pending") {

                pending++;

            }
            else if (assignment.status === "Overdue") {

                overdue++;

            }

        });


        /*
            Total
        */

        const total =
            submitted + pending + overdue;


        /*
            Calculate percentages
        */

        let submittedPercentage = 0;
        let pendingPercentage = 0;
        let overduePercentage = 0;


        if (total > 0) {

            submittedPercentage =
                Math.round(
                    (submitted / total) * 100
                );


            pendingPercentage =
                Math.round(
                    (pending / total) * 100
                );


            overduePercentage =
                Math.round(
                    (overdue / total) * 100
                );

        }


        /*
            Update numbers
        */

        totalElement.textContent =
            total;


        submittedElement.textContent =
            submitted;


        pendingElement.textContent =
            pending;


        overdueElement.textContent =
            overdue;


        /*
            Update percentages
        */

        submittedPercentageElement.textContent =
            submittedPercentage + "%";


        pendingPercentageElement.textContent =
            pendingPercentage + "%";


        overduePercentageElement.textContent =
            overduePercentage + "%";


        /*
            Update donut
        */

        if (donut) {

            const submittedEnd =
                submittedPercentage;


            const pendingEnd =
                submittedPercentage +
                pendingPercentage;


            donut.style.background =
                `conic-gradient(
                    #49aa3f 0 ${submittedEnd}%,
                    #f5a623 ${submittedEnd}% ${pendingEnd}%,
                    #e74c3c ${pendingEnd}% 100%
                )`;

        }

    }
    catch (error) {

        console.error(
            "Assignment Status Error:",
            error
        );

    }

}

/* ================================
   UPCOMING ASSIGNMENT
================================ */

async function loadUpcomingAssignment() {

    const titleElement =
        document.getElementById(
            "upcomingAssignmentTitle"
        );

    const dueDateElement =
        document.getElementById(
            "upcomingAssignmentDueDate"
        );

    const button =
        document.getElementById(
            "upcomingAssignmentButton"
        );


    if (
        !titleElement ||
        !dueDateElement ||
        !button
    ) {

        return;

    }


    try {

        const response = await fetch(
            "http://localhost/apollo-backend/student/assignments.php",
            {
                credentials: "include"
            }
        );


        const data =
            await response.json();


        console.log(
            "Upcoming Assignment:",
            data
        );


        if (data.status !== "success") {

            titleElement.textContent =
                "Unable to load";

            dueDateElement.textContent =
                "-";

            return;

        }


        const assignments =
            data.assignments || [];


        /*
            Only Pending assignments
        */

        const upcomingAssignments =
            assignments.filter(function (assignment) {

                return assignment.status === "Pending";

            });


        /*
            No upcoming assignment
        */

        if (upcomingAssignments.length === 0) {

            titleElement.textContent =
                "No Upcoming Assignment";

            dueDateElement.textContent =
                "-";

            button.style.display =
                "none";

            return;

        }


        /*
            assignments.php already sorts
            by due date ASC

            So first one is nearest.
        */

        const upcoming =
            upcomingAssignments[0];


        /*
            Update title
        */

        titleElement.textContent =
            upcoming.title;


        /*
            Update due date
        */

        dueDateElement.textContent =
            formatAssignmentDate(
                upcoming.due_date
            );


        /*
            View Assignment button
        */

        button.style.display =
            "inline-block";


        button.onclick = function () {

            window.location.href =
                "student-assignments.html";

        };

    }
    catch (error) {

        console.error(
            "Upcoming Assignment Error:",
            error
        );

        titleElement.textContent =
            "Unable to load";

        dueDateElement.textContent =
            "-";

    }

}


/* ================================
   FORMAT ASSIGNMENT DATE
================================ */

function formatAssignmentDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* Load upcoming assignment */

loadUpcomingAssignment();


/* Load assignment status */

loadAssignmentStatus();


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