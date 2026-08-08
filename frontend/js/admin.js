// ============================================================
// CAMPUSPULSE — ADMIN DASHBOARD
// Complete MongoDB Feedback Analytics
// ============================================================


// ============================================================
// API
// ============================================================

const API_URL = "https://campuspulse-1-20gy.onrender.com/api/feedback";

let allFeedback = [];


// ============================================================
// LOAD FEEDBACK FROM MONGODB
// ============================================================

async function loadFeedback() {

    try {

        console.log("🔄 Loading feedback from MongoDB...");

        const response = await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }

        const data = await response.json();

        if (!data.success) {

            throw new Error(
                data.message || "Failed to load feedback"
            );

        }

        allFeedback = data.feedbacks || [];

        console.log(
            `✅ ${allFeedback.length} feedback records loaded`
        );

        updateDashboard();

    }

    catch (error) {

        console.error(
            "❌ Failed to load feedback:",
            error
        );

    }

}


// ============================================================
// UPDATE ENTIRE DASHBOARD
// ============================================================

function updateDashboard() {

    console.log(
        "📊 Updating admin dashboard..."
    );


    const totalFeedback =
        allFeedback.length;


    // ========================================================
    // AVERAGE RATING
    // ========================================================

    let averageRating = 0;


    if (totalFeedback > 0) {

        const totalRating =
            allFeedback.reduce(
                (sum, feedback) => {

                    return sum +
                        Number(
                            feedback.rating || 0
                        );

                },
                0
            );


        averageRating =
            totalRating / totalFeedback;

    }


    // ========================================================
    // POSITIVE FEEDBACK
    // Rating 4 or 5
    // ========================================================

    let positiveCount = 0;


    allFeedback.forEach(
        feedback => {

            const rating =
                Number(
                    feedback.rating || 0
                );


            if (rating >= 4) {

                positiveCount++;

            }

        }
    );


    let positivePercentage = 0;


    if (totalFeedback > 0) {

        positivePercentage =
            Math.round(
                (
                    positiveCount /
                    totalFeedback
                ) * 100
            );

    }


    // ========================================================
    // TODAY'S FEEDBACK
    // ========================================================

    const today =
        new Date();


    const todayString =
        today
            .toISOString()
            .split("T")[0];


    const todayFeedback =
        allFeedback.filter(
            feedback => {

                if (!feedback.createdAt) {

                    return false;

                }


                const feedbackDate =
                    new Date(
                        feedback.createdAt
                    )
                    .toISOString()
                    .split("T")[0];


                return (
                    feedbackDate ===
                    todayString
                );

            }
        ).length;


    // ========================================================
    // CONSOLE STATISTICS
    // ========================================================

    console.log(
        "📈 Dashboard statistics:",
        {
            totalFeedback,
            averageRating:
                averageRating.toFixed(1),
            positivePercentage,
            todayFeedback
        }
    );


    // ========================================================
    // UPDATE TOP CARDS
    // ========================================================

    updateCardValues(
        totalFeedback,
        averageRating,
        positivePercentage,
        todayFeedback
    );


    // ========================================================
    // UPDATE RATING
    // ========================================================

    updateRatingOverview();


    // ========================================================
    // UPDATE CATEGORIES
    // ========================================================
    
    updateCategoryOverview();

    // ========================================================
// UPDATE STUDENT MOOD
// ========================================================

    updateMoodOverview();


    // ========================================================
    // UPDATE CATEGORY FILTER
    // ========================================================

    populateCategoryFilter();


    // ========================================================
    // UPDATE RECENT FEEDBACK
    // ========================================================

    updateRecentFeedback(
        allFeedback
    );

}


// ============================================================
// UPDATE TOP STATISTICS CARDS
// ============================================================

