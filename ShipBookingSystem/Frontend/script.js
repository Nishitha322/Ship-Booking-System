const API_BASE = "http://127.0.0.1:8000";

// =====================================================================
// GLOBAL AUTHENTICATION & UTILITIES
// =====================================================================
function getCurrentUser() {
    const userJson = localStorage.getItem("currentPassenger");
    return userJson ? JSON.parse(userJson) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem("currentPassenger", JSON.stringify(user));
    } else {
        localStorage.removeItem("currentPassenger");
    }
}

function logout() {
    setCurrentUser(null);
    window.location.href = "login.html";
}

// Format Date/Time helper
function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Generate random transaction ID
function generateTxnId() {
    return 'TXN' + Math.floor(Math.random() * 9000000000 + 1000000000);
}

// Global Nav & Header Renderer
function initHeader() {
    const user = getCurrentUser();
    const navMenu = document.getElementById("nav-menu");
    if (!navMenu) return;

    let html = `
        <li><a href="index.html" class="nav-link" id="nav-home">Home</a></li>
        <li><a href="ships.html" class="nav-link" id="nav-ships">Ships</a></li>
    `;

    if (user) {
        html += `
            <li><a href="booking_history.html" class="nav-link" id="nav-history">My Trips</a></li>
            <li><a href="passenger_dashboard.html" class="nav-link" id="nav-passenger">Dashboard</a></li>
            <li><a href="admin_dashboard.html" class="nav-link" id="nav-admin">Admin Portal</a></li>
            <li class="nav-profile">
                <div class="nav-avatar">${user.full_name.charAt(0).toUpperCase()}</div>
                <span>Hi, ${user.full_name.split(' ')[0]}</span>
            </li>
            <li><a href="#" onclick="logout(); return false;" class="nav-btn-secondary">Logout</a></li>
        `;
    } else {
        html += `
            <li><a href="login.html" class="nav-link" id="nav-login">Login</a></li>
            <li><a href="register.html" class="nav-btn">Register</a></li>
        `;
    }

    navMenu.innerHTML = html;
    
    // Highlight Active Link
    const path = window.location.pathname.split("/").pop();
    if (path === "index.html" || path === "") {
        document.getElementById("nav-home")?.classList.add("active");
    } else if (path === "ships.html" || path === "ship_details.html") {
        document.getElementById("nav-ships")?.classList.add("active");
    } else if (path === "booking_history.html") {
        document.getElementById("nav-history")?.classList.add("active");
    } else if (path === "passenger_dashboard.html") {
        document.getElementById("nav-passenger")?.classList.add("active");
    } else if (path === "admin_dashboard.html") {
        document.getElementById("nav-admin")?.classList.add("active");
    } else if (path === "login.html") {
        document.getElementById("nav-login")?.classList.add("active");
    }
}

// Fetch wrapper with error reporting
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // Set headers if JSON payload
    if (options.body && typeof options.body === "object") {
        options.body = JSON.stringify(options.body);
        options.headers = {
            "Content-Type": "application/json",
            ...options.headers
        };
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API Fetch Error (${endpoint}):`, error);
        throw error;
    }
}

// =====================================================================
// PAGE-SPECIFIC INITIALIZATIONS
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    
    const pageId = document.body.dataset.page;
    if (pageId === "home") initHomePage();
    else if (pageId === "login") initLoginPage();
    else if (pageId === "register") initRegisterPage();
    else if (pageId === "ships") initShipsPage();
    else if (pageId === "ship-details") initShipDetailsPage();
    else if (pageId === "booking") initBookingPage();
    else if (pageId === "payment") initPaymentPage();
    else if (pageId === "booking-history") initBookingHistoryPage();
    else if (pageId === "passenger-dashboard") initPassengerDashboardPage();
    else if (pageId === "admin-dashboard") initAdminDashboardPage();
});

// ---------------------------------------------------------------------
// 1. HOME PAGE
// ---------------------------------------------------------------------
async function initHomePage() {
    // Load Featured Cruises
    try {
        const ships = await apiFetch("/ships/");
        const grid = document.getElementById("featured-cruises");
        if (!grid) return;
        
        // Show active ships
        const activeShips = ships.filter(s => s.status === "Active").slice(0, 3);
        grid.innerHTML = activeShips.map(s => `
            <div class="card">
                <div class="card-img-wrapper">
                    <img src="https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=600&auto=format&fit=crop" class="card-img" alt="${s.ship_name}">
                    <span class="card-badge">${s.ship_type}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${s.ship_name}</h3>
                    <p class="card-meta">
                        <span class="card-meta-item">👥 Capacity: ${s.capacity}</span>
                        <span class="card-meta-item">🚢 Operator: ${s.operator_name}</span>
                    </p>
                    <div class="card-footer">
                        <div class="card-price">From $8,500 <span>/trip</span></div>
                        <a href="ship_details.html?id=${s.ship_id}" class="btn-card">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error loading featured cruises:", err);
    }
    
    // Search Form Handler
    const searchForm = document.getElementById("home-search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const source = document.getElementById("search-source").value;
            const dest = document.getElementById("search-dest").value;
            const date = document.getElementById("search-date").value;
            
            // Redirect to ships page with query parameters
            window.location.href = `ships.html?source=${encodeURIComponent(source)}&dest=${encodeURIComponent(dest)}&date=${encodeURIComponent(date)}`;
        });
    }
}

