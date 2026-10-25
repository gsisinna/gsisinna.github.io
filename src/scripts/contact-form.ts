// Progressive enhancement for the contact form: submit in the background and show the
// result inline. Without JavaScript the form still posts to Formspree normally.

function initContactForm() {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  if (!form || form.dataset.enhanced) return;
  form.dataset.enhanced = "true";

  const button = form.querySelector<HTMLButtonElement>("[data-submit]");
  const status = form.querySelector<HTMLElement>("[data-status]");
  const idleLabel = button?.textContent ?? "Send message";

  const show = (state: "success" | "error", message: string) => {
    if (!status) return;
    status.dataset.state = state;
    status.textContent = message;
    status.hidden = false;
  };

  form.addEventListener("submit", async (event) => {
    if (!form.checkValidity()) return;
    event.preventDefault();

    form.setAttribute("aria-busy", "true");
    if (button) {
      button.disabled = true;
      button.textContent = "Sending…";
    }
    if (status) status.hidden = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      show("success", "Thanks! Your message is on its way. I usually reply within a few days.");
    } catch {
      show("error", "Something went wrong while sending. Please try again, or reach me on LinkedIn.");
    } finally {
      form.removeAttribute("aria-busy");
      if (button) {
        button.disabled = false;
        button.textContent = idleLabel;
      }
    }
  });
}

document.addEventListener("astro:page-load", initContactForm);
