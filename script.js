let clickCount = 0;
const maxClicks = 5;
const whatsappBtn = document.getElementById("whatsappBtn");
const clickCounter = document.getElementById("clickCounter");
const form = document.getElementById("registrationForm");
const statusMessage = document.getElementById("statusMessage");
const screenshotInput = document.getElementById("screenshotInput");

const scriptURL = "https://script.google.com/macros/s/AKfycbzP3z2ec_urCjYMLstC00Rj-Xgn3UQzvwKBM-WobaTdLdgkpNJ-Q464I3mEqCsQrauc/exec"; 

// Disable form if already submitted
if (localStorage.getItem("formSubmitted")) {
  form.querySelectorAll("input, button").forEach(el => el.disabled = true);
  statusMessage.textContent = "🎉 Your submission has been recorded. Thanks for being part of Tech for Girls!";
}

// WhatsApp share counter
whatsappBtn.addEventListener("click", () => {
  if (clickCount >= maxClicks) return;

  const msg = encodeURIComponent("🌟 Hey! Just found something awesome 👩‍💻✨\nJoin the *Tech For Girls* Community – where learning meets fun! 💡🎉\nLet’s grow together, learn tech, and build cool stuff 💻🔥\nClick here to explore: https://sruthi7890.github.io/tech-for-girls-registration/");
  const link = `https://wa.me/?text=${msg}`;
  window.open(link, "_blank");

  clickCount++;
  clickCounter.textContent = `Click count: ${clickCount}/5`;

  if (clickCount >= maxClicks) {
    clickCounter.textContent += " - Sharing complete. Please continue.";
  }
});

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (clickCount < maxClicks) {
    alert("Please complete WhatsApp sharing first (5/5).");
    return;
  }

  const file = screenshotInput.files[0];
  if (!file) {
    alert("Please upload a screenshot.");
    return;
  }

  const formData = new FormData(form);
  const cloudinaryUrl = "https://api.cloudinary.com/v1_1/diwuulcvu/image/upload";
  const uploadPreset = "techgirls";

  try {
    // Upload to Cloudinary
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);

    const cloudRes = await fetch(cloudinaryUrl, {
      method: "POST",
      body: uploadData,
    });

    const cloudinaryResult = await cloudRes.json();
    console.log("Cloudinary result:", cloudinaryResult);

    const imageUrl = cloudinaryResult.secure_url;

    if (!imageUrl) {
      alert("Image upload failed. Please try again.");
      return;
    }

    // Prepare data for Google Sheets
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      college: formData.get("college"),
      screenshot: imageUrl // ✅ fixed variable name
    };

    const response = await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const resultText = await response.text();
    console.log("Google Apps Script response:", resultText);

    if (resultText === "Success") {
      statusMessage.textContent = "🎉 Your submission has been recorded. Thanks for being part of Tech for Girls!";
      form.querySelectorAll("input, button").forEach(el => el.disabled = true);
      localStorage.setItem("formSubmitted", "true");
    } else {
      alert("Something went wrong on server. Try again.");
    }
  } catch (error) {
    alert("Something went wrong. Try again.");
    console.error("Form submission error:", error);
  }
});
