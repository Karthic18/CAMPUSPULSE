// ============================================
// CAMPUSPULSE - FEEDBACK JAVASCRIPT
// Frontend → Express API → MongoDB
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    // ============================================
    // ELEMENTS
    // ============================================

    const feedbackForm =
        document.getElementById("feedbackForm");

    const stars =
        document.querySelectorAll(".star");

    const ratingInput =
        document.getElementById("rating");

    const ratingLabel =
        document.getElementById("ratingLabel");

    const moodOptions =
        document.querySelectorAll(".mood-option");

    const moodInput =
        document.getElementById("mood");

    const feedbackText =
        document.getElementById("feedback");

    const characterCount =
        document.getElementById("characterCount");

    const submitButton =
        document.getElementById("submitFeedback");

    const formError =
        document.getElementById("formError");

    const successOverlay =
        document.getElementById("successOverlay");

    const closeSuccess =
        document.getElementById("closeSuccess");


    // ============================================
    // API URL
    // ============================================

    const API_URL =
        "http://localhost:5000/api/feedback";


    // ============================================
    // RATING MESSAGES
    // ============================================

    const ratingMessages = {
        1: "Poor experience",
        2: "Needs improvement",
        3: "Average experience",
        4: "Good experience",
        5: "Excellent experience"
    };


    // ============================================
    // STAR RATING
    // ============================================

    stars.forEach((star) => {

        star.addEventListener("click", () => {

            const rating =
                Number(star.dataset.rating);

            ratingInput.value = rating;

            updateStars(rating);

            if (ratingLabel) {
                ratingLabel.textContent =
                    ratingMessages[rating];
            }

        });

    });


    function updateStars(rating) {

        stars.forEach((star) => {

            const starValue =
                Number(star.dataset.rating);

            if (starValue <= rating) {
                star.classList.add("selected");
            } else {
                star.classList.remove("selected");
            }

        });

    }


    // ============================================
    // MOOD SELECTION
    // ============================================

    moodOptions.forEach((option) => {

        option.addEventListener("click", () => {

            const mood =
                option.dataset.mood;

            moodInput.value = mood;

            moodOptions.forEach((item) => {
                item.classList.remove("selected");
            });

            option.classList.add("selected");

        });

    });


    // ============================================
    // CHARACTER COUNTER
    // ============================================

    if (feedbackText && characterCount) {

        feedbackText.addEventListener("input", () => {

            const currentLength =
                feedbackText.value.length;

            characterCount.textContent =
                `${currentLength} / 500`;

        });

    }


    // ============================================
    // SHOW ERROR
    // ============================================

    function showError(message) {

        if (formError) {

            formError.textContent =
                message;

            formError.style.display =
                "block";

        }

    }


    // ============================================
    // CLEAR ERROR
    // ============================================

    function clearError() {

        if (formError) {

            formError.textContent = "";

            formError.style.display =
                "none";

        }

    }


    // ============================================
    // FORM SUBMISSION
    // ============================================

    feedbackForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearError();


            // ====================================
            // GET VALUES
            // ====================================

            const name =
                document.getElementById(
                    "studentName"
                ).value.trim();

            const email =
                document.getElementById(
                    "email"
                ).value.trim();

            const department =
                document.getElementById(
                    "department"
                ).value;

            const year =
                document.getElementById(
                    "year"
                ).value;

            const category =
                document.getElementById(
                    "category"
                ).value;

            const rating =
                Number(ratingInput.value);

            const mood =
                moodInput.value;

            const message =
                feedbackText.value.trim();


            // ====================================
            // FRONTEND VALIDATION
            // ====================================

            if (!name) {

                showError(
                    "Please enter your name."
                );

                return;
            }


            if (!email) {

                showError(
                    "Please enter your email address."
                );

                return;
            }


            if (!department) {

                showError(
                    "Please select your department."
                );

                return;
            }


            if (!year) {

                showError(
                    "Please select your year."
                );

                return;
            }


            if (!category) {

                showError(
                    "Please select a feedback category."
                );

                return;
            }


            if (!rating || rating < 1 || rating > 5) {

                showError(
                    "Please select a rating from 1 to 5 stars."
                );

                return;
            }


            if (!mood) {

                showError(
                    "Please select how you are feeling."
                );

                return;
            }


            if (!message) {

                showError(
                    "Please write your feedback."
                );

                return;
            }


            // ====================================
            // LOADING STATE
            // ====================================

            const originalButtonHTML =
                submitButton.innerHTML;

            submitButton.disabled = true;

            submitButton.innerHTML =
                "<span>Submitting...</span>";


            try {

                // =================================
                // SEND DATA TO BACKEND
                // =================================

                const response =
                    await fetch(API_URL, {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            email: email,

                            department: department,

                            year: year,

                            category: category,

                            rating: rating,

                            mood: mood,

                            message: message

                        })

                    });


                // =================================
                // READ RESPONSE
                // =================================

                const data =
                    await response.json();


                // =================================
                // HANDLE ERROR
                // =================================

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to submit feedback."
                    );

                }


                // =================================
                // SUCCESS
                // =================================

                console.log(
                    "Feedback submitted successfully:",
                    data
                );


                feedbackForm.reset();

                ratingInput.value = "";

                moodInput.value = "";

                updateStars(0);

                if (ratingLabel) {

                    ratingLabel.textContent =
                        "Select a rating";

                }


                moodOptions.forEach((item) => {

                    item.classList.remove(
                        "selected"
                    );

                });


                if (characterCount) {

                    characterCount.textContent =
                        "0 / 500";

                }


                // Show success popup

                if (successOverlay) {

                    successOverlay.classList.add(
                        "active"
                    );

                }


            } catch (error) {

                console.error(
                    "Feedback submission error:",
                    error
                );


                showError(
                    "Unable to submit feedback. " +
                    "Please make sure the CampusPulse server is running."
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.innerHTML =
                    originalButtonHTML;

            }

        }
    );


    // ============================================
    // CLOSE SUCCESS POPUP
    // ============================================

    if (closeSuccess) {

        closeSuccess.addEventListener(
            "click",
            () => {

                if (successOverlay) {

                    successOverlay.classList.remove(
                        "active"
                    );

                }

            }
        );

    }


    // ============================================
    // CLOSE POPUP WHEN CLICKING OUTSIDE
    // ============================================

    if (successOverlay) {

        successOverlay.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    successOverlay
                ) {

                    successOverlay.classList.remove(
                        "active"
                    );

                }

            }
        );

    }


    // ============================================
    // INITIAL STATE
    // ============================================

    updateStars(0);

    console.log(
        "🚀 CampusPulse feedback system loaded."
    );

});