function updateCardValues(
    totalFeedback,
    averageRating,
    positivePercentage,
    todayFeedback
) {

    const cards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (
        !cards ||
        cards.length < 4
    ) {

        console.warn(
            "⚠️ Dashboard stat cards not found."
        );

        return;

    }


    // TOTAL FEEDBACK

    const totalValue =
        cards[0].querySelector(
            ".stat-value"
        );


    if (totalValue) {

        totalValue.textContent =
            totalFeedback;

    }


    // AVERAGE RATING

    const ratingValue =
        cards[1].querySelector(
            ".stat-value"
        );


    if (ratingValue) {

        ratingValue.textContent =
            averageRating.toFixed(1);

    }


    // POSITIVE

    const positiveValue =
        cards[2].querySelector(
            ".stat-value"
        );


    if (positiveValue) {

        positiveValue.textContent =
            `${positivePercentage}%`;

    }


    // TODAY

    const todayValue =
        cards[3].querySelector(
            ".stat-value"
        );


    if (todayValue) {

        todayValue.textContent =
            todayFeedback;

    }

}


// ============================================================
// RATING OVERVIEW
// ============================================================

function updateRatingOverview() {

    const ratingCounts = {

        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0

    };


    allFeedback.forEach(
        feedback => {

            const rating =
                Number(
                    feedback.rating || 0
                );


            if (
                rating >= 1 &&
                rating <= 5
            ) {

                ratingCounts[rating]++;

            }

        }
    );


    console.log(
        "⭐ Rating distribution:",
        ratingCounts
    );


    const headings =
        document.querySelectorAll(
            "h2, h3"
        );


    let ratingCard = null;


    headings.forEach(
        heading => {

            if (
                heading.textContent
                    .trim()
                    .toLowerCase()
                    .includes(
                        "rating overview"
                    )
            ) {

                ratingCard =
                    heading.closest(
                        ".analytics-card, .dashboard-card, .card, section"
                    );

            }

        }
    );


    if (!ratingCard) {

        console.warn(
            "⚠️ Rating Overview card not found."
        );

        return;

    }


    // Remove old loading message

    const loadingText =
        [
            ...ratingCard.querySelectorAll("*")
        ]
        .find(
            element =>
                element.textContent
                    .trim()
                    .toLowerCase()
                    .includes(
                        "loading rating data"
                    )
        );


    if (loadingText) {

        loadingText.remove();

    }


    // Create chart container

    let chart =
        ratingCard.querySelector(
            ".rating-dashboard-chart"
        );


    if (!chart) {

        chart =
            document.createElement(
                "div"
            );


        chart.className =
            "rating-dashboard-chart";


        chart.style.marginTop =
            "25px";


        ratingCard.appendChild(
            chart
        );

    }


    chart.innerHTML = "";


    const maxCount =
        Math.max(
            ...Object.values(
                ratingCounts
            ),
            1
        );


    // Display 5 → 1

    for (
        let rating = 5;
        rating >= 1;
        rating--
    ) {

        const count =
            ratingCounts[rating];


        const percentage =
            (
                count /
                maxCount
            ) * 100;


        const row =
            document.createElement(
                "div"
            );


        row.style.marginBottom =
            "14px";


        row.innerHTML = `

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:6px;
                font-size:14px;
            ">

                <span>
                    ${"⭐".repeat(rating)}
                </span>

                <strong>
                    ${count}
                </strong>

            </div>


            <div style="
                width:100%;
                height:8px;
                background:#eeeef5;
                border-radius:20px;
                overflow:hidden;
            ">

                <div style="
                    width:${percentage}%;
                    height:100%;
                    background:
                        linear-gradient(
                            90deg,
                            #7357ff,
                            #9b7cff
                        );
                    border-radius:20px;
                    transition:
                        width .5s ease;
                "></div>

            </div>

        `;


        chart.appendChild(
            row
        );

    }

}


// ============================================================
// CATEGORY OVERVIEW
// ============================================================

