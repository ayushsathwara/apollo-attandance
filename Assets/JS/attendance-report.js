document.addEventListener("DOMContentLoaded", function () {

    loadSubjects();

    loadReport();

    const loadButton =
        document.getElementById("loadReport");

    loadButton.addEventListener(
        "click",
        function () {
            loadReport();
        }
    );

});

async function loadReport() {

    const subject =
        document.getElementById(
            "subject"
        ).value;

    const attendanceDate =
        document.getElementById(
            "attendanceDate"
        ).value;


    let url =
        "http://localhost/apollo-backend/faculty/attendance_report.php";


    const params =
        new URLSearchParams();


    if (subject !== "") {

        params.append(
            "subject",
            subject
        );

    }


    if (attendanceDate !== "") {

        params.append(
            "date",
            attendanceDate
        );

    }


    if (params.toString() !== "") {

        url +=
            "?" +
            params.toString();

    }


    try {

        const response =
            await fetch(
                url,
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        console.log(
            "Attendance Report:",
            data
        );


        if (data.status !== "success") {

            alert(
                data.message ||
                "Unable to load report."
            );

            return;
        }


        updateSummary(
            data.summary
        );


        showReport(
            data.report
        );

    }

    catch (error) {

        console.error(
            "Report Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


/* SUMMARY */

function updateSummary(summary) {

    document.getElementById(
        "totalStudents"
    ).textContent =
        summary.total_students;


    document.getElementById(
        "totalRecords"
    ).textContent =
        summary.total_records;


    document.getElementById(
        "totalPresent"
    ).textContent =
        summary.total_present;


    document.getElementById(
        "totalAbsent"
    ).textContent =
        summary.total_absent;

}


/* TABLE */

function showReport(report) {

    const reportBody =
        document.getElementById(
            "reportBody"
        );


    if (report.length === 0) {

        reportBody.innerHTML = `

            <tr>

                <td colspan="6">

                    No attendance records found.

                </td>

            </tr>

        `;

        return;
    }


    reportBody.innerHTML = "";


    report.forEach(function (student) {

        const row =
            document.createElement("tr");


        const percentage =
            Number(
                student.percentage
            );


        let percentageClass =
            "attendance-good";


        if (percentage < 75) {

            percentageClass =
                "attendance-low";

        }


        row.innerHTML = `

            <td>
                ${student.name}
            </td>

            <td>
                ${student.roll_no}
            </td>

            <td>
                ${student.subject}
            </td>

            <td>
                ${student.present}
            </td>

            <td>
                ${student.absent}
            </td>

            <td class="${percentageClass}">
                ${percentage}%
            </td>

        `;


        reportBody.appendChild(row);

    });

}
async function loadSubjects() {

    const subjectSelect =
        document.getElementById("subject");

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/subjects.php",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        if (data.status !== "success") {
            alert(data.message || "Unable to load subjects.");
            return;
        }

        subjectSelect.innerHTML = `
            <option value="">
                All My Subjects
            </option>
        `;

        data.subjects.forEach(function (subject) {

            const option =
                document.createElement("option");

            option.value = subject;
            option.textContent = subject;

            subjectSelect.appendChild(option);

        });

    } catch (error) {

        console.error("Subjects Error:", error);

        alert("Unable to load subjects.");

    }

}