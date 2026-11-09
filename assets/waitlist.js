(() => {
  "use strict";
  const form = document.querySelector("#waitlist");
  if (!(form instanceof HTMLElement)) return;
  const email = form.querySelector("input[name=email]");
  const website = form.querySelector("input[name=website]");
  const button = form.querySelector("button[type=button]");
  const status = form.querySelector("#waitlist-status");
  if (!(email instanceof HTMLInputElement) || !(website instanceof HTMLInputElement)
      || !(button instanceof HTMLButtonElement) || !(status instanceof HTMLElement)) return;

  const allowedSources = new Set(["instagram", "tiktok", "direct", "other"]);
  const requestedSource = new URLSearchParams(window.location.search).get("source") ?? "direct";
  const source = allowedSources.has(requestedSource) ? requestedSource : "other";
  const startedAt = Date.now();
  const endpoint = /^(localhost|127\.0\.0\.1)$/u.test(window.location.hostname)
    ? "/v1/waitlist" : (form.dataset.endpoint ?? "");

  const submit = async () => {
    status.className = "waitlist-status";
    status.textContent = "";
    if (!email.checkValidity()) { email.reportValidity(); return; }
    button.disabled = true;
    button.textContent = "Requesting…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.value,
          source,
          website: website.value,
          form_started_at: startedAt,
          notice_version: form.dataset.noticeVersion ?? "",
        }),
      });
      if (!response.ok) throw new Error("signup failed");
      email.value = "";
      email.disabled = true;
      button.hidden = true;
      status.classList.add("success");
      status.textContent = "You’re on the list. If a beta place is available, we’ll contact you at this address.";
    } catch {
      status.classList.add("error");
      status.textContent = "We couldn’t add you right now. Please try again in a moment.";
      button.disabled = false;
      button.textContent = "Request early access";
    }
  };
  button.addEventListener("click", () => { void submit(); });
  email.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); void submit(); }
  });
})();
