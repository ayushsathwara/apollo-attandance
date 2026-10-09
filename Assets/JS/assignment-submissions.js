const assignmentSelect =
    document.getElementById("assignmentSelect");

const submissionsBody =
    document.getElementById("submissionsBody");

const totalStudents =
    document.getElementById("totalStudents");

const submittedStudents =
    document.getElementById("submittedStudents");

const pendingStudents =
    document.getElementById("pendingStudents");


/* ================================
   LOAD FACULTY ASSIGNMENTS
================================ */

async function loadAssignments() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/assignments.php",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        console.log("Assignments:", data);


        if (data.status !== "success") {

            console.error(data.message);

            return;
        }


        assignmentSelect.innerHTML = `
            <option value="">
                Select Assignment
            </option>
        `;


        data.assignments.forEach(function (assignment) {

            const option =
                document.createElement("option");

            option.value =
                assignment.id;

            option.textContent =
                assignment.subject +
                " - " +
                assignment.title;

            assignmentSelect.appendChild(option);

        });

    }
    catch (error) {

        console.error(
            "Assignment loading error:",
            error
        );

    }

}


/* ================================
   LOAD STUDENT SUBMISSIONS
================================ */

async function loadSubmissions(assignmentId) {

    if (!assignmentId) {

        totalStudents.textContent = "0";
        submittedStudents.textContent = "0";
        pendingStudents.textContent = "0";

        submissionsBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Select an assignment
                </td>
            </tr>
        `;

        return;
    }


    submissionsBody.innerHTML = `
        <tr>
            <td colspan="6">
                Loading submissions...
            </td>
        </tr>
    `;


    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/assignment_submissions.php?assignment_id=" +
            assignmentId,
            {
                credentials: "include"
            }
        );


        const data =
            await response.json();


        console.log(
            "Submissions:",
            data
        );


        if (data.status !== "success") {

            submissionsBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        ${data.message}
                    </td>
                </tr>
            `;

            return;
        }


        /* ================================
           SUMMARY
        ================================ */

        totalStudents.textContent =
            data.total_students;

        submittedStudents.textContent =
            data.submitted;

        pendingStudents.textContent =
            data.pending;


        /* ================================
           STUDENT TABLE
        ================================ */

        submissionsBody.innerHTML = "";


        data.students.forEach(
            function (student, index) {

                let fileButton = "-";

                let submittedAt = "-";


                if (student.status === "Submitted") {

                    submittedAt =
                        formatDateTime(
                            student.submitted_at
                        );


                    fileButton = `
                        <a
                            href="http://localhost/apollo-backend/faculty/download_submission.php?assignment_id=${assignmentId}&student_id=${student.id}"
                            class="download-btn"
                        >
                            Download
                        </a>
                    `;

                }


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${student.name}
                    </td>

                    <td>
                        ${student.roll_no}
                    </td>

                    <td>

                        <span
                            class="status ${student.status.toLowerCase()}"
                        >
                            ${student.status}
                        </span>

                    </td>

                    <td>
                        ${submittedAt}
                    </td>

                    <td>
                        ${fileButton}
                    </td>

                `;


                submissionsBody.appendChild(row);

            }
        );

    }
    catch (error) {

        console.error(
            "Submission loading error:",
            error
        );


        submissionsBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Server error.
                </td>
            </tr>
        `;

    }

}


/* ================================
   FORMAT DATE + TIME
================================ */

function formatDateTime(dateTime) {

    const date =
        new Date(dateTime);


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ================================
   ASSIGNMENT DROPDOWN
================================ */

assignmentSelect.addEventListener(
    "change",
    function () {

        const assignmentId =
            this.value;

        loadSubmissions(
            assignmentId
        );

    }
);


/* ================================
   START
================================ */

loadAssignments();