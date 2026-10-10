const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const courseInput = document.getElementById("course");
const roleInput = document.getElementById("role");
const otpInput = document.getElementById("otp");
const otpGroup = document.getElementById("otpGroup");
const mainBtn = document.getElementById("mainBtn");
const loginStatus = document.getElementById("loginStatus");
const passwordToggle = document.getElementById("passwordToggle");
const roleCards = document.querySelectorAll(".role-card");

const REQUEST_OTP_URL =
    "http://localhost/apollo-backend/request-otp.php";

const VERIFY_OTP_URL =
    "http://localhost/apollo-backend/verify-otp.php";

const LOGIN_URL =
    "http://localhost/apollo-backend/auth/login.php";

let selectedRole = "student";
let otpRequested = false;
let busy = false;

// Role selection
roleCards.forEach(function (card) {
    card.addEventListener("click", function () {
        if (busy) return;

        roleCards.forEach(function (item) {
            item.classList.remove("active");
        });

        this.classList.add("active");
        selectedRole = this.dataset.role;
        roleInput.value = selectedRole;

        resetOtp();
    });
});

// Reset OTP step if email changes
emailInput.addEventListener("input", resetOtp);

// Reset OTP step if course changes
courseInput.addEventListener("change", resetOtp);

function resetOtp() {
    if (!otpRequested) return;

    otpRequested = false;
    otpInput.value = "";
    otpInput.required = false;
    otpGroup.hidden = true;

    mainBtn.innerHTML = "<span>→</span> SEND OTP";
    loginStatus.textContent = "";
}

// Show/hide password
passwordToggle.addEventListener("click", function () {
    const show = passwordInput.type === "password";

    passwordInput.type = show ? "text" : "password";

    passwordToggle.setAttribute(
        "aria-label",
        show ? "Hide password" : "Show password"
    );
});

// Main button: Send OTP first, then Login
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (busy) return;

    if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const course = courseInput.value;

    busy = true;
    mainBtn.disabled = true;

    try {
        // FIRST CLICK: Send OTP
        if (!otpRequested) {
            mainBtn.textContent = "SENDING OTP...";
            loginStatus.textContent = "Sending code to your email...";

            const response = await fetch(REQUEST_OTP_URL, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    email: email,
                    password: password,
                    role: selectedRole
                })
            });

            const result = await response.json();

            loginStatus.textContent = result.message;

            if (!response.ok || !result.success) {
                mainBtn.innerHTML = "<span>→</span> SEND OTP";
                return;
            }

            otpRequested = true;
            otpGroup.hidden = false;
            otpInput.required = true;

            mainBtn.innerHTML = "<span>→</span> LOGIN";
            loginStatus.textContent =
                "OTP sent. Enter the code from your email, then click LOGIN.";

            otpInput.focus();
            return;
        }

        // SECOND CLICK: Verify OTP
        const otp = otpInput.value.trim();

        if (!/^\d{6}$/.test(otp)) {
            loginStatus.textContent = "Enter the 6-digit OTP.";
            otpInput.focus();
            return;
        }

        mainBtn.textContent = "VERIFYING OTP...";
        loginStatus.textContent = "Verifying your email...";

        const verifyResponse = await fetch(VERIFY_OTP_URL, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                email: email,
                role: selectedRole,
                otp: otp
            })
        });

        const verification = await verifyResponse.json();

        if (!verifyResponse.ok || !verification.success) {
            loginStatus.textContent = verification.message;
            mainBtn.innerHTML = "<span>→</span> LOGIN";
            return;
        }

        // OTP verified. Now check the password.
        mainBtn.textContent = "LOGGING IN...";
        loginStatus.textContent = "Email verified. Logging in...";

        const loginResponse = await fetch(LOGIN_URL, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                email: email,
                password: password,
                course: course,
                role: selectedRole
            })
        });

        const result = await loginResponse.text();

        if (result.trim() === "Login successful!") {
            if (selectedRole === "student") {
                localStorage.setItem("studentCourse", course);

                window.location.href =
                    "http://localhost/apollo-attandance/Pages/dashboard.html";

            } else if (selectedRole === "faculty") {
                window.location.href =
                    "http://localhost/apollo-attandance/Pages/faculty-dashboard.html";

            } else if (selectedRole === "parent") {
                window.location.href =
                    "http://localhost/apollo-attandance/Pages/parent-dashboard.html";
            }

            return;
        }

        loginStatus.textContent = result;

        // Password was incorrect. OTP was already consumed;
        // request a fresh OTP before trying again.
        otpRequested = false;
        otpInput.value = "";
        otpInput.required = false;
        otpGroup.hidden = true;
        mainBtn.innerHTML = "<span>→</span> SEND OTP";

    } catch (error) {
        console.error(error);
        loginStatus.textContent =
            "Unable to connect. Check XAMPP and the browser console.";

    } finally {
        busy = false;
        mainBtn.disabled = false;
    }
});