function updateCategoryOverview() {

    const categories = {};


    // Count feedback by category

    allFeedback.forEach(
        feedback => {

            const category =
                feedback.category ||
                "Other";


            categories[category] =
                (
                    categories[category] ||
                    0
                ) + 1;

        }
    );


    console.log(
        "📂 Feedback categories:",
        categories
    );


    // Find Feedback Categories card

    const headings =
        document.querySelectorAll(
            "h2, h3"
        );


    let categoryCard = null;


    headings.forEach(
        heading => {

            if (
                heading.textContent
                    .trim()
                    .toLowerCase()
                    .includes(
                        "feedback categories"
                    )
            ) {

                categoryCard =
                    heading.closest(
                        ".analytics-card, .dashboard-card, .card, section"
                    );

            }

        }
    );


    if (!categoryCard) {

        console.warn(
            "⚠️ Feedback Categories card not found."
        );

        return;

    }


    // Remove loading text

    const loadingText =
        [
            ...categoryCard.querySelectorAll("*")
        ]
        .find(
            element =>
                element.textContent
                    .trim()
                    .toLowerCase()
                    .includes(
                        "loading category data"
                    )
        );


    if (loadingText) {

        loadingText.remove();

    }


    // Create category container

    let container =
        categoryCard.querySelector(
            ".category-dashboard-list"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.className =
            "category-dashboard-list";


        container.style.marginTop =
            "25px";


        categoryCard.appendChild(
            container
        );

    }


    container.innerHTML = "";


    // Sort categories

    const sortedCategories =
        Object.entries(
            categories
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    // No categories

    if (
        sortedCategories.length === 0
    ) {

        container.innerHTML = `

            <div class="dashboard-empty">

                📂 No feedback categories yet.

            </div>

        `;

        return;

    }


    const total =
        allFeedback.length || 1;


    // Display categories

    sortedCategories.forEach(
        ([category, count]) => {

            const percentage =
                Math.round(
                    (
                        count /
                        total
                    ) * 100
                );


            const item =
                document.createElement(
                    "div"
                );


            item.style.marginBottom =
                "18px";


            item.innerHTML = `

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:7px;
                    font-size:14px;
                ">

                    <strong>
                        ${escapeHTML(category)}
                    </strong>

                    <span style="
                        color:#6c5ce7;
                        font-weight:700;
                    ">

                        ${count}

                    </span>

                </div>


                <div style="
                    width:100%;
                    height:9px;
                    background:#eeeef5;
                    border-radius:20px;
                    overflow:hidden;
                ">

                    <div style="
                        width:${percentage}%;
                        height:100%;
                        background:
                            linear-gradient(
                                90deg,
                                #7357ff,
                                #9b7cff
                            );
                        border-radius:20px;
                        transition:
                            width .5s ease;
                    "></div>

                </div>


                <div style="
                    margin-top:5px;
                    color:#999;
                    font-size:11px;
                ">

                    ${percentage}% of all feedback

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}

// ============================================================
// STUDENT MOOD OVERVIEW
// ============================================================

function updateMoodOverview() {

    const moodChart =
        document.querySelector("#moodChart");

    if (!moodChart) {

        console.warn(
            "⚠️ #moodChart not found."
        );

        return;
    }


    // ========================================================
    // COUNT MOODS
    // ========================================================

    const moodCounts = {};

    allFeedback.forEach(feedback => {

        const mood =
            String(
                feedback.mood || "Unknown"
            ).trim();

        if (!mood) {
            return;
        }

        moodCounts[mood] =
            (moodCounts[mood] || 0) + 1;

    });


    console.log(
        "😊 Student mood distribution:",
        moodCounts
    );


    // ========================================================
    // CLEAR LOADING MESSAGE
    // ========================================================

    moodChart.innerHTML = "";


    // ========================================================
    // NO MOOD DATA
    // ========================================================

    if (
        Object.keys(moodCounts).length === 0
    ) {

        moodChart.innerHTML = `

            <div class="dashboard-empty">

                😊 No mood data available yet.

            </div>

        `;

        return;
    }


    // ========================================================
    // MOOD EMOJIS
    // ========================================================

    const moodIcons = {

        "Very Happy": "😄",
        "Happy": "😊",
        "Neutral": "😐",
        "Sad": "😔",
        "Very Sad": "😢",

        "Excellent": "🤩",
        "Good": "😊",
        "Okay": "😐",
        "Bad": "😞",
        "Terrible": "😢"

    };


    // ========================================================
    // TOTAL FEEDBACK
    // ========================================================

    const totalMoodResponses =
        Object.values(moodCounts)
            .reduce(
                (sum, count) =>
                    sum + count,
                0
            );


    // ========================================================
    // SORT MOODS
    // ========================================================

    const sortedMoods =
        Object.entries(moodCounts)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    // ========================================================
    // CREATE MOOD CARDS
    // ========================================================

    sortedMoods.forEach(
        ([mood, count]) => {

            const percentage =
                Math.round(
                    (
                        count /
                        totalMoodResponses
                    ) * 100
                );


            const icon =
                moodIcons[mood] || "🙂";


            const moodCard =
                document.createElement(
                    "div"
                );


            moodCard.className =
                "mood-card";


            moodCard.innerHTML = `

                <div class="mood-icon">

                    ${icon}

                </div>


                <div class="mood-info">

                    <strong>

                        ${escapeHTML(mood)}

                    </strong>


                    <span>

                        ${count}
                        ${count === 1
                            ? "student"
                            : "students"}

                    </span>

                </div>


                <div class="mood-percentage">

                    ${percentage}%

                </div>

            `;


            moodChart.appendChild(
                moodCard
            );

        }
    );


    console.log(
        `😊 ${totalMoodResponses} mood responses displayed`
    );

}

// ============================================================
// RECENT FEEDBACK
// ============================================================

function updateRecentFeedback(
    feedbackData = allFeedback
) {

    const feedbackList =
        document.querySelector(
            "#recentFeedback"
        );


    const resultCount =
        document.querySelector(
            "#feedbackResultCount"
        );


    if (!feedbackList) {

        console.warn(
            "⚠️ #recentFeedback not found."
        );

        return;

    }


    // ========================================================
    // NO RESULTS
    // ========================================================

    if (
        !feedbackData ||
        feedbackData.length === 0
    ) {

        feedbackList.innerHTML = `

            <div class="dashboard-empty">

                🔍 No feedback matches your search.

            </div>

        `;


        if (resultCount) {

            resultCount.textContent =
                "0 feedback found";

        }


        return;

    }


    // ========================================================
    // SORT NEWEST FIRST
    // ========================================================

    const recentFeedback =
        [...feedbackData]
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            )
            .slice(0, 10);


    feedbackList.innerHTML =
        "";


    // ========================================================
    // RESULT COUNT
    // ========================================================

    if (resultCount) {

        resultCount.textContent =
            `${feedbackData.length} feedback found`;

    }


    // ========================================================
    // CREATE FEEDBACK CARDS
    // ========================================================

    recentFeedback.forEach(
        feedback => {

            const name =
                feedback.name ||
                "Anonymous";


            const message =
                feedback.message ||
                "No message";


            const category =
                feedback.category ||
                "Other";


            const rating =
                Number(
                    feedback.rating || 0
                );


            // ==================================================
            // INITIALS
            // ==================================================

            const initials =
                name
                    .trim()
                    .split(/\s+/)
                    .map(
                        word =>
                            word.charAt(0)
                    )
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();


            // ==================================================
            // STARS
            // ==================================================

            const safeRating =
                Math.max(
                    0,
                    Math.min(
                        5,
                        rating
                    )
                );


            const stars =
                "★".repeat(
                    safeRating
                ) +
                "☆".repeat(
                    5 - safeRating
                );


            // ==================================================
            // DATE
            // ==================================================

            let formattedDate =
                "Unknown date";


            if (
                feedback.createdAt
            ) {

                const date =
                    new Date(
                        feedback.createdAt
                    );


                if (
                    !isNaN(
                        date.getTime()
                    )
                ) {

                    formattedDate =
                        date.toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );

                }

            }


            // ==================================================
            // CREATE ELEMENT
            // ==================================================

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "feedback-item";


            item.innerHTML = `

                <div class="feedback-avatar">

                    ${escapeHTML(initials)}

                </div>


                <div class="feedback-main">

                    <strong>

                        ${escapeHTML(name)}

                    </strong>


                    <div class="feedback-message">

                        ${escapeHTML(message)}

                    </div>


                    <div class="feedback-meta">

                        <span class="feedback-category">

                            ${escapeHTML(category)}

                        </span>


                        <span class="feedback-date">

                            ${formattedDate}

                        </span>

                    </div>


                    <button
                        type="button"
                        class="view-details-btn"
                        style="
                            margin-top:10px;
                            padding:7px 12px;
                            border:none;
                            border-radius:8px;
                            background:#f0edff;
                            color:#6c5ce7;
                            font-size:11px;
                            font-weight:700;
                            cursor:pointer;
                            transition:all .2s ease;
                        "
                    >

                        👁 View Details

                    </button>

                </div>


                <div class="feedback-rating">

                    ${stars}

                </div>

            `;


            // ==================================================
            // VIEW DETAILS BUTTON
            // ==================================================

            const viewButton =
                item.querySelector(
                    ".view-details-btn"
                );


            if (viewButton) {

                viewButton.addEventListener(
                    "click",
                    () => {

                        openFeedbackModal(
                            feedback
                        );

                    }
                );

            }


            feedbackList.appendChild(
                item
            );

        }
    );


    console.log(
        `📝 ${recentFeedback.length} feedback displayed`
    );

}


// ============================================================
// SEARCH + FILTER
// ============================================================

function applyFeedbackFilters() {

    const searchInput =
        document.querySelector(
            "#feedbackSearch"
        );


    const categoryFilter =
        document.querySelector(
            "#categoryFilter"
        );


    const ratingFilter =
        document.querySelector(
            "#ratingFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "all";


    const selectedRating =
        ratingFilter
            ? ratingFilter.value
            : "all";


    const filtered =
        allFeedback.filter(
            feedback => {

                const name =
                    String(
                        feedback.name ||
                        ""
                    ).toLowerCase();


                const email =
                    String(
                        feedback.email ||
                        ""
                    ).toLowerCase();


                const message =
                    String(
                        feedback.message ||
                        ""
                    ).toLowerCase();


                const category =
                    String(
                        feedback.category ||
                        ""
                    );


                const rating =
                    String(
                        feedback.rating ||
                        ""
                    );


                // SEARCH

                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    email.includes(search) ||
                    message.includes(search) ||
                    category
                        .toLowerCase()
                        .includes(search);


                // CATEGORY

                const matchesCategory =
                    selectedCategory === "all" ||
                    category === selectedCategory;


                // RATING

                const matchesRating =
                    selectedRating === "all" ||
                    rating === selectedRating;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesRating
                );

            }
        );


    console.log(
        `🔎 Filtered ${filtered.length} of ${allFeedback.length} feedback`
    );


    updateRecentFeedback(
        filtered
    );

}


// ============================================================
// POPULATE CATEGORY FILTER
// ============================================================

function populateCategoryFilter() {

    const categoryFilter =
        document.querySelector(
            "#categoryFilter"
        );


    if (!categoryFilter) {

        console.warn(
            "⚠️ #categoryFilter not found."
        );

        return;

    }


    const currentValue =
        categoryFilter.value;


    const categories =
        [
            ...new Set(
                allFeedback
                    .map(
                        feedback =>
                            feedback.category
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    categoryFilter.innerHTML = `

        <option value="all">
            All Categories
        </option>

    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            categoryFilter.appendChild(
                option
            );

        }
    );


    // Restore previous selection

    if (
        currentValue &&
        (
            currentValue === "all" ||
            categories.includes(
                currentValue
            )
        )
    ) {

        categoryFilter.value =
            currentValue;

    }


    console.log(
        "🎯 Category filter updated:",
        categories
    );

}


// ============================================================
// SETUP SEARCH + FILTER EVENTS
// ============================================================

function setupFeedbackFilters() {

    const searchInput =
        document.querySelector(
            "#feedbackSearch"
        );


    const categoryFilter =
        document.querySelector(
            "#categoryFilter"
        );


    const ratingFilter =
        document.querySelector(
            "#ratingFilter"
        );


    const clearButton =
        document.querySelector(
            "#clearFilters"
        );


    // SEARCH

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFeedbackFilters
        );

    }


    // CATEGORY

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            applyFeedbackFilters
        );

    }


    // RATING

    if (ratingFilter) {

        ratingFilter.addEventListener(
            "change",
            applyFeedbackFilters
        );

    }


    // CLEAR

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                if (searchInput) {

                    searchInput.value =
                        "";

                }


                if (categoryFilter) {

                    categoryFilter.value =
                        "all";

                }


                if (ratingFilter) {

                    ratingFilter.value =
                        "all";

                }


                updateRecentFeedback(
                    allFeedback
                );


                console.log(
                    "🧹 Filters cleared"
                );

            }
        );

    }


    console.log(
        "🎛️ Feedback filters initialized."
    );

}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}


