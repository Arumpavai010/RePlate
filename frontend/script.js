// script.js

const API_URL = "https://replate-ttjj.onrender.com/api";
const token = localStorage.getItem("token");

// Donor Page Elements
const donorName = document.getElementById("donorName");
const foodName = document.getElementById("foodName");
const quantity = document.getElementById("quantity");
const preparedTime = document.getElementById("preparedTime");
const foodType = document.getElementById("foodType");
const locationInput = document.getElementById("location");
const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");
const form = document.getElementById("donationForm");

// Donor Page: Submit Donation
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const donation = {
      donor: donorName.value.trim(),
      contactInfo: document.getElementById("contactInfo").value.trim(),
      food: foodName.value.trim(),
      qty: parseInt(quantity.value, 10),
      prepTime: preparedTime.value,
      safeHours: parseInt(foodType.value, 10),
      location: locationInput.value.trim(),
      lat: latitude.value ? parseFloat(latitude.value) : null,
      lon: longitude.value ? parseFloat(longitude.value) : null,
      status: "Pending"
    };

    try {
      const res = await fetch(`${API_URL}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // ✅ send JWT
        },
        body: JSON.stringify(donation)
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      await res.json();
      alert("Donation Submitted Successfully!");
      form.reset();

    } catch (err) {
      alert("Error submitting donation: " + err.message);
    }
  });
}

// Receiver Page: Load Pending + Requested Donations
async function loadDonations() {
  const donationList = document.getElementById("donationList");
  if (!donationList) return;

  try {
    const res = await fetch(`${API_URL}/donations`);
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);

    const donations = await res.json();

    const visibleDonations = donations.filter(
      d => d.status === "Pending" || d.status === "Requested"
    );

    if (visibleDonations.length === 0) {
      donationList.innerHTML =
        `<p style="text-align:center;">No pending/requested donations available.</p>`;
      return;
    }

    donationList.innerHTML = "";

    visibleDonations.forEach((donation) => {
      const expiry = calculateExpiry(donation.prepTime, donation.safeHours);
      const hoursLeft = (expiry - new Date()) / 3600000;
      const risk = getRisk(hoursLeft);

      const card = document.createElement("div");
      card.className =
        hoursLeft <= 0
          ? "donation-card expired"
          : `donation-card ${risk.toLowerCase()}`;

      let mapLink = "";
      if (donation.lat !== null && donation.lon !== null) {
        mapLink = `
          <p>
            <a href="https://www.google.com/maps/search/?api=1&query=${Number(donation.lat)},${Number(donation.lon)}"
               target="_blank">
               View on Map
            </a>
          </p>`;
      } else if (donation.location) {
        mapLink = `
          <p>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donation.location)}"
               target="_blank">
               View on Map
            </a>
          </p>`;
      }

      let statusBadge = "";
      if (donation.status === "Pending") {
        statusBadge = `<span style="color:white; background:#10b981; padding:2px 8px; border-radius:6px;">PENDING</span>`;
      } else if (donation.status === "Requested") {
        statusBadge = `<span style="color:white; background:#f59e0b; padding:2px 8px; border-radius:6px;">REQUESTED</span>`;
      }

      const statusDropdown = `
        <label><b>Update Status:</b></label>
        <select onchange="updateDonationStatus('${donation._id}', this.value)">
          <option value="Pending" ${donation.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Requested" ${donation.status === "Requested" ? "selected" : ""}>Requested</option>
          <option value="Collected" ${donation.status === "Collected" ? "selected" : ""}>Collected</option>
        </select>
      `;

      const claimBtn = `
        <button onclick="claimDonation('${donation._id}')">Claim</button>
      `;

      card.innerHTML = `
        <h3>${donation.food}</h3>
        <p><b>Donor:</b> ${donation.donor}</p>
        <p><b>Contact:</b> ${donation.contactInfo || "N/A"}</p>
        <p><b>Quantity:</b> ${donation.qty || "N/A"} meals</p>
        <p><b>Location:</b> ${donation.location || "N/A"}</p>
        <p><b>Expires in:</b> ${hoursLeft > 0 ? hoursLeft.toFixed(1) + " hrs" : "Expired"}</p>
        <p><b>Risk Level:</b> ${risk}</p>
        <p><b>Status:</b> ${statusBadge}</p>
        ${mapLink}
        ${statusDropdown}
        ${claimBtn}
      `;

      donationList.appendChild(card);
    });
  } catch (err) {
    alert("Error loading donations: " + err.message);
  }
}

// Update Donation Status
async function updateDonationStatus(donationId, newStatus) {
  try {
    const res = await fetch(
      `${API_URL}/donations/${donationId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // ✅ send JWT
        },
        body: JSON.stringify({ status: newStatus })
      }
    );

    if (!res.ok) throw new Error(`Server responded with ${res.status}`);

    await res.json();
    alert(`Donation status updated to ${newStatus}`);
    loadDonations();
  } catch (err) {
    alert("Error updating donation: " + err.message);
  }
}

// Claim Donation
async function claimDonation(donationId) {
  try {
    const res = await fetch(
      `${API_URL}/donations/${donationId}/claim`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}` // ✅ send JWT
        }
      }
    );

    if (!res.ok) throw new Error(`Server responded with ${res.status}`);

    const data = await res.json();
    alert(data.message || "Donation claimed!");
    loadDonations();
  } catch (err) {
    alert("Error claiming donation: " + err.message);
  }
}

// Calculate Expiry
function calculateExpiry(time, hours) {
  const [h, m] = time.split(":").map(Number);
  const prepDate = new Date();
  prepDate.setHours(h, m, 0, 0);
  return new Date(prepDate.getTime() + hours * 3600000);
}

// Risk Level
function getRisk(hoursLeft) {
  if (hoursLeft <= 0) return "EXPIRED";
  if (hoursLeft > 2) return "LOW";
  if (hoursLeft > 1) return "MEDIUM";
  return "HIGH";
}

// GPS Location + Address Conversion
async function getLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    latitude.value = lat;
    longitude.value = lon;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();

      locationInput.value =
        data.address?.suburb ||
        data.address?.city ||
        data.address?.town ||
        data.display_name ||
        "Detected Location";
    } catch {
      locationInput.value = "Detected Location";
    }
  });
}