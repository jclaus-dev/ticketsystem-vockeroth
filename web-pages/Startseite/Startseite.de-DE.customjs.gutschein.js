/* Startseite: Gutschein flow */

function resetGutscheinForm() {
  inputs.gutschein.value = "";
  inputs.gutscheinWert.value = "";
  document.getElementById("kachelCode").style.borderColor = "";
  document.getElementById("kachelWert").style.borderColor = "";
  arrowNext.style.color = "white";
}

function updateGutscheinUI() {
  const codeOk = inputs.gutschein.value.trim();
  const wertOk = inputs.gutscheinWert.value.trim();
  document.getElementById("kachelCode").style.borderColor = codeOk ? "green" : "";
  document.getElementById("kachelWert").style.borderColor = wertOk ? "green" : "";
  arrowNext.style.color = codeOk && wertOk ? "green" : "white";
}

function sanitizeEuroInput() {
  const raw = inputs.gutscheinWert.value.replace(/[^\d]/g, "");
  if (!raw) {
    inputs.gutscheinWert.value = "";
    return "";
  }
  inputs.gutscheinWert.value = `${raw} €`;
  return raw;
}

inputs.gutschein.addEventListener("input", updateGutscheinUI);
inputs.gutscheinWert.addEventListener("input", () => {
  sanitizeEuroInput();
  updateGutscheinUI();
});

inputs.gutscheinWert.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    arrowNext.click();
  }
});

inputs.gutschein.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    focusDelayed(inputs.gutscheinWert);
  }
});
inputs.gutscheinWert.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    arrowNext.click();
  }
});

arrowNext.addEventListener("click", async e => {
  e.preventDefault();
  const code = inputs.gutschein.value.trim();
  const wert = sanitizeEuroInput();
  if (!code || !wert || hasSent) return;

  hasSent = true;
  if (typeof recordTicket === "function") {
    recordTicket({
      kachelname: "Online Gutscheine",
      details: `Gutscheincode: ${code} | Wert: ${wert}`,
      typeKey: "online-gutscheine"
    });
  }

  try {
    await sendPlannerTicket({
      kachelname:    "Online Gutscheine",
      gutscheincode: code,
      gutscheinwert: wert
    });
    resetGutscheinForm();
    showView("tile");
  } catch (err) {
    console.error("Fehler beim Senden des Gutscheins:", err);
    alert("Netzwerkfehler beim Senden des Gutscheins:\n" + err.message);
    showView("gutschein");
  } finally {
    hasSent = false;
  }
});

buttons.popupYes.addEventListener("click", async () => {
  if (hasSent) return;
  hasSent = true;
  hideAllViews();

  try {
    showView("tile");
  } catch (err) {
    console.error(err);
    alert("Beim Senden ist ein Fehler aufgetreten: " + err.message);
    showView("tile");
  } finally {
    hasSent = false;
  }
});

buttons.popupNo.addEventListener("click", () => {
  hideAllViews();
  showView("gutschein");
  focusDelayed(inputs.gutscheinWert);
});

async function sendGutschein() {
  try {
    await sendPlannerTicket({
      kachelname:    currentTileName || "Online Gutscheine",
      gutscheincode: inputs.gutschein.value.trim(),
      gutscheinwert: sanitizeEuroInput()
    });
    showView("tile");
  } catch (err) {
    console.error("Gutschein-Fehler:", err);
    alert("Netzwerkfehler beim Senden des Gutscheins:\n" + err.message);
    showView("gutschein");
  } finally {
    hasSent = false;
  }
}
