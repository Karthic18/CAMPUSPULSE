const express = require("express");
const router = express.Router();

const Feedback = require("../models/Feedback");

// ============================================
// POST - SUBMIT FEEDBACK
// ============================================

router.post("/", async (req, res) => {

    try {

        const {
            name,
            email,
            department,
            year,
            category,
            rating,
            mood,
            message
        } = req.body;


        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (
            !name ||
            !email ||
            !department ||
            !year ||
            !category ||
            !rating ||
            !mood ||
            !message
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide all required fields."

            });

        }


        // ----------------------------------------
        // CREATE FEEDBACK
        // ----------------------------------------

        const feedback = new Feedback({

            name,
            email,
            department,
            year,
            category,
            rating,
            mood,
            message

        });


        // ----------------------------------------
        // SAVE TO MONGODB
        // ----------------------------------------

        await feedback.save();


        // ----------------------------------------
        // SUCCESS RESPONSE
        // ----------------------------------------

        res.status(201).json({

            success: true,

            message:
                "Feedback submitted successfully!",

            feedback

        });

    }

    catch (error) {

        console.error(
            "Feedback submission error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to submit feedback."

        });

    }

});


// ============================================
// GET - ALL FEEDBACK
// ============================================

router.get("/", async (req, res) => {

    try {

        const feedbacks =
            await Feedback
                .find()
                .sort({
                    createdAt: -1
                });


        res.json({

            success: true,

            count: feedbacks.length,

            feedbacks

        });

    }

    catch (error) {

        console.error(
            "Fetching feedback error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch feedback."

        });

    }

});


// ============================================
// GET - DASHBOARD STATISTICS
// ============================================

router.get("/stats", async (req, res) => {

    try {

        // ----------------------------------------
        // GET ALL FEEDBACK
        // ----------------------------------------

        const feedbacks = await Feedback.find();


        // ----------------------------------------
        // TOTAL FEEDBACK
        // ----------------------------------------

        const totalFeedback = feedbacks.length;


        // ----------------------------------------
        // AVERAGE RATING
        // ----------------------------------------

        let averageRating = 0;

        if (totalFeedback > 0) {

            const totalRating =
                feedbacks.reduce(
                    (sum, feedback) =>
                        sum + Number(feedback.rating),
                    0
                );

            averageRating =
                totalRating / totalFeedback;

        }


        // ----------------------------------------
        // POSITIVE FEEDBACK
        // ----------------------------------------

        const positiveFeedback =
            feedbacks.filter(
                feedback =>
                    Number(feedback.rating) >= 4
            ).length;


        let positivePercentage = 0;

        if (totalFeedback > 0) {

            positivePercentage =
                (positiveFeedback / totalFeedback) * 100;

        }


        // ----------------------------------------
        // TODAY'S FEEDBACK
        // ----------------------------------------

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );


        const todayFeedback =
            feedbacks.filter(feedback => {

                const createdDate =
                    new Date(feedback.createdAt);

                return (
                    createdDate >= today &&
                    createdDate < tomorrow
                );

            }).length;


        // ----------------------------------------
        // CATEGORY BREAKDOWN
        // ----------------------------------------

        const categoryStats = {};

        feedbacks.forEach(feedback => {

            const category =
                feedback.category || "Other";

            if (!categoryStats[category]) {

                categoryStats[category] = 0;

            }

            categoryStats[category]++;

        });


        // ----------------------------------------
        // RATING BREAKDOWN
        // ----------------------------------------

        const ratingStats = {

            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0

        };


        feedbacks.forEach(feedback => {

            const rating =
                Number(feedback.rating);

            if (ratingStats[rating] !== undefined) {

                ratingStats[rating]++;

            }

        });


        // ----------------------------------------
        // MOOD BREAKDOWN
        // ----------------------------------------

        const moodStats = {};

        feedbacks.forEach(feedback => {

            const mood =
                feedback.mood || "Unknown";

            if (!moodStats[mood]) {

                moodStats[mood] = 0;

            }

            moodStats[mood]++;

        });


        // ----------------------------------------
        // RECENT FEEDBACK
        // ----------------------------------------

        const recentFeedback =
            await Feedback
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(5);


        // ----------------------------------------
        // RESPONSE
        // ----------------------------------------

        res.json({

            success: true,

            statistics: {

                totalFeedback,

                averageRating:
                    Number(
                        averageRating.toFixed(1)
                    ),

                positiveFeedback,

                positivePercentage:
                    Number(
                        positivePercentage.toFixed(1)
                    ),

                todayFeedback,

                categoryStats,

                ratingStats,

                moodStats,

                recentFeedback

            }

        });

    }

    catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to generate dashboard statistics."

        });

    }

});


module.exports = router;