// ============================================================
// CREATE FEEDBACK MODAL
// ============================================================

function ensureFeedbackModal() {

    let modal =
        document.querySelector(
            "#feedbackModal"
        );


    // If modal already exists in HTML,
    // use it.

    if (modal) {

        return modal;

    }


    // ========================================================
    // CREATE MODAL
    // ========================================================

    modal =
        document.createElement(
            "div"
        );


    modal.id =
        "feedbackModal";


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    modal.innerHTML = `

        <div class="cp-modal-box">

            <div class="cp-modal-header">

                <div class="cp-modal-user">

                    <div
                        id="modalAvatar"
                        class="cp-modal-avatar"
                    >
                        A
                    </div>

                    <div>

                        <h2 id="modalName">
                            Anonymous
                        </h2>

                        <p id="modalEmail">
                            No email provided
                        </p>

                    </div>

                </div>


                <button
                    id="modalClose"
                    type="button"
                    class="cp-modal-close"
                >
                    ×
                </button>

            </div>


            <div class="cp-modal-rating">

                <span>
                    Rating
                </span>

                <strong id="modalRating">
                    ☆☆☆☆☆
                </strong>

            </div>


            <div class="cp-modal-grid">

                <div class="cp-info-box">

                    <span>
                        Department
                    </span>

                    <strong id="modalDepartment">
                        Not provided
                    </strong>

                </div>


                <div class="cp-info-box">

                    <span>
                        Year
                    </span>

                    <strong id="modalYear">
                        Not provided
                    </strong>

                </div>


                <div class="cp-info-box">

                    <span>
                        Category
                    </span>

                    <strong id="modalCategory">
                        Other
                    </strong>

                </div>


                <div class="cp-info-box">

                    <span>
                        Mood
                    </span>

                    <strong id="modalMood">
                        Not provided
                    </strong>

                </div>

            </div>


            <div class="cp-modal-date">

                Submitted:
                <span id="modalDate">
                    Unknown date
                </span>

            </div>


            <div class="cp-modal-message">

                <h3>
                    Student Feedback
                </h3>

                <p id="modalMessage">
                    No feedback message available.
                </p>

            </div>


            <div class="cp-modal-footer">

                <button
                    id="modalDone"
                    type="button"
                    class="cp-modal-done"
                >
                    Done
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ========================================================
    // MODAL STYLES
    // ========================================================

    if (
        !document.querySelector(
            "#campusPulseModalStyles"
        )
    ) {

        const style =
            document.createElement(
                "style"
            );


        style.id =
            "campusPulseModalStyles";


        style.textContent = `

            #feedbackModal {
                position:fixed;
                inset:0;
                z-index:99999;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:20px;
                background:rgba(15,23,42,.55);
                backdrop-filter:blur(7px);
                opacity:0;
                visibility:hidden;
                transition:all .25s ease;
            }


            #feedbackModal.active {
                opacity:1;
                visibility:visible;
            }


            .cp-modal-box {
                width:min(620px, 100%);
                max-height:90vh;
                overflow-y:auto;
                background:#ffffff;
                border-radius:24px;
                padding:28px;
                box-shadow:0 25px 80px rgba(0,0,0,.2);
                transform:translateY(15px) scale(.97);
                transition:all .25s ease;
            }


            #feedbackModal.active
            .cp-modal-box {
                transform:translateY(0) scale(1);
            }


            .cp-modal-header {
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                gap:20px;
                margin-bottom:22px;
            }


            .cp-modal-user {
                display:flex;
                align-items:center;
                gap:14px;
            }


            .cp-modal-avatar {
                width:52px;
                height:52px;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                background:linear-gradient(
                    135deg,
                    #6c5ce7,
                    #8b5cf6
                );
                color:white;
                font-weight:800;
                font-size:17px;
            }


            .cp-modal-user h2 {
                margin:0;
                font-size:20px;
                color:#171717;
            }


            .cp-modal-user p {
                margin:4px 0 0;
                font-size:12px;
                color:#888;
            }


            .cp-modal-close {
                width:36px;
                height:36px;
                border:0;
                border-radius:10px;
                background:#f4f4f8;
                color:#555;
                font-size:24px;
                line-height:1;
                cursor:pointer;
            }


            .cp-modal-close:hover {
                background:#ece9ff;
                color:#6c5ce7;
            }


            .cp-modal-rating {
                display:flex;
                align-items:center;
                justify-content:space-between;
                padding:15px 17px;
                background:#faf9ff;
                border:1px solid #eeeaff;
                border-radius:14px;
                margin-bottom:18px;
            }


            .cp-modal-rating span {
                font-size:13px;
                color:#777;
                font-weight:600;
            }


            .cp-modal-rating strong {
                color:#f59e0b;
                letter-spacing:2px;
                font-size:18px;
            }


            .cp-modal-grid {
                display:grid;
                grid-template-columns:repeat(2, 1fr);
                gap:12px;
            }


            .cp-info-box {
                padding:14px;
                border:1px solid #eeeeee;
                border-radius:13px;
                background:#fafafa;
            }


            .cp-info-box span {
                display:block;
                font-size:10px;
                color:#999;
                margin-bottom:5px;
                text-transform:uppercase;
                letter-spacing:.5px;
            }


            .cp-info-box strong {
                display:block;
                font-size:13px;
                color:#333;
            }


            .cp-modal-date {
                margin-top:16px;
                font-size:11px;
                color:#999;
            }


            .cp-modal-message {
                margin-top:20px;
                padding:18px;
                border-radius:15px;
                background:#f8f7ff;
            }


            .cp-modal-message h3 {
                margin:0 0 8px;
                font-size:14px;
                color:#333;
            }


            .cp-modal-message p {
                margin:0;
                color:#666;
                font-size:13px;
                line-height:1.7;
                white-space:pre-wrap;
                word-break:break-word;
            }


            .cp-modal-footer {
                display:flex;
                justify-content:flex-end;
                margin-top:22px;
            }


            .cp-modal-done {
                border:0;
                padding:10px 22px;
                border-radius:11px;
                background:#6c5ce7;
                color:white;
                font-weight:700;
                cursor:pointer;
            }


            .cp-modal-done:hover {
                background:#5948d8;
            }


            @media (max-width:600px) {

                .cp-modal-box {
                    padding:20px;
                    border-radius:20px;
                }

                .cp-modal-grid {
                    grid-template-columns:1fr;
                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    return modal;

}


// ============================================================
// OPEN FEEDBACK MODAL
// ============================================================

function openFeedbackModal(feedback) {

    const modal =
        ensureFeedbackModal();


    if (!modal) {

        console.error(
            "❌ Could not create feedback modal."
        );

        return;

    }


    // ========================================================
    // BASIC DATA
    // ========================================================

    const name =
        feedback.name ||
        "Anonymous";


    const email =
        feedback.email ||
        "No email provided";


    const department =
        feedback.department ||
        "Not provided";


    const year =
        feedback.year ||
        "Not provided";


    const category =
        feedback.category ||
        "Other";


    const mood =
        feedback.mood ||
        "Not provided";


    const message =
        feedback.message ||
        "No feedback message available.";


    const rating =
        Math.max(
            0,
            Math.min(
                5,
                Number(
                    feedback.rating || 0
                )
            )
        );


    // ========================================================
    // INITIALS
    // ========================================================

    const initials =
        name
            .trim()
            .split(/\s+/)
            .map(
                word =>
                    word.charAt(0)
            )
            .join("")
            .substring(0, 2)
            .toUpperCase();


    // ========================================================
    // STARS
    // ========================================================

    const stars =
        "★".repeat(rating) +
        "☆".repeat(5 - rating);


    // ========================================================
    // DATE
    // ========================================================

    let formattedDate =
        "Unknown date";


    if (feedback.createdAt) {

        const date =
            new Date(
                feedback.createdAt
            );


        if (
            !isNaN(
                date.getTime()
            )
        ) {

            formattedDate =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day:"2-digit",
                        month:"long",
                        year:"numeric"
                    }
                );

        }

    }


    // ========================================================
    // PUT DATA INTO MODAL
    // ========================================================

    const modalAvatar =
        modal.querySelector(
            "#modalAvatar"
        );


    const modalName =
        modal.querySelector(
            "#modalName"
        );


    const modalEmail =
        modal.querySelector(
            "#modalEmail"
        );


    const modalDepartment =
        modal.querySelector(
            "#modalDepartment"
        );


    const modalYear =
        modal.querySelector(
            "#modalYear"
        );


    const modalCategory =
        modal.querySelector(
            "#modalCategory"
        );


    const modalMood =
        modal.querySelector(
            "#modalMood"
        );


    const modalDate =
        modal.querySelector(
            "#modalDate"
        );


    const modalRating =
        modal.querySelector(
            "#modalRating"
        );


    const modalMessage =
        modal.querySelector(
            "#modalMessage"
        );


    if (modalAvatar) {

        modalAvatar.textContent =
            initials;

    }


    if (modalName) {

        modalName.textContent =
            name;

    }


    if (modalEmail) {

        modalEmail.textContent =
            email;

    }


    if (modalDepartment) {

        modalDepartment.textContent =
            department;

    }


    if (modalYear) {

        modalYear.textContent =
            year;

    }


    if (modalCategory) {

        modalCategory.textContent =
            category;

    }


    if (modalMood) {

        modalMood.textContent =
            mood;

    }


    if (modalDate) {

        modalDate.textContent =
            formattedDate;

    }


    if (modalRating) {

        modalRating.textContent =
            stars;

    }


    if (modalMessage) {

        modalMessage.textContent =
            message;

    }


    // ========================================================
    // OPEN
    // ========================================================

    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    console.log(
        "👁️ Viewing feedback:",
        feedback
    );

}