// ---------------------------------------------------------------------
// 2. LOGIN PAGE
// ---------------------------------------------------------------------
function initLoginPage() {
    const form = document.getElementById("login-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        try {
            const res = await apiFetch("/passengers/login/", {
                method: "POST",
                body: { email, password }
            });
            if (res.status === "success") {
                setCurrentUser(res.passenger);
                window.location.href = "passenger_dashboard.html";
            }
        } catch (err) {
            alert(err.message || "Login failed. Please check credentials.");
        }
    });
}

// ---------------------------------------------------------------------
// 3. REGISTER PAGE
// ---------------------------------------------------------------------
function initRegisterPage() {
    const form = document.getElementById("register-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const full_name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const phone = document.getElementById("reg-phone").value;
        const nationality = document.getElementById("reg-nationality").value;
        const passport_number = document.getElementById("reg-passport").value;
        const password = document.getElementById("reg-password").value;
        
        try {
            const passenger = await apiFetch("/passengers/add/", {
                method: "POST",
                body: { full_name, email, phone, nationality, passport_number, password }
            });
            setCurrentUser(passenger);
            alert("Registration successful!");
            window.location.href = "passenger_dashboard.html";
        } catch (err) {
            alert(err.message || "Registration failed. Try a different email.");
        }
    });
}

// ---------------------------------------------------------------------
// 4. SHIPS PAGE
// ---------------------------------------------------------------------
async function initShipsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const sourceParam = urlParams.get("source");
    const destParam = urlParams.get("dest");
    const dateParam = urlParams.get("date");
    
    // Set search inputs if params exist
    if (sourceParam) document.getElementById("filter-source").value = sourceParam;
    if (destParam) document.getElementById("filter-dest").value = destParam;
    if (dateParam) document.getElementById("filter-date").value = dateParam;
    
    let schedules = [];
    
    try {
        schedules = await apiFetch("/schedules/");
        renderSchedules(schedules);
    } catch (err) {
        console.error("Error loading schedules:", err);
    }
    
    // Handle Filters
    const filterForm = document.getElementById("filter-form");
    if (filterForm) {
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            applyFilters();
        });
    }
    
    function applyFilters() {
        const src = document.getElementById("filter-source").value.toLowerCase();
        const dest = document.getElementById("filter-dest").value.toLowerCase();
        const date = document.getElementById("filter-date").value;
        const type = document.getElementById("filter-type").value;
        
        const filtered = schedules.filter(sch => {
            const matchesSrc = !src || sch.source_port.toLowerCase().includes(src);
            const matchesDest = !dest || sch.destination_port.toLowerCase().includes(dest);
            const matchesDate = !date || sch.departure_date === date;
            return matchesSrc && matchesDest && matchesDate;
        });
        
        renderSchedules(filtered);
    }
    
    if (sourceParam || destParam || dateParam) {
        applyFilters();
    }
    
    function renderSchedules(list) {
        const grid = document.getElementById("ships-grid");
        if (!grid) return;
        
        if (list.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                <h3 style="color: var(--text-slate);">No journeys found matching your search.</h3>
                <p>Try different ports or travel dates.</p>
            </div>`;
            return;
        }
        
        grid.innerHTML = list.map(sch => `
            <div class="card">
                <div class="card-img-wrapper">
                    <img src="https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=600&auto=format&fit=crop" class="card-img" alt="${sch.ship_name}">
                    <span class="card-badge">${sch.ship_name}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${sch.source_port} ➔ ${sch.destination_port}</h3>
                    <p class="card-meta">
                        <span class="card-meta-item">📅 Departs: ${formatDate(sch.departure_date)} at ${sch.departure_time}</span>
                        <span class="card-meta-item">🏁 Arrives: ${formatDate(sch.arrival_date)} at ${sch.arrival_time}</span>
                    </p>
                    <div class="card-footer">
                        <div class="card-price">$${sch.fare.toLocaleString()} <span>/passenger</span></div>
                        <a href="ship_details.html?id=${sch.schedule_id}" class="btn-card">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ---------------------------------------------------------------------
// 5. SHIP DETAILS PAGE
// ---------------------------------------------------------------------
async function initShipDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const scheduleId = urlParams.get("id");
    if (!scheduleId) {
        window.location.href = "ships.html";
        return;
    }
    
    let schedule = null;
    let selectedCabin = "Economy";
    let baseFare = 0;
    
    try {
        schedule = await apiFetch(`/schedules/`);
        // Find specific schedule
        schedule = schedule.find(s => s.schedule_id === parseInt(scheduleId));
        if (!schedule) throw new Error("Schedule not found");
        
        baseFare = schedule.fare;
        
        // Fill Page Details
        document.getElementById("ship-route").innerText = `${schedule.source_port} to ${schedule.destination_port}`;
        document.getElementById("ship-name-badge").innerText = schedule.ship_name;
        document.getElementById("journey-info").innerText = `Journey on ${formatDate(schedule.departure_date)} at ${schedule.departure_time}`;
        document.getElementById("base-fare-span").innerText = `$${baseFare.toLocaleString()}`;
        
        renderCabins();
        updateSummary();
    } catch (err) {
        alert(err.message || "Failed to load schedule details.");
        window.location.href = "ships.html";
    }
    
    function renderCabins() {
        const cabinList = [
            { type: "Economy", multiplier: 1.0, desc: "Standard seats, ocean view porthole, shared amenities." },
            { type: "Deluxe", multiplier: 1.4, desc: "Private room, double bed, en-suite bathroom, priority access." },
            { type: "Suite", multiplier: 2.0, desc: "Spacious master bedroom, lounge area, private balcony, steward." },
            { type: "Family Cabin", multiplier: 1.8, desc: "Quadruple bedding, play zone, child-proof amenities." },
            { type: "VIP Cabin", multiplier: 3.0, desc: "Top-deck location, luxury bathroom, complimentary bar & dinner." }
        ];
        
        const cabinGrid = document.getElementById("cabins-grid");
        if (!cabinGrid) return;
        
        cabinGrid.innerHTML = cabinList.map(c => {
            const total = baseFare * c.multiplier;
            const isSelected = c.type === selectedCabin;
            return `
                <div class="cabin-card ${isSelected ? 'selected' : ''}" data-type="${c.type}" data-price="${total}">
                    <div class="cabin-header">
                        <span class="cabin-name">${c.type}</span>
                        <span class="cabin-price">$${total.toLocaleString()}</span>
                    </div>
                    <p class="cabin-desc">${c.desc}</p>
                </div>
            `;
        }).join('');
        
        // Add click events to cabin cards
        document.querySelectorAll(".cabin-card").forEach(card => {
            card.addEventListener("click", () => {
                document.querySelectorAll(".cabin-card").forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");
                selectedCabin = card.dataset.type;
                updateSummary();
            });
        });
    }
    
    function updateSummary() {
        const multipliers = { "Economy": 1.0, "Deluxe": 1.4, "Suite": 2.0, "Family Cabin": 1.8, "VIP Cabin": 3.0 };
        const price = baseFare * multipliers[selectedCabin];
        
        document.getElementById("summary-ship").innerText = schedule.ship_name;
        document.getElementById("summary-route").innerText = `${schedule.source_port} to ${schedule.destination_port}`;
        document.getElementById("summary-date").innerText = formatDate(schedule.departure_date);
        document.getElementById("summary-cabin").innerText = selectedCabin;
        document.getElementById("summary-total").innerText = `$${price.toLocaleString()}`;
    }
    
    // "Book Now" Button Handler
    const bookBtn = document.getElementById("btn-book-now");
    if (bookBtn) {
        bookBtn.addEventListener("click", () => {
            const user = getCurrentUser();
            if (!user) {
                alert("Please login first to proceed with booking.");
                window.location.href = `login.html?redirect=ship_details.html?id=${scheduleId}`;
                return;
            }
            
            const multipliers = { "Economy": 1.0, "Deluxe": 1.4, "Suite": 2.0, "Family Cabin": 1.8, "VIP Cabin": 3.0 };
            const price = baseFare * multipliers[selectedCabin];
            
            // Store checkout session details in localStorage
            localStorage.setItem("checkoutSession", JSON.stringify({
                schedule_id: schedule.schedule_id,
                ship_name: schedule.ship_name,
                source_port: schedule.source_port,
                destination_port: schedule.destination_port,
                departure_date: schedule.departure_date,
                cabin_type: selectedCabin,
                total_amount: price
            }));
            
            window.location.href = "booking.html";
        });
    }
}

// ---------------------------------------------------------------------
// 6. BOOKING PAGE
// ---------------------------------------------------------------------
function initBookingPage() {
    const user = getCurrentUser();
    const session = JSON.parse(localStorage.getItem("checkoutSession"));
    
    if (!user || !session) {
        window.location.href = "ships.html";
        return;
    }
    
    // Pre-fill Passenger details
    document.getElementById("book-name").value = user.full_name;
    document.getElementById("book-email").value = user.email;
    document.getElementById("book-phone").value = user.phone;
    document.getElementById("book-passport").value = user.passport_number;
    
    // Fill Booking Summary
    document.getElementById("sum-ship").innerText = session.ship_name;
    document.getElementById("sum-route").innerText = `${session.source_port} to ${session.destination_port}`;
    document.getElementById("sum-date").innerText = formatDate(session.departure_date);
    document.getElementById("sum-cabin").innerText = session.cabin_type;
    document.getElementById("sum-total").innerText = `$${session.total_amount.toLocaleString()}`;
    
    // Confirm booking
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            try {
                // Post Booking to backend
                const booking = await apiFetch("/bookings/add/", {
                    method: "POST",
                    body: {
                        passenger_name: user.full_name,
                        ship_name: session.ship_name,
                        cabin_type: session.cabin_type,
                        journey_date: session.departure_date,
                        source_port: session.source_port,
                        destination_port: session.destination_port,
                        total_amount: session.total_amount,
                        booking_status: "Waiting"
                    }
                });
                
                // Save booking details for checkout payment step
                localStorage.setItem("paymentSession", JSON.stringify({
                    booking_id: booking.booking_id,
                    amount: booking.total_amount,
                    passenger_name: user.full_name
                }));
                
                window.location.href = "payment.html";
            } catch (err) {
                alert(err.message || "Failed to confirm booking.");
            }
        });
    }
}

