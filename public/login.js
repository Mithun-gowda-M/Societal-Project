document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.getElementById("formMessage");
  try {
    const auth = await bloodConnectApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
      }),
    });
    const expectedRole = {
      donor: "DONOR",
      patient: "REQUESTER",
      hospital: "REQUESTER",
      admin: "ADMIN",
    }[document.getElementById("userType").value];
    if (auth.user.role !== expectedRole) {
      message.textContent = `This account is registered as ${auth.user.role.toLowerCase()}. Select the matching account type.`;
      return;
    }
    saveBloodConnectSession(auth);
    const destination = {
      DONOR: "donor-dashboard.html",
      REQUESTER: "emergency-request.html",
      ADMIN: "admin-dashboard.html",
    }[auth.user.role];
    window.location.href = destination;
  } catch (error) {
    message.textContent = error.message;
  }
});