// ============================================================
// CLOSE FEEDBACK MODAL
// ============================================================

function closeFeedbackModal() {

    const modal =
        document.querySelector(
            "#feedbackModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";


    console.log(
        "✕ Feedback modal closed."
    );

}


// ============================================================
// MODAL EVENTS
// ============================================================

function setupFeedbackModal() {

    const modal =
        ensureFeedbackModal();


    if (!modal) {

        return;

    }


    const closeButton =
        modal.querySelector(
            "#modalClose"
        );


    const doneButton =
        modal.querySelector(
            "#modalDone"
        );


    // Close X

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeFeedbackModal
        );

    }


    // Done button

    if (doneButton) {

        doneButton.addEventListener(
            "click",
            closeFeedbackModal
        );

    }


    // Click outside modal

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeFeedbackModal();

            }

        }
    );


    // Escape key

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeFeedbackModal();

            }

        }
    );


    console.log(
        "🪟 Feedback modal initialized."
    );

}


// ============================================================
// REFRESH BUTTON
// ============================================================

function setupRefreshButton() {

    const refreshButton =
        document.querySelector(
            "#refreshButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadFeedback
        );


        console.log(
            "🔄 Refresh button initialized."
        );

    }

}


// ============================================================
// START APPLICATION
// ============================================================

function initializeCampusPulseAdmin() {

    console.log(
        "🚀 CampusPulse Admin Dashboard loaded."
    );


    // Search + filter

    setupFeedbackFilters();


    // Feedback details modal

    setupFeedbackModal();


    // Refresh button

    setupRefreshButton();


    // Load MongoDB data

    loadFeedback();


    // Auto refresh every 30 seconds

    setInterval(
        () => {

            loadFeedback();

        },
        30000
    );

}


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.CampusPulseAdmin = {

    getFeedback:
        () => allFeedback,

    refresh:
        loadFeedback,

    filter:
        applyFeedbackFilters,

    openFeedback:
        openFeedbackModal,

    closeFeedback:
        closeFeedbackModal

};


// ============================================================
// RUN
// ============================================================

initializeCampusPulseAdmin();