// ---------------------------------------------------------------------
// 7. PAYMENT PAGE
// ---------------------------------------------------------------------
function initPaymentPage() {
    const payment = JSON.parse(localStorage.getItem("paymentSession"));
    if (!payment) {
        window.location.href = "ships.html";
        return;
    }
    
    document.getElementById("pay-amount").innerText = `$${payment.amount.toLocaleString()}`;
    
    let selectedMethod = "UPI";
    
    // Select payment method UI
    const methods = document.querySelectorAll(".payment-method-card");
    methods.forEach(m => {
        m.addEventListener("click", () => {
            methods.forEach(x => x.classList.remove("active"));
            m.classList.add("active");
            selectedMethod = m.dataset.method;
        });
    });
    
    // Submit Payment
    const payBtn = document.getElementById("btn-pay-now");
    if (payBtn) {
        payBtn.addEventListener("click", async () => {
            payBtn.innerText = "Processing Transaction...";
            payBtn.disabled = true;
            
            try {
                // Post payment
                const txnId = generateTxnId();
                await apiFetch("/payments/add/", {
                    method: "POST",
                    body: {
                        booking_id: payment.booking_id,
                        passenger_name: payment.passenger_name,
                        amount: payment.amount,
                        payment_method: selectedMethod,
                        payment_status: "Success",
                        transaction_id: txnId
                    }
                });
                
                // Clear sessions
                localStorage.removeItem("checkoutSession");
                localStorage.removeItem("paymentSession");
                
                // Show success UI
                showPaymentStatus("Success", txnId);
            } catch (err) {
                payBtn.innerText = "Confirm & Pay";
                payBtn.disabled = false;
                alert(err.message || "Payment transaction failed.");
                showPaymentStatus("Failed");
            }
        });
    }
    
    function showPaymentStatus(status, txnId = "") {
        const checkoutGrid = document.querySelector(".checkout-wrapper");
        if (!checkoutGrid) return;
        
        let iconHtml = '';
        let title = '';
        let desc = '';
        let btnText = '';
        let redirect = '';
        
        if (status === "Success") {
            iconHtml = `
                <svg viewBox="0 0 24 24" class="status-icon" fill="none" stroke="var(--accent-teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;
            title = "Payment Successful!";
            desc = `Thank you for sailing with us. Your booking is confirmed.<br><strong style="color:var(--primary-navy)">Transaction ID: ${txnId}</strong>`;
            btnText = "View Booking History";
            redirect = "booking_history.html";
        } else {
            iconHtml = `
                <svg viewBox="0 0 24 24" class="status-icon" fill="none" stroke="var(--cta-coral)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
            title = "Payment Failed";
            desc = "We couldn't process your transaction. Please try another payment method or contact support.";
            btnText = "Try Again";
            redirect = "ships.html";
        }
        
        checkoutGrid.innerHTML = `
            <div style="grid-column: 1/-1; display:flex; justify-content:center; align-items:center; padding: 4rem 0;">
                <div class="payment-status-box">
                    ${iconHtml}
                    <h2 class="section-title" style="margin-bottom:1rem">${title}</h2>
                    <p style="margin-bottom:2.5rem; color:var(--text-slate)">${desc}</p>
                    <a href="${redirect}" class="btn-submit" style="display:inline-block; padding: 0.9rem 2.5rem; text-decoration:none">${btnText}</a>
                </div>
            </div>
        `;
    }
}

// ---------------------------------------------------------------------
// 8. BOOKING HISTORY PAGE
// ---------------------------------------------------------------------
async function initBookingHistoryPage() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    
    let bookings = [];
    
    try {
        bookings = await apiFetch("/bookings/");
        // Filter by current passenger
        const myBookings = bookings.filter(b => b.passenger_name === user.full_name);
        
        const upcomingList = myBookings.filter(b => b.booking_status !== "Cancelled");
        const cancelledList = myBookings.filter(b => b.booking_status === "Cancelled");
        
        const upcomingTbody = document.getElementById("upcoming-tbody");
        const historyTbody = document.getElementById("history-tbody");
        
        if (upcomingTbody) renderTable(upcomingTbody, upcomingList);
        if (historyTbody) renderTable(historyTbody, cancelledList);
    } catch (err) {
        console.error("Error loading booking history:", err);
    }
    
    function renderTable(tbody, list) {
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2.5rem; color:var(--text-slate)">No bookings found.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = list.map(b => `
            <tr>
                <td><strong>#${b.booking_id}</strong></td>
                <td>${b.ship_name}</td>
                <td>${b.source_port} ➔ ${b.destination_port}</td>
                <td>${formatDate(b.journey_date)}</td>
                <td><span class="badge-status">${b.cabin_type}</span></td>
                <td>$${b.total_amount.toLocaleString()}</td>
                <td>
                    <span class="badge-status ${getStatusClass(b.booking_status)}">
                        ${b.booking_status}
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    function getStatusClass(status) {
        if (status === "Confirmed") return "status-confirmed";
        if (status === "Waiting") return "status-waiting";
        return "status-cancelled";
    }
}

