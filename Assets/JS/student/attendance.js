document.addEventListener("DOMContentLoaded", function () {

    // ==============================  
    // GLOBAL VARIABLES  
    // ==============================  

    let attendanceRecords = [];
    let currentFilter = "all";

    let calendarDate = new Date();
    let subjectCalendarDate = new Date();

    let selectedSubjectRecords = [];


    // ==============================  
    // LOAD ATTENDANCE  
    // ==============================  

    loadAttendance();


    // ==============================  
    // BACK TO SUBJECTS BUTTON  
    // ==============================  

    document.getElementById("backToSubjects").addEventListener("click", function () {

        document.getElementById("lectureHistory").style.display = "none";
        document.getElementById("subjectList").style.display = "block";

    });


    // ==============================  
    // SUBJECT FILTER BUTTONS  
    // ==============================  

    document.querySelectorAll(".filter-btn").forEach(function (button) {

        button.addEventListener("click", function () {

            document.querySelectorAll(".filter-btn").forEach(function (btn) {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            currentFilter = this.dataset.filter;

            showSubjectAttendance(attendanceRecords);

        });

    });


    // ==============================  
    // MAIN CALENDAR PREVIOUS BUTTON  
    // ==============================  

    document.getElementById("prevMonth").addEventListener("click", function () {

        calendarDate.setMonth(calendarDate.getMonth() - 1);

        renderAttendanceCalendar(attendanceRecords);

    });


    // ==============================  
    // MAIN CALENDAR NEXT BUTTON  
    // ==============================  

    document.getElementById("nextMonth").addEventListener("click", function () {

        const today = new Date();

        const isCurrentMonth =
            calendarDate.getFullYear() === today.getFullYear() &&
            calendarDate.getMonth() === today.getMonth();

        if (isCurrentMonth) {
            return;
        }

        calendarDate.setMonth(calendarDate.getMonth() + 1);

        renderAttendanceCalendar(attendanceRecords);

    });


    // ==============================  
    // SUBJECT CALENDAR PREVIOUS BUTTON  
    // ==============================  

    document.getElementById("subjectPrevMonth").addEventListener("click", function () {

        subjectCalendarDate.setMonth(subjectCalendarDate.getMonth() - 1);

        renderSubjectCalendar();

    });


    // ==============================  
    // SUBJECT CALENDAR NEXT BUTTON  
    // ==============================  

    document.getElementById("subjectNextMonth").addEventListener("click", function () {

        const today = new Date();

        const isCurrentMonth =
            subjectCalendarDate.getFullYear() === today.getFullYear() &&
            subjectCalendarDate.getMonth() === today.getMonth();

        if (isCurrentMonth) {
            return;
        }

        subjectCalendarDate.setMonth(subjectCalendarDate.getMonth() + 1);

        renderSubjectCalendar();

    });


    // ==============================  
    // LOAD ATTENDANCE API  
    // ==============================  

    async function loadAttendance() {

        try {

            const response = await fetch(
                "http://localhost/apollo-backend/student/attendance.php",
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            console.log("Attendance Data:", data);

            if (data.status !== "success") {
                alert(data.message || "Unable to load attendance.");
                return;
            }

            attendanceRecords = data.attendance || [];

            if (attendanceRecords.length === 0) {

                document.getElementById("subjectList").innerHTML =
                    "<p>No attendance records found.</p>";

                document.getElementById("overallPercentage").textContent = "0%";
                document.getElementById("circlePercentage").textContent = "0%";

                document.getElementById("attendanceMessage").textContent =
                    "No attendance records yet.";

                calculateAttendance(0, 0);

                renderAttendanceCalendar(attendanceRecords);
                renderAttendanceTrend(attendanceRecords);
                renderLowAttendanceWarnings(attendanceRecords);

                return;
            }

            calculateAttendance(attendanceRecords);

        } catch (error) {

            console.error("Attendance Error:", error);

            alert("Unable to connect to server.");

        }

    }


    // ==============================  
    // OVERALL ATTENDANCE CALCULATION  
    // ==============================  

    function calculateAttendance(attendance) {

        const totalLectures = attendance.length;

        const presentLectures = attendance.filter(function (record) {
            return record.status === "Present";
        }).length;

        const absentLectures = totalLectures - presentLectures;

        const percentage = totalLectures > 0
            ? (presentLectures / totalLectures) * 100
            : 0;


        document.getElementById("overallPercentage").textContent =
            percentage.toFixed(2) + "%";

        document.getElementById("circlePercentage").textContent =
            Math.round(percentage) + "%";


        if (percentage >= 75) {

            document.getElementById("attendanceMessage").textContent =
                "Good Attendance";

        } else {

            document.getElementById("attendanceMessage").textContent =
                "Attendance is below 75%";

        }


        // Overall summary  

        document.getElementById("totalLectures").textContent = totalLectures;
        document.getElementById("totalPresent").textContent = presentLectures;
        document.getElementById("totalAbsent").textContent = absentLectures;


        // Today's summary  

        const today = new Date();

        const todayString =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        const todayRecords = attendance.filter(function (record) {
            return record.attendance_date === todayString;
        });

        const todayPresent = todayRecords.filter(function (record) {
            return record.status === "Present";
        }).length;

        const todayAbsent = todayRecords.length - todayPresent;

        document.getElementById("todayLectures").textContent =
            todayRecords.length;

        document.getElementById("todayPresent").textContent =
            todayPresent;

        document.getElementById("todayAbsent").textContent =
            todayAbsent;


        // Other attendance features  

        showSubjectAttendance(attendance);

        calculateAttendanceTarget(totalLectures, presentLectures);

        renderAttendanceCalendar(attendance);

        renderAttendanceTrend(attendance);

        renderLowAttendanceWarnings(attendance);

    }


    // ==============================  
    // SUBJECT-WISE ATTENDANCE  
    // ==============================  

    function showSubjectAttendance(attendance) {

        const subjectList = document.getElementById("subjectList");

        subjectList.innerHTML = "";

        document.getElementById("lectureHistory").style.display = "none";

        subjectList.style.display = "block";

        const subjects = {};

        attendance.forEach(function (record) {

            if (!subjects[record.subject]) {

                subjects[record.subject] = {
                    total: 0,
                    present: 0,
                    records: []
                };

            }

            subjects[record.subject].total++;

            if (record.status === "Present") {
                subjects[record.subject].present++;
            }

            subjects[record.subject].records.push(record);

        });


        Object.keys(subjects).forEach(function (subject) {

            const total = subjects[subject].total;

            const present = subjects[subject].present;

            const percentage = (present / total) * 100;


            let show = false;

            if (currentFilter === "all") {
                show = true;
            }

            else if (currentFilter === "below75") {
                show = percentage < 75;
            }

            else if (currentFilter === "75to85") {
                show = percentage >= 75 && percentage <= 85;
            }

            else if (currentFilter === "85to95") {
                show = percentage > 85 && percentage <= 95;
            }

            else if (currentFilter === "above95") {
                show = percentage > 95;
            }

            if (!show) return;


            const card = document.createElement("div");

            card.className = "subject-card";


            const info = document.createElement("div");

            const heading = document.createElement("h3");

            heading.textContent = subject;

            const details = document.createElement("p");

            details.textContent =
                present + " Present / " + total + " Lectures";


            info.appendChild(heading);
            info.appendChild(details);


            const percentageText = document.createElement("strong");

            percentageText.textContent = percentage.toFixed(2) + "%";


            card.appendChild(info);
            card.appendChild(percentageText);


            card.addEventListener("click", function () {

                showLectureHistory(subject, subjects[subject].records);

            });


            subjectList.appendChild(card);

        });


        if (subjectList.innerHTML === "") {

            subjectList.innerHTML =
                "<p>No subjects found in this percentage range.</p>";

        }

    }


    // ==============================  
    // OPEN SUBJECT CALENDAR  
    // ==============================  

    function showLectureHistory(subject, records) {

        document.getElementById("subjectList").style.display = "none";

        document.getElementById("lectureHistory").style.display = "block";

        document.getElementById("historySubject").textContent =
            subject + " - Attendance Calendar";


        selectedSubjectRecords = records;

        subjectCalendarDate = new Date();

        renderSubjectCalendar();

    }


    // ==============================  
    // SUBJECT-WISE CALENDAR  
    // ==============================  

    function renderSubjectCalendar() {

        const calendarGrid =
            document.getElementById("subjectCalendarGrid");

        const monthHeading =
            document.getElementById("subjectCurrentMonth");


        const year = subjectCalendarDate.getFullYear();

        const month = subjectCalendarDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();

        const totalDays = new Date(year, month + 1, 0).getDate();


        monthHeading.textContent =
            subjectCalendarDate.toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric"
            });


        calendarGrid.innerHTML = "";


        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


        weekdays.forEach(function (day) {

            const heading = document.createElement("div");

            heading.className = "calendar-day weekday";

            heading.textContent = day;

            calendarGrid.appendChild(heading);

        });


        // Empty spaces  

        for (let i = 0; i < firstDay; i++) {

            const empty = document.createElement("div");

            calendarGrid.appendChild(empty);

        }


        // Calendar dates  

        for (let day = 1; day <= totalDays; day++) {

            const dateString =
                year + "-" +
                String(month + 1).padStart(2, "0") + "-" +
                String(day).padStart(2, "0");


            const dayRecords = selectedSubjectRecords.filter(function (record) {

                return record.attendance_date === dateString;

            });


            const cell = document.createElement("div");

            cell.className = "calendar-day";


            const dayNumber = document.createElement("strong");

            dayNumber.textContent = day;

            cell.appendChild(dayNumber);


            if (dayRecords.length === 0) {

                cell.classList.add("no-lecture");

                const status = document.createElement("small");

                status.textContent = "N/A";

                cell.appendChild(status);

            }

            else {

                const present = dayRecords.filter(function (record) {

                    return record.status === "Present";

                }).length;


                const absent = dayRecords.length - present;


                const status = document.createElement("small");


                if (present === dayRecords.length) {

                    cell.classList.add("present");

                    status.textContent = "Present";

                }

                else if (absent === dayRecords.length) {

                    cell.classList.add("absent");

                    status.textContent = "Absent";

                }

                else {

                    cell.classList.add("mixed");

                    status.textContent =
                        present + "P / " + absent + "A";

                }


                cell.appendChild(status);

                cell.title =
                    dayRecords.length + " lecture(s): " +
                    present + " Present, " + absent + " Absent";

            }


            calendarGrid.appendChild(cell);

        }


        updateSubjectCalendarNavigation();

    }


    // ==============================  
    // SUBJECT CALENDAR NAVIGATION  
    // ==============================  

    function updateSubjectCalendarNavigation() {

        const today = new Date();

        const isCurrentMonth =
            subjectCalendarDate.getFullYear() === today.getFullYear() &&
            subjectCalendarDate.getMonth() === today.getMonth();


        const nextButton =
            document.getElementById("subjectNextMonth");


        nextButton.disabled = isCurrentMonth;

        nextButton.style.opacity = isCurrentMonth ? "0.4" : "1";

        nextButton.style.cursor =
            isCurrentMonth ? "not-allowed" : "pointer";

    }


    // ==============================  
    // MAIN MONTHLY ATTENDANCE CALENDAR  
    // ==============================  

    function renderAttendanceCalendar(attendance) {

        const calendarGrid = document.getElementById("calendarGrid");

        const currentMonth = document.getElementById("currentMonth");


        const year = calendarDate.getFullYear();

        const month = calendarDate.getMonth();


        const firstDay = new Date(year, month, 1).getDay();

        const totalDays = new Date(year, month + 1, 0).getDate();


        currentMonth.textContent =
            calendarDate.toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric"
            });


        calendarGrid.innerHTML = "";


        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


        weekdays.forEach(function (day) {

            const heading = document.createElement("div");

            heading.className = "calendar-day weekday";

            heading.textContent = day;

            calendarGrid.appendChild(heading);

        });


        for (let i = 0; i < firstDay; i++) {

            const empty = document.createElement("div");

            calendarGrid.appendChild(empty);

        }


        for (let day = 1; day <= totalDays; day++) {

            const dateString =
                year + "-" +
                String(month + 1).padStart(2, "0") + "-" +
                String(day).padStart(2, "0");


            const dayRecords = attendance.filter(function (record) {

                return record.attendance_date === dateString;

            });


            const cell = document.createElement("div");

            cell.className = "calendar-day";


            const dayNumber = document.createElement("strong");

            dayNumber.textContent = day;

            cell.appendChild(dayNumber);


            if (dayRecords.length > 0) {

                const present = dayRecords.filter(function (record) {

                    return record.status === "Present";

                }).length;


                const absent = dayRecords.length - present;


                if (present === dayRecords.length) {

                    cell.classList.add("present");

                }

                else if (absent === dayRecords.length) {

                    cell.classList.add("absent");

                }

                else {

                    cell.classList.add("mixed");

                }


                const details = document.createElement("small");

                details.textContent = present + "P / " + absent + "A";

                cell.appendChild(details);

            }


            calendarGrid.appendChild(cell);

        }


        updateMainCalendarNavigation();

    }


    // ==============================  
    // MAIN CALENDAR NEXT BUTTON CONTROL  
    // ==============================  

    function updateMainCalendarNavigation() {

        const today = new Date();

        const isCurrentMonth =
            calendarDate.getFullYear() === today.getFullYear() &&
            calendarDate.getMonth() === today.getMonth();


        const nextButton = document.getElementById("nextMonth");

        nextButton.disabled = isCurrentMonth;

        nextButton.style.opacity = isCurrentMonth ? "0.4" : "1";

        nextButton.style.cursor =
            isCurrentMonth ? "not-allowed" : "pointer";

    }


    // ==============================  
    // ATTENDANCE TARGET CALCULATOR  
    // ==============================  

    function calculateAttendanceTarget(totalLectures, presentLectures) {

        const currentPercentage = totalLectures > 0
            ? (presentLectures / totalLectures) * 100
            : 0;


        document.getElementById("targetCurrentPercentage").textContent =
            currentPercentage.toFixed(2) + "%";


        const result = document.getElementById("targetResult");


        if (totalLectures === 0) {

            result.textContent = "No attendance records available yet.";

            return;

        }


        if (currentPercentage >= 75) {

            result.textContent =
                "Great! You have already reached the 75% attendance target.";

            return;

        }


        const requiredLectures = Math.ceil(
            (0.75 * totalLectures - presentLectures) / 0.25
        );


        result.textContent =
            "You need to attend " + requiredLectures +
            " consecutive lectures without being absent to reach 75% attendance.";

    }


    // ==============================  
    // ATTENDANCE TREND CHART  
    // ==============================  

    function renderAttendanceTrend(attendance) {

        const chart = document.getElementById("attendanceTrend");

        chart.innerHTML = "";


        if (attendance.length === 0) {

            chart.innerHTML = "<p>No attendance data available.</p>";

            return;

        }


        const monthlyData = {};


        attendance.forEach(function (record) {

            const monthKey = record.attendance_date.substring(0, 7);


            if (!monthlyData[monthKey]) {

                monthlyData[monthKey] = {
                    total: 0,
                    present: 0
                };

            }


            monthlyData[monthKey].total++;


            if (record.status === "Present") {

                monthlyData[monthKey].present++;

            }

        });


        Object.keys(monthlyData).sort().forEach(function (monthKey) {

            const data = monthlyData[monthKey];

            const percentage = (data.present / data.total) * 100;


            const date = new Date(monthKey + "-01T00:00:00");


            const monthName = date.toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric"
            });


            const item = document.createElement("div");

            item.className = "trend-item";


            const value = document.createElement("strong");

            value.textContent = percentage.toFixed(0) + "%";


            const barArea = document.createElement("div");

            barArea.className = "trend-bar-area";


            const bar = document.createElement("div");

            bar.className = "trend-bar";

            bar.style.height = percentage + "%";


            barArea.appendChild(bar);


            const month = document.createElement("span");

            month.textContent = monthName;


            item.appendChild(value);

            item.appendChild(barArea);

            item.appendChild(month);


            chart.appendChild(item);

        });

    }


    // ==============================  
    // LOW ATTENDANCE WARNINGS  
    // ==============================  

    function renderLowAttendanceWarnings(attendance) {

        const warningContainer =
            document.getElementById("attendanceWarnings");


        warningContainer.innerHTML = "";


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


        let warningCount = 0;


        Object.keys(subjects).forEach(function (subject) {

            const total = subjects[subject].total;

            const present = subjects[subject].present;


            const percentage = (present / total) * 100;


            if (percentage < 75) {

                warningCount++;


                const requiredLectures = Math.ceil(
                    (0.75 * total - present) / 0.25
                );


                const warning = document.createElement("div");

                warning.className = "warning-item";


                const heading = document.createElement("h3");

                heading.textContent = subject;


                const percentageText = document.createElement("p");

                percentageText.textContent =
                    "Current Attendance: " + percentage.toFixed(2) + "%";


                const targetText = document.createElement("p");

                targetText.textContent =
                    "You need " + requiredLectures +
                    " consecutive lectures without absence to reach 75%.";


                warning.appendChild(heading);

                warning.appendChild(percentageText);

                warning.appendChild(targetText);


                warningContainer.appendChild(warning);

            }

        });


        if (warningCount === 0) {

            warningContainer.innerHTML =
                '<div class="no-warning">Great! All your subjects are at or above 75% attendance.</div>';

        }

    }

});