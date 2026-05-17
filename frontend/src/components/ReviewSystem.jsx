// frontend/src/components/ReviewSystem.jsx - OFFLINE REVIEW SYSTEM
import { User, GraduationCap, Laptop, ThumbsUp, Star } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";


const ReviewSystem = ({ exerciseId, exerciseName }) => {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem(`reviews_${exerciseId}`);
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews);
        setReviews(parsedReviews);

        // Find user's review
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const userReviewData = parsedReviews.find(
          (r) => r.userId === currentUser.id,
        );
        if (userReviewData) {
          setUserReview(userReviewData);
        }
      } catch (error) {
        // Silent error handling
      }
    } else {
      // Generate some mock reviews for demonstration
      const mockReviews = generateMockReviews(exerciseId);
      setReviews(mockReviews);
      localStorage.setItem(
        `reviews_${exerciseId}`,
        JSON.stringify(mockReviews),
      );
    }
  }, [exerciseId]);
  const generateMockReviews = (id) => {
    const mockUsers = [
      {
        id: "user1",
        name: "Alex Johnson",
        avatar: /*#__PURE__*/ React.createElement(User, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: "user2",
        name: "Sarah Wilson",
        avatar: /*#__PURE__*/ React.createElement(User, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: "user3",
        name: "Mike Chen",
        avatar: /*#__PURE__*/ React.createElement(GraduationCap, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: "user4",
        name: "Emma Davis",
        avatar: /*#__PURE__*/ React.createElement(Laptop, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
    ];
    const mockComments = [
      "Great exercise! Really helped build my strength.",
      "Perfect form demonstration. Easy to follow.",
      "Challenging but effective. Saw results quickly.",
      "Love this exercise! Added it to my routine.",
      "Clear instructions and good progression tips.",
      "Excellent for targeting specific muscle groups.",
    ];
    return mockUsers
      .slice(0, Math.floor(Math.random() * 3) + 2)
      .map((user, index) => ({
        id: `review_${id}_${index}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating: Math.floor(Math.random() * 2) + 4,
        // 4-5 stars
        comment: mockComments[Math.floor(Math.random() * mockComments.length)],
        date: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        helpful: Math.floor(Math.random() * 10) + 1,
      }));
  };
  const handleSubmitReview = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const newReview = {
        id: `review_${exerciseId}_${Date.now()}`,
        userId: currentUser.id || "current_user",
        userName: currentUser.name || "You",
        userAvatar: /*#__PURE__*/ React.createElement(User, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        rating,
        comment: comment.trim(),
        date: new Date().toISOString(),
        helpful: 0,
      };
      let updatedReviews;
      if (userReview) {
        // Update existing review
        updatedReviews = reviews.map((r) =>
          r.userId === newReview.userId
            ? {
                ...newReview,
                id: r.id,
              }
            : r,
        );
      } else {
        // Add new review
        updatedReviews = [newReview, ...reviews];
      }
      setReviews(updatedReviews);
      setUserReview(newReview);
      localStorage.setItem(
        `reviews_${exerciseId}`,
        JSON.stringify(updatedReviews),
      );

      // Reset form
      setShowReviewForm(false);
      setRating(0);
      setComment("");
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };
  const handleHelpful = (reviewId) => {
    const updatedReviews = reviews.map((review) =>
      review.id === reviewId
        ? {
            ...review,
            helpful: review.helpful + 1,
          }
        : review,
    );
    setReviews(updatedReviews);
    localStorage.setItem(
      `reviews_${exerciseId}`,
      JSON.stringify(updatedReviews),
    );
  };
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;
  const StarRating = ({
    rating: currentRating,
    onRatingChange,
    readonly = false,
  }) => {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex items-center space-x-1",
      },
      [1, 2, 3, 4, 5].map((star) =>
        /*#__PURE__*/ React.createElement(
          "button",
          {
            key: star,
            type: "button",
            onClick: () => !readonly && onRatingChange && onRatingChange(star),
            className: `${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`,
            disabled: readonly,
          },
          star <= currentRating
            ? /*#__PURE__*/ React.createElement(StarIcon, {
                className: "h-5 w-5 text-yellow-400",
              })
            : /*#__PURE__*/ React.createElement(StarOutlineIcon, {
                className: "h-5 w-5 text-gray-400",
              }),
        ),
      ),
    );
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex items-center justify-between mb-6",
      },
      /*#__PURE__*/ React.createElement(
        "h3",
        {
          className: "text-xl font-bold text-gray-900 dark:text-white",
        },
        "Reviews & Ratings",
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex items-center space-x-2",
        },
        /*#__PURE__*/ React.createElement(StarRating, {
          rating: Math.round(averageRating),
          readonly: true,
        }),
        /*#__PURE__*/ React.createElement(
          "span",
          {
            className: "text-sm text-gray-600 dark:text-gray-400",
          },
          averageRating,
          " (",
          reviews.length,
          " ",
          reviews.length === 1 ? "review" : "reviews",
          ")",
        ),
      ),
    ),
    !userReview &&
      !showReviewForm &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800",
        },
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-sm text-blue-800 dark:text-blue-200 mb-3",
          },
          "Share your experience with ",
          exerciseName,
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: () => setShowReviewForm(true),
            className:
              "px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm",
          },
          "Write a Review",
        ),
      ),
    showReviewForm &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg",
        },
        /*#__PURE__*/ React.createElement(
          "h4",
          {
            className: "font-semibold text-gray-900 dark:text-white mb-4",
          },
          userReview ? "Update Your Review" : "Write a Review",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mb-4",
          },
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
            },
            "Rating",
          ),
          /*#__PURE__*/ React.createElement(StarRating, {
            rating: rating,
            onRatingChange: setRating,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mb-4",
          },
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
            },
            "Comment (optional)",
          ),
          /*#__PURE__*/ React.createElement("textarea", {
            value: comment,
            onChange: (e) => setComment(e.target.value),
            placeholder: "Share your thoughts about this exercise...",
            className:
              "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-800 dark:text-white",
            rows: 3,
            maxLength: 500,
          }),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-xs text-gray-500 mt-1",
            },
            comment.length,
            "/500 characters",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-center space-x-3",
          },
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: handleSubmitReview,
              disabled: rating === 0 || loading,
              className:
                "px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            },
            loading
              ? "Submitting..."
              : userReview
                ? "Update Review"
                : "Submit Review",
          ),
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => {
                setShowReviewForm(false);
                setRating(userReview?.rating || 0);
                setComment(userReview?.comment || "");
              },
              className:
                "px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors",
            },
            "Cancel",
          ),
        ),
      ),
    userReview &&
      !showReviewForm &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-start justify-between",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            null,
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center space-x-2 mb-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-lg",
                },
                userReview.userAvatar,
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "font-medium text-gray-900 dark:text-white",
                },
                "Your Review",
              ),
              /*#__PURE__*/ React.createElement(StarRating, {
                rating: userReview.rating,
                readonly: true,
              }),
            ),
            userReview.comment &&
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className: "text-gray-700 dark:text-gray-300 text-sm mb-2",
                },
                userReview.comment,
              ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className: "text-xs text-gray-500",
              },
              new Date(userReview.date).toLocaleDateString(),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => {
                setShowReviewForm(true);
                setRating(userReview.rating);
                setComment(userReview.comment);
              },
              className: "text-red-700 hover:text-blue-800 text-sm",
            },
            "Edit",
          ),
        ),
      ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "space-y-4",
      },
      reviews
        .filter(
          (review) =>
            review.userId !==
            (JSON.parse(localStorage.getItem("user") || "{}").id ||
              "current_user"),
        )
        .map((review) =>
          /*#__PURE__*/ React.createElement(
            "div",
            {
              key: review.id,
              className:
                "p-4 border border-gray-200 dark:border-gray-700 rounded-lg",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-start justify-between mb-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center space-x-3",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-2xl",
                  },
                  review.userAvatar,
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "h5",
                    {
                      className: "font-medium text-gray-900 dark:text-white",
                    },
                    review.userName,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center space-x-2",
                    },
                    /*#__PURE__*/ React.createElement(StarRating, {
                      rating: review.rating,
                      readonly: true,
                    }),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-xs text-gray-500",
                      },
                      new Date(review.date).toLocaleDateString(),
                    ),
                  ),
                ),
              ),
            ),
            review.comment &&
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className: "text-gray-700 dark:text-gray-300 mb-3",
                },
                review.comment,
              ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center justify-between",
              },
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => handleHelpful(review.id),
                  className:
                    "flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  null,
                  /*#__PURE__*/ React.createElement(ThumbsUp, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  null,
                  "Helpful (",
                  review.helpful,
                  ")",
                ),
              ),
            ),
          ),
        ),
    ),
    reviews.length === 0 &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center py-8",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-4xl mb-4",
          },
          /*#__PURE__*/ React.createElement(Star, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-gray-500 dark:text-gray-400",
          },
          "No reviews yet. Be the first to review this exercise!",
        ),
      ),
  );
};
export default ReviewSystem;