// ---------------------------------------------------------------------
// 9. PASSENGER DASHBOARD PAGE
// ---------------------------------------------------------------------
async function initPassengerDashboardPage() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    
    document.getElementById("user-full-name").innerText = user.full_name;
    document.getElementById("user-meta-info").innerText = `${user.nationality} | Passport: ${user.passport_number}`;
    
    try {
        // Fetch passenger bookings
        const bookings = await apiFetch("/bookings/");
        const myBookings = bookings.filter(b => b.passenger_name === user.full_name);
        
        // Calculate Metrics
        const totalBookings = myBookings.length;
        const upcomingBookings = myBookings.filter(b => b.booking_status === "Confirmed").length;
        const waitingBookings = myBookings.filter(b => b.booking_status === "Waiting").length;
        
        document.getElementById("metric-total").innerText = totalBookings;
        document.getElementById("metric-upcoming").innerText = upcomingBookings;
        document.getElementById("metric-waiting").innerText = waitingBookings;
        
        // Load Payments
        const payments = await apiFetch("/payments/");
        const myPayments = payments.filter(p => p.passenger_name === user.full_name);
        
        const paymentTbody = document.getElementById("passenger-payments-tbody");
        if (paymentTbody) {
            if (myPayments.length === 0) {
                paymentTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-slate)">No payment history found.</td></tr>`;
                return;
            }
            
            paymentTbody.innerHTML = myPayments.map(p => `
                <tr>
                    <td><strong>#${p.payment_id}</strong></td>
                    <td>Booking #${p.booking_id}</td>
                    <td>$${p.amount.toLocaleString()}</td>
                    <td>${p.payment_method}</td>
                    <td>${p.transaction_id}</td>
                    <td>
                        <span class="badge-status ${p.payment_status === 'Success' ? 'status-success' : 'status-failed'}">
                            ${p.payment_status}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error("Error initializing passenger dashboard:", err);
    }
}

// ---------------------------------------------------------------------
// 10. ADMIN DASHBOARD PAGE
// ---------------------------------------------------------------------
async function initAdminDashboardPage() {
    let currentPanel = "ships";
    let currentData = [];
    
    // Panel Navigation
    const links = document.querySelectorAll(".sidebar-link");
    links.forEach(l => {
        l.addEventListener("click", (e) => {
            e.preventDefault();
            links.forEach(x => x.classList.remove("active"));
            l.classList.add("active");
            currentPanel = l.dataset.panel;
            loadPanelData();
        });
    });
    
    // Modal controls
    const modal = document.getElementById("entity-modal");
    const closeModalBtn = document.querySelector(".btn-close-modal");
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            modal.classList.remove("open");
        });
    }
    
    // Add Entity Button Click
    const addBtn = document.getElementById("btn-add-entity");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            renderEntityForm("Add");
            modal.classList.add("open");
        });
    }
    
    // Load Panel Data on start
    loadPanelData();
    
    async function loadPanelData() {
        const panelTitle = document.getElementById("panel-title");
        const panelSubtitle = document.getElementById("panel-subtitle");
        const tableHeader = document.getElementById("table-headers");
        const tableBody = document.getElementById("table-body");
        
        if (!panelTitle) return;
        
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:3rem;">Loading panel data...</td></tr>`;
        
        try {
            if (currentPanel === "ships") {
                panelTitle.innerText = "Ship Fleet Management";
                panelSubtitle.innerText = "Add, edit, or decommission vessels in the cruise fleet.";
                addBtn.style.display = "block";
                addBtn.innerText = "+ Add Ship";
                
                currentData = await apiFetch("/ships/");
                tableHeader.innerHTML = `
                    <th>ID</th>
                    <th>Vessel Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Operator</th>
                    <th>Status</th>
                    <th>Actions</th>
                `;
                tableBody.innerHTML = currentData.map(s => `
                    <tr>
                        <td><strong>#${s.ship_id}</strong></td>
                        <td>${s.ship_name}</td>
                        <td><span class="badge-status status-confirmed">${s.ship_type}</span></td>
                        <td>${s.capacity} passengers</td>
                        <td>${s.operator_name}</td>
                        <td><span class="badge-status ${getShipStatusClass(s.status)}">${s.status}</span></td>
                        <td class="table-actions">
                            <button class="btn-action btn-action-edit" onclick="editEntity(${s.ship_id})">Edit</button>
                            <button class="btn-action btn-action-delete" onclick="deleteEntity(${s.ship_id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            } 
            else if (currentPanel === "passengers") {
                panelTitle.innerText = "Registered Passenger Database";
                panelSubtitle.innerText = "Monitor client records and contact credentials.";
                addBtn.style.display = "block";
                addBtn.innerText = "+ Add Passenger";
                
                currentData = await apiFetch("/passengers/");
                tableHeader.innerHTML = `
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Contact Phone</th>
                    <th>Nationality</th>
                    <th>Passport No.</th>
                    <th>Actions</th>
                `;
                tableBody.innerHTML = currentData.map(p => `
                    <tr>
                        <td><strong>#${p.passenger_id}</strong></td>
                        <td>${p.full_name}</td>
                        <td>${p.email}</td>
                        <td>${p.phone}</td>
                        <td>${p.nationality}</td>
                        <td><code>${p.passport_number}</code></td>
                        <td class="table-actions">
                            <button class="btn-action btn-action-edit" onclick="editEntity(${p.passenger_id})">Edit</button>
                            <button class="btn-action btn-action-delete" onclick="deleteEntity(${p.passenger_id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            } 
            else if (currentPanel === "schedules") {
                panelTitle.innerText = "Voyage Schedule Coordinator";
                panelSubtitle.innerText = "Configure departure ports, destinations, timings, and ticket fares.";
                addBtn.style.display = "block";
                addBtn.innerText = "+ Add Schedule";
                
                currentData = await apiFetch("/schedules/");
                tableHeader.innerHTML = `
                    <th>ID</th>
                    <th>Ship Name</th>
                    <th>Source Port</th>
                    <th>Destination Port</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Fare</th>
                    <th>Actions</th>
                `;
                tableBody.innerHTML = currentData.map(sch => `
                    <tr>
                        <td><strong>#${sch.schedule_id}</strong></td>
                        <td>${sch.ship_name}</td>
                        <td>${sch.source_port}</td>
                        <td>${sch.destination_port}</td>
                        <td>${formatDate(sch.departure_date)} at ${sch.departure_time}</td>
                        <td>${formatDate(sch.arrival_date)} at ${sch.arrival_time}</td>
                        <td><strong>$${sch.fare.toLocaleString()}</strong></td>
                        <td class="table-actions">
                            <button class="btn-action btn-action-edit" onclick="editEntity(${sch.schedule_id})">Edit</button>
                            <button class="btn-action btn-action-delete" onclick="deleteEntity(${sch.schedule_id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            } 
            else if (currentPanel === "bookings") {
                panelTitle.innerText = "Cabin Tickets Bookings Manager";
                panelSubtitle.innerText = "Review upcoming tickets statuses and total transaction amounts.";
                addBtn.style.display = "block";
                addBtn.innerText = "+ Add Booking";
                
                currentData = await apiFetch("/bookings/");
                tableHeader.innerHTML = `
                    <th>ID</th>
                    <th>Passenger</th>
                    <th>Ship</th>
                    <th>Cabin Type</th>
                    <th>Journey Date</th>
                    <th>Route</th>
                    <th>Fare Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                `;
                tableBody.innerHTML = currentData.map(b => `
                    <tr>
                        <td><strong>#${b.booking_id}</strong></td>
                        <td>${b.passenger_name}</td>
                        <td>${b.ship_name}</td>
                        <td><span class="badge-status">${b.cabin_type}</span></td>
                        <td>${formatDate(b.journey_date)}</td>
                        <td>${b.source_port} ➔ ${b.destination_port}</td>
                        <td>$${b.total_amount.toLocaleString()}</td>
                        <td><span class="badge-status ${getBookingStatusClass(b.booking_status)}">${b.booking_status}</span></td>
                        <td class="table-actions">
                            <button class="btn-action btn-action-edit" onclick="editEntity(${b.booking_id})">Edit</button>
                            <button class="btn-action btn-action-delete" onclick="deleteEntity(${b.booking_id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            } 
            else if (currentPanel === "payments") {
                panelTitle.innerText = "System Payments Transactions Log";
                panelSubtitle.innerText = "Track transaction histories, methods, and processing statuses.";
                addBtn.style.display = "block";
                addBtn.innerText = "+ Add Payment";
                
                currentData = await apiFetch("/payments/");
                tableHeader.innerHTML = `
                    <th>ID</th>
                    <th>Booking ID</th>
                    <th>Passenger</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Transaction Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                `;
                tableBody.innerHTML = currentData.map(p => `
                    <tr>
                        <td><strong>#${p.payment_id}</strong></td>
                        <td>Booking #${p.booking_id}</td>
                        <td>${p.passenger_name}</td>
                        <td>$${p.amount.toLocaleString()}</td>
                        <td>${p.payment_method}</td>
                        <td><code>${p.transaction_id}</code></td>
                        <td><span class="badge-status ${p.payment_status === 'Success' ? 'status-success' : 'status-failed'}">${p.payment_status}</span></td>
                        <td class="table-actions">
                            <button class="btn-action btn-action-edit" onclick="editEntity(${p.payment_id})">Edit</button>
                            <button class="btn-action btn-action-delete" onclick="deleteEntity(${p.payment_id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:3rem; color:var(--cta-coral)">Error loading panel: ${err.message}</td></tr>`;
        }
    }
    
    function getShipStatusClass(status) {
        if (status === "Active") return "status-success";
        if (status === "Maintenance") return "status-maintenance";
        return "status-failed";
    }
    
    function getBookingStatusClass(status) {
        if (status === "Confirmed") return "status-confirmed";
        if (status === "Waiting") return "status-waiting";
        return "status-cancelled";
    }
    
    // Render CRUD form inside Modal
    function renderEntityForm(action, entityId = null) {
        const title = document.getElementById("modal-entity-title");
        const body = document.getElementById("modal-form-body");
        
        title.innerText = `${action} ${currentPanel.charAt(0).toUpperCase() + currentPanel.slice(0, -1)}`;
        
        const entity = entityId ? currentData.find(x => {
            if (currentPanel === "ships") return x.ship_id === entityId;
            if (currentPanel === "passengers") return x.passenger_id === entityId;
            if (currentPanel === "schedules") return x.schedule_id === entityId;
            if (currentPanel === "bookings") return x.booking_id === entityId;
            if (currentPanel === "payments") return x.payment_id === entityId;
        }) : {};
        
        let formFields = "";
        
        if (currentPanel === "ships") {
            formFields = `
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Vessel Name</label>
                    <input type="text" id="m-ship-name" class="form-input" value="${entity.ship_name || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Vessel Type</label>
                    <select id="m-ship-type" class="form-input" required>
                        <option value="Cruise Ship" ${entity.ship_type === 'Cruise Ship' ? 'selected' : ''}>Cruise Ship</option>
                        <option value="Ferry" ${entity.ship_type === 'Ferry' ? 'selected' : ''}>Ferry</option>
                        <option value="Cargo Passenger Ship" ${entity.ship_type === 'Cargo Passenger Ship' ? 'selected' : ''}>Cargo Passenger Ship</option>
                        <option value="Luxury Yacht" ${entity.ship_type === 'Luxury Yacht' ? 'selected' : ''}>Luxury Yacht</option>
                        <option value="River Cruise" ${entity.ship_type === 'River Cruise' ? 'selected' : ''}>River Cruise</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Capacity</label>
                    <input type="number" id="m-ship-capacity" class="form-input" value="${entity.capacity || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Operator Name</label>
                    <input type="text" id="m-ship-operator" class="form-input" value="${entity.operator_name || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Status</label>
                    <select id="m-ship-status" class="form-input" required>
                        <option value="Active" ${entity.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Maintenance" ${entity.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="Inactive" ${entity.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            `;
        } 
        else if (currentPanel === "passengers") {
            formFields = `
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Full Name</label>
                    <input type="text" id="m-p-name" class="form-input" value="${entity.full_name || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Email Address</label>
                    <input type="email" id="m-p-email" class="form-input" value="${entity.email || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Phone Number</label>
                    <input type="text" id="m-p-phone" class="form-input" value="${entity.phone || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Nationality</label>
                    <input type="text" id="m-p-nationality" class="form-input" value="${entity.nationality || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Passport Number</label>
                    <input type="text" id="m-p-passport" class="form-input" value="${entity.passport_number || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Password</label>
                    <input type="text" id="m-p-password" class="form-input" value="${entity.password || ''}" required>
                </div>
            `;
        }
        else if (currentPanel === "schedules") {
            formFields = `
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Ship Name</label>
                    <input type="text" id="m-sch-ship" class="form-input" value="${entity.ship_name || ''}" required placeholder="e.g. Ocean Paradise">
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Source Port</label>
                    <input type="text" id="m-sch-source" class="form-input" value="${entity.source_port || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Destination Port</label>
                    <input type="text" id="m-sch-dest" class="form-input" value="${entity.destination_port || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Departure Date</label>
                    <input type="date" id="m-sch-dep-date" class="form-input" value="${entity.departure_date || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Departure Time</label>
                    <input type="text" id="m-sch-dep-time" class="form-input" value="${entity.departure_time || ''}" placeholder="HH:MM" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Arrival Date</label>
                    <input type="date" id="m-sch-arr-date" class="form-input" value="${entity.arrival_date || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Arrival Time</label>
                    <input type="text" id="m-sch-arr-time" class="form-input" value="${entity.arrival_time || ''}" placeholder="HH:MM" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Fare Amount ($)</label>
                    <input type="number" id="m-sch-fare" class="form-input" value="${entity.fare || ''}" required>
                </div>
            `;
        }
        else if (currentPanel === "bookings") {
            formFields = `
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Passenger Name</label>
                    <input type="text" id="m-b-passenger" class="form-input" value="${entity.passenger_name || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Ship Name</label>
                    <input type="text" id="m-b-ship" class="form-input" value="${entity.ship_name || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Cabin Type</label>
                    <select id="m-b-cabin" class="form-input" required>
                        <option value="Economy" ${entity.cabin_type === 'Economy' ? 'selected' : ''}>Economy</option>
                        <option value="Deluxe" ${entity.cabin_type === 'Deluxe' ? 'selected' : ''}>Deluxe</option>
                        <option value="Suite" ${entity.cabin_type === 'Suite' ? 'selected' : ''}>Suite</option>
                        <option value="Family Cabin" ${entity.cabin_type === 'Family Cabin' ? 'selected' : ''}>Family Cabin</option>
                        <option value="VIP Cabin" ${entity.cabin_type === 'VIP Cabin' ? 'selected' : ''}>VIP Cabin</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Journey Date</label>
                    <input type="date" id="m-b-date" class="form-input" value="${entity.journey_date || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Source Port</label>
                    <input type="text" id="m-b-source" class="form-input" value="${entity.source_port || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Destination Port</label>
                    <input type="text" id="m-b-dest" class="form-input" value="${entity.destination_port || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Total Amount ($)</label>
                    <input type="number" id="m-b-total" class="form-input" value="${entity.total_amount || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Booking Status</label>
                    <select id="m-b-status" class="form-input" required>
                        <option value="Confirmed" ${entity.booking_status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Waiting" ${entity.booking_status === 'Waiting' ? 'selected' : ''}>Waiting</option>
                        <option value="Cancelled" ${entity.booking_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            `;
        }
        else if (currentPanel === "payments") {
            formFields = `
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Booking ID</label>
                    <input type="number" id="m-pay-booking" class="form-input" value="${entity.booking_id || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Passenger Name</label>
                    <input type="text" id="m-pay-passenger" class="form-input" value="${entity.passenger_name || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Amount ($)</label>
                    <input type="number" id="m-pay-amount" class="form-input" value="${entity.amount || ''}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Payment Method</label>
                    <select id="m-pay-method" class="form-input" required>
                        <option value="UPI" ${entity.payment_method === 'UPI' ? 'selected' : ''}>UPI</option>
                        <option value="Credit Card" ${entity.payment_method === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                        <option value="Debit Card" ${entity.payment_method === 'Debit Card' ? 'selected' : ''}>Debit Card</option>
                        <option value="Net Banking" ${entity.payment_method === 'Net Banking' ? 'selected' : ''}>Net Banking</option>
                        <option value="Wallet" ${entity.payment_method === 'Wallet' ? 'selected' : ''}>Wallet</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Transaction ID</label>
                    <input type="text" id="m-pay-txn" class="form-input" value="${entity.transaction_id || generateTxnId()}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Payment Date</label>
                    <input type="date" id="m-pay-date" class="form-input" value="${entity.payment_date || new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group" style="margin-bottom:1.25rem">
                    <label>Payment Status</label>
                    <select id="m-pay-status" class="form-input" required>
                        <option value="Success" ${entity.payment_status === 'Success' ? 'selected' : ''}>Success</option>
                        <option value="Pending" ${entity.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Failed" ${entity.payment_status === 'Failed' ? 'selected' : ''}>Failed</option>
                    </select>
                </div>
            `;
        }
        
        body.innerHTML = `
            ${formFields}
            <button type="submit" class="btn-submit" style="width:100%">${action === 'Add' ? 'Create' : 'Save Changes'}</button>
        `;
        
        const modalForm = document.getElementById("modal-form");
        
        // Remove old submit listener if exists
        const newForm = modalForm.cloneNode(true);
        modalForm.parentNode.replaceChild(newForm, modalForm);
        
        newForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            let payload = {};
            let endpoint = "";
            let method = "POST";
            
            if (currentPanel === "ships") {
                payload = {
                    ship_name: document.getElementById("m-ship-name").value,
                    ship_type: document.getElementById("m-ship-type").value,
                    capacity: parseInt(document.getElementById("m-ship-capacity").value),
                    operator_name: document.getElementById("m-ship-operator").value,
                    status: document.getElementById("m-ship-status").value
                };
                endpoint = action === "Add" ? "/ships/add/" : `/ships/update/${entityId}/`;
                method = action === "Add" ? "POST" : "PUT";
            }
            else if (currentPanel === "passengers") {
                payload = {
                    full_name: document.getElementById("m-p-name").value,
                    email: document.getElementById("m-p-email").value,
                    phone: document.getElementById("m-p-phone").value,
                    nationality: document.getElementById("m-p-nationality").value,
                    passport_number: document.getElementById("m-p-passport").value,
                    password: document.getElementById("m-p-password").value
                };
                endpoint = action === "Add" ? "/passengers/add/" : `/passengers/update/${entityId}/`;
                method = action === "Add" ? "POST" : "PUT";
            }
            else if (currentPanel === "schedules") {
                payload = {
                    ship_name: document.getElementById("m-sch-ship").value,
                    source_port: document.getElementById("m-sch-source").value,
                    destination_port: document.getElementById("m-sch-dest").value,
                    departure_date: document.getElementById("m-sch-dep-date").value,
                    departure_time: document.getElementById("m-sch-dep-time").value,
                    arrival_date: document.getElementById("m-sch-arr-date").value,
                    arrival_time: document.getElementById("m-sch-arr-time").value,
                    fare: parseFloat(document.getElementById("m-sch-fare").value)
                };
                endpoint = action === "Add" ? "/schedules/add/" : `/schedules/update/${entityId}/`;
                method = action === "Add" ? "POST" : "PUT";
            }
            else if (currentPanel === "bookings") {
                payload = {
                    passenger_name: document.getElementById("m-b-passenger").value,
                    ship_name: document.getElementById("m-b-ship").value,
                    cabin_type: document.getElementById("m-b-cabin").value,
                    journey_date: document.getElementById("m-b-date").value,
                    source_port: document.getElementById("m-b-source").value,
                    destination_port: document.getElementById("m-b-dest").value,
                    total_amount: parseFloat(document.getElementById("m-b-total").value),
                    booking_status: document.getElementById("m-b-status").value
                };
                endpoint = action === "Add" ? "/bookings/add/" : `/bookings/update/${entityId}/`;
                method = action === "Add" ? "POST" : "PUT";
            }
            else if (currentPanel === "payments") {
                payload = {
                    booking_id: parseInt(document.getElementById("m-pay-booking").value),
                    passenger_name: document.getElementById("m-pay-passenger").value,
                    amount: parseFloat(document.getElementById("m-pay-amount").value),
                    payment_method: document.getElementById("m-pay-method").value,
                    transaction_id: document.getElementById("m-pay-txn").value,
                    payment_date: document.getElementById("m-pay-date").value,
                    payment_status: document.getElementById("m-pay-status").value
                };
                endpoint = action === "Add" ? "/payments/add/" : `/payments/update/${entityId}/`;
                method = action === "Add" ? "POST" : "PUT";
            }
            
            try {
                await apiFetch(endpoint, {
                    method: method,
                    body: payload
                });
                modal.classList.remove("open");
                loadPanelData();
            } catch (err) {
                alert(`Error saving record: ${err.message}`);
            }
        });
    }

    // Global exposed callbacks for table buttons
    window.editEntity = function(id) {
        renderEntityForm("Edit", id);
        modal.classList.add("open");
    };
    
    window.deleteEntity = async function(id) {
        if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
        
        let endpoint = "";
        if (currentPanel === "ships") endpoint = `/ships/delete/${id}/`;
        else if (currentPanel === "passengers") endpoint = `/passengers/delete/${id}/`;
        else if (currentPanel === "schedules") endpoint = `/schedules/delete/${id}/`;
        else if (currentPanel === "bookings") endpoint = `/bookings/delete/${id}/`;
        else if (currentPanel === "payments") endpoint = `/payments/delete/${id}/`;
        
        try {
            await apiFetch(endpoint, { method: "DELETE" });
            loadPanelData();
        } catch (err) {
            alert(`Error deleting record: ${err.message}`);
        }
    };
}
