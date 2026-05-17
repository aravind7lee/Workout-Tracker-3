import { Trophy, Star, BicepsFlexed, CheckCircle2, Salad, Rocket, MessageCircle, Activity, Zap, Circle, Clock, Lock, Edit, Heart, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";


export default function Forum() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [activeFilter, setActiveFilter] = useState("recent");
  const [liveUsers, setLiveUsers] = useState(1247);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [postSuccess, setPostSuccess] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  // Load posts from localStorage on component mount
  useEffect(() => {
    const loadPosts = () => {
      try {
        // Load user posts from localStorage
        const savedPosts = JSON.parse(
          localStorage.getItem("gymtracker_forum_posts") || "[]",
        );

        // Default expert posts for demonstration
        const expertPosts = [
          {
            _id: "expert_1",
            user: {
              name: 'Alex "Beast" Johnson',
              level: "Elite Athlete",
              avatar: /*#__PURE__*/ React.createElement(Trophy, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              verified: true,
            },
            content: /*#__PURE__*/ React.createElement(
              React.Fragment,
              null,
              "Just smashed my 5K PR - 18:45! ",
              /*#__PURE__*/ React.createElement(Star, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " The key was consistent interval training and proper nutrition. Who else is working on their cardio game?",
            ),
            likes: 47,
            replies: 12,
            timestamp: "2h ago",
            category: "Cardio",
            liked: false,
            trending: true,
            createdAt: Date.now() - 7200000, // 2 hours ago
          },
          {
            _id: "expert_2",
            user: {
              name: 'Sarah "Iron" Wilson',
              level: "Pro Trainer",
              avatar: /*#__PURE__*/ React.createElement(BicepsFlexed, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              verified: true,
            },
            content: /*#__PURE__*/ React.createElement(
              React.Fragment,
              null,
              "Meal prep Sunday complete! ",
              /*#__PURE__*/ React.createElement(CheckCircle2, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " This week: lean protein, complex carbs, and healthy fats. Consistency is everything in this game. Drop your meal prep tips below! ",
              /*#__PURE__*/ React.createElement(Salad, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            likes: 89,
            replies: 23,
            timestamp: "4h ago",
            category: "Nutrition",
            liked: true,
            trending: true,
            createdAt: Date.now() - 14400000, // 4 hours ago
          },
          {
            _id: "expert_3",
            user: {
              name: 'Mike "Tank" Chen',
              level: "Strength Coach",
              avatar: /*#__PURE__*/ React.createElement(Star, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              verified: true,
            },
            content: /*#__PURE__*/ React.createElement(
              React.Fragment,
              null,
              "NEW DEADLIFT PR: 405lbs! ",
              /*#__PURE__*/ React.createElement(Rocket, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Form over ego, always. Took me 2 years to get here safely. Progressive overload and patience pays off. What's your current PR?",
            ),
            likes: 156,
            replies: 34,
            timestamp: "6h ago",
            category: "Strength",
            liked: false,
            trending: true,
            createdAt: Date.now() - 21600000, // 6 hours ago
          },
        ];

        // Combine and sort by creation time (newest first)
        const allPosts = [...savedPosts, ...expertPosts].sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
        );
        setPosts(allPosts);
        setTotalPosts(allPosts.length);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading posts:", error);
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  // Save posts to localStorage whenever posts change
  const savePosts = (newPosts) => {
    try {
      // Only save user posts (not expert posts)
      const userPosts = newPosts.filter(
        (post) => !post._id.startsWith("expert_"),
      );
      localStorage.setItem("gymtracker_forum_posts", JSON.stringify(userPosts));
    } catch (error) {
      console.error("Error saving posts:", error);
    }
  };

  // Get relative time string
  const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Real-time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const userTimer = setInterval(() => {
      setLiveUsers((prev) => prev + Math.floor(Math.random() * 20) - 10);
    }, 5000);
    return () => {
      clearInterval(timer);
      clearInterval(userTimer);
    };
  }, []);
  const categories = [
    {
      name: "General",
      icon: /*#__PURE__*/ React.createElement(MessageCircle, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "blue",
    },
    {
      name: "Strength",
      icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "red",
    },
    {
      name: "Cardio",
      icon: /*#__PURE__*/ React.createElement(Activity, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "green",
    },
    {
      name: "Nutrition",
      icon: /*#__PURE__*/ React.createElement(Salad, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "orange",
    },
    {
      name: "Transformation",
      icon: /*#__PURE__*/ React.createElement(Star, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "purple",
    },
    {
      name: "Motivation",
      icon: /*#__PURE__*/ React.createElement(Zap, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "yellow",
    },
  ];
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      const now = Date.now();
      const post = {
        _id: `user_${now}`,
        user: {
          name: user?.name || "Elite Athlete",
          level: "Member",
          avatar: /*#__PURE__*/ React.createElement(Star, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          verified: false,
        },
        content: newPost.trim(),
        likes: 0,
        replies: 0,
        timestamp: "now",
        category: selectedCategory,
        liked: false,
        trending: false,
        createdAt: now,
      };
      const updatedPosts = [post, ...posts];
      setPosts(updatedPosts);
      savePosts(updatedPosts);
      setTotalPosts(updatedPosts.length);
      setNewPost("");

      // Show success message
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);

      // Simulate real-time engagement
      setTimeout(() => {
        const postsWithEngagement = updatedPosts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: Math.floor(Math.random() * 5) + 1,
              }
            : p,
        );
        setPosts(postsWithEngagement);
        savePosts(postsWithEngagement);
      }, 5000);
    }
  };
  const handleLike = (postId) => {
    const updatedPosts = posts.map((post) =>
      post._id === postId
        ? {
            ...post,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
            liked: !post.liked,
          }
        : post,
    );
    setPosts(updatedPosts);
    savePosts(updatedPosts);
  };
  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "trending") return post.trending;
    if (activeFilter === "recent") return true;
    return post.category.toLowerCase() === activeFilter.toLowerCase();
  });

  // Update timestamps in real-time
  useEffect(() => {
    const updateTimestamps = () => {
      setPosts((currentPosts) =>
        currentPosts.map((post) => ({
          ...post,
          timestamp: post.createdAt
            ? getRelativeTime(post.createdAt)
            : post.timestamp,
        })),
      );
    };
    const interval = setInterval(updateTimestamps, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black py-3 sm:py-4 md:py-6 lg:py-8",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center mb-4 sm:mb-6 md:mb-8",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4",
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
          }),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className:
                "text-[10px] xs:text-xs sm:text-sm font-medium text-white font-body text-center tracking-wide",
            },
            /*#__PURE__*/ React.createElement(Circle, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " LIVE COMMUNITY \u2022 ",
            liveUsers.toLocaleString(),
            " ATHLETES ONLINE",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "h1",
          {
            className:
              "text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading text-white mb-2 sm:mb-3 md:mb-4 px-2 leading-tight",
          },
          "GRIND-X ATHLETES FORUM",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className:
              "text-xs xs:text-sm sm:text-base text-neutral-400 font-body max-w-2xl mx-auto px-3 sm:px-4 leading-relaxed",
          },
          "Connect with certified trainers, elite athletes, and fitness enthusiasts. Share your journey, get expert advice, and motivate each other.",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "mt-2 sm:mt-3 md:mt-4 text-[10px] xs:text-xs text-neutral-500 font-body flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2",
          },
          /*#__PURE__*/ React.createElement("span", null, "Live Updates"),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "hidden sm:inline",
            },
            "\u2022",
          ),
          /*#__PURE__*/ React.createElement(
            "span",
            null,
            currentTime.toLocaleTimeString(),
          ),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "hidden sm:inline",
            },
            "\u2022",
          ),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "hidden xs:inline",
            },
            "Real-time Discussions",
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "lg:col-span-1 space-y-3 sm:space-y-4 md:space-y-6",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "lg:hidden",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "card",
              },
              /*#__PURE__*/ React.createElement(
                "h3",
                {
                  className:
                    "text-sm xs:text-base sm:text-lg font-heading text-white mb-2 sm:mb-3 md:mb-4 tracking-wide",
                },
                "CATEGORIES",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1",
                },
                categories.map((category) =>
                  /*#__PURE__*/ React.createElement(
                    "button",
                    {
                      key: category.name,
                      onClick: () =>
                        setActiveFilter(category.name.toLowerCase()),
                      className: `flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg transition-all duration-300 font-body text-xs xs:text-sm active:scale-95 ${activeFilter === category.name.toLowerCase() ? "bg-red-700/20 border border-red-600/30 text-red-500 shadow-lg shadow-red-600/20" : "bg-neutral-900/40 hover:bg-neutral-800/50 text-neutral-300 hover:text-white border border-transparent"}`,
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-sm xs:text-base",
                      },
                      category.icon,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "font-medium whitespace-nowrap",
                      },
                      category.name,
                    ),
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "hidden lg:block card",
            },
            /*#__PURE__*/ React.createElement(
              "h3",
              {
                className: "text-lg font-heading text-white mb-4",
              },
              "CATEGORIES",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2",
              },
              categories.map((category) =>
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    key: category.name,
                    onClick: () => setActiveFilter(category.name.toLowerCase()),
                    className: `w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 font-body ${activeFilter === category.name.toLowerCase() ? "bg-red-700/20 border border-red-600/30 text-red-500" : "bg-neutral-900/40 hover:bg-neutral-800/50 text-neutral-300 hover:text-white"}`,
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-lg",
                    },
                    category.icon,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "font-medium",
                    },
                    category.name,
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "lg:hidden",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "card",
              },
              /*#__PURE__*/ React.createElement(
                "h3",
                {
                  className:
                    "text-sm xs:text-base sm:text-lg font-heading text-white mb-2 sm:mb-3 md:mb-4 tracking-wide",
                },
                "FILTERS",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex gap-2 sm:gap-3",
                },
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () => setActiveFilter("trending"),
                    className: `flex-1 flex items-center justify-center gap-1.5 sm:gap-2 p-2 xs:p-2.5 sm:p-3 rounded-lg transition-all duration-300 font-body text-xs xs:text-sm active:scale-95 ${activeFilter === "trending" ? "bg-orange-600/20 border border-orange-500/30 text-orange-400 shadow-lg shadow-orange-500/20" : "bg-neutral-900/40 hover:bg-neutral-800/50 text-neutral-300 hover:text-white border border-transparent"}`,
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-sm xs:text-base",
                    },
                    /*#__PURE__*/ React.createElement(Star, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "font-medium",
                    },
                    "Trending",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () => setActiveFilter("recent"),
                    className: `flex-1 flex items-center justify-center gap-1.5 sm:gap-2 p-2 xs:p-2.5 sm:p-3 rounded-lg transition-all duration-300 font-body text-xs xs:text-sm active:scale-95 ${activeFilter === "recent" ? "bg-red-700/20 border border-red-600/30 text-red-500 shadow-lg shadow-red-600/20" : "bg-neutral-900/40 hover:bg-neutral-800/50 text-neutral-300 hover:text-white border border-transparent"}`,
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-sm xs:text-base",
                    },
                    /*#__PURE__*/ React.createElement(Clock, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "font-medium",
                    },
                    "Recent",
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "hidden lg:block card",
            },
            /*#__PURE__*/ React.createElement(
              "h3",
              {
                className: "text-lg font-heading text-white mb-4",
              },
              "FILTERS",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2",
              },
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => setActiveFilter("trending"),
                  className: `w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 font-body ${activeFilter === "trending" ? "bg-orange-600/20 border border-orange-500/30 text-orange-400" : "bg-neutral-900/40 hover:bg-neutral-800/50 text-neutral-300 hover:text-white"}`,
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-lg",
                  },
                  /*#__PURE__*/ React.createElement(Star, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "font-medium",
                  },
                  "Trending",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => setActiveFilter("recent"),
                  className: `w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 font-body ${activeFilter === "recent" ? "bg-red-700/20 border border-red-600/30 text-red-500" : "bg-neutral-900/40 hover:bg-neutral-800/50 text-neutral-300 hover:text-white"}`,
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-lg",
                  },
                  /*#__PURE__*/ React.createElement(Clock, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "font-medium",
                  },
                  "Recent",
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "card",
            },
            /*#__PURE__*/ React.createElement(
              "h3",
              {
                className:
                  "text-sm xs:text-base sm:text-lg font-heading text-white mb-2 sm:mb-3 md:mb-4 tracking-wide",
              },
              "LIVE STATS",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "grid grid-cols-3 lg:grid-cols-1 gap-2 xs:gap-3 lg:gap-0 lg:space-y-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex flex-col lg:flex-row items-center lg:justify-between text-center lg:text-left gap-0.5 lg:gap-0",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-neutral-400 font-body text-[10px] xs:text-xs sm:text-sm",
                  },
                  "Online Now",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-red-500 font-bold font-body text-xs xs:text-sm sm:text-base",
                  },
                  liveUsers.toLocaleString(),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex flex-col lg:flex-row items-center lg:justify-between text-center lg:text-left gap-0.5 lg:gap-0",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-neutral-400 font-body text-[10px] xs:text-xs sm:text-sm",
                  },
                  "Total Posts",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-red-500 font-bold font-body text-xs xs:text-sm sm:text-base",
                  },
                  totalPosts,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex flex-col lg:flex-row items-center lg:justify-between text-center lg:text-left gap-0.5 lg:gap-0",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-neutral-400 font-body text-[10px] xs:text-xs sm:text-sm",
                  },
                  "User Posts",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-red-600 font-bold font-body text-xs xs:text-sm sm:text-base",
                  },
                  posts.filter((p) => !p._id.startsWith("expert_")).length,
                ),
              ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "lg:col-span-3 space-y-3 sm:space-y-4 md:space-y-6",
          },
          postSuccess &&
            /*#__PURE__*/ React.createElement(
              motion.div,
              {
                initial: {
                  opacity: 0,
                  y: -20,
                },
                animate: {
                  opacity: 1,
                  y: 0,
                },
                className:
                  "card bg-green-600/20 border border-red-600/30 mb-3 sm:mb-4 md:mb-6 shadow-lg shadow-red-600/10",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-2 xs:gap-3",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "w-8 h-8 xs:w-10 xs:h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-white text-base xs:text-lg",
                    },
                    "\u2713",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "min-w-0 flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "font-semibold text-red-500 font-body text-xs xs:text-sm sm:text-base",
                    },
                    "Journey Shared Successfully!",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-[10px] xs:text-xs sm:text-sm text-green-300 font-body leading-relaxed",
                    },
                    "Your fitness journey is now visible to the entire GymTracker community. Keep inspiring others!",
                  ),
                ),
              ),
            ),
          isAuthenticated()
            ? /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "card",
                },
                /*#__PURE__*/ React.createElement(
                  "h3",
                  {
                    className:
                      "text-sm xs:text-base sm:text-lg lg:text-xl font-heading text-white mb-2 sm:mb-3 md:mb-4 text-center sm:text-left tracking-wide",
                  },
                  "SHARE YOUR FITNESS JOURNEY",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "bg-red-700/10 border border-red-600/20 rounded-lg p-2.5 xs:p-3 sm:p-4 mb-2 sm:mb-3 md:mb-4",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex items-center gap-1.5 sm:gap-2",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-red-500 text-xs xs:text-sm",
                        },
                        /*#__PURE__*/ React.createElement(Circle, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "text-red-500 font-semibold text-[10px] xs:text-xs sm:text-sm font-body tracking-wide",
                        },
                        "REAL-TIME POSTING",
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className:
                        "text-neutral-300 text-[10px] xs:text-xs sm:text-sm font-body leading-relaxed",
                    },
                    "Your journey will be instantly visible to all ",
                    liveUsers.toLocaleString(),
                    " online athletes and stored permanently in our community.",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "form",
                  {
                    onSubmit: handleSubmit,
                    className: "space-y-3 sm:space-y-4",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center gap-2 xs:gap-3 sm:gap-4",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xs xs:text-sm sm:text-base shadow-lg",
                      },
                      user?.name?.charAt(0) || "U",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "min-w-0 flex-1",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "font-semibold text-white font-body text-xs xs:text-sm sm:text-base truncate",
                        },
                        user?.name || "Elite Athlete",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-[10px] xs:text-xs text-neutral-400 font-body",
                        },
                        "Member \u2022 Online Now",
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "w-full",
                    },
                    /*#__PURE__*/ React.createElement(
                      "select",
                      {
                        value: selectedCategory,
                        onChange: (e) => setSelectedCategory(e.target.value),
                        className:
                          "w-full px-2.5 xs:px-3 py-2 xs:py-2.5 sm:py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-lg text-white font-body text-xs xs:text-sm focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
                      },
                      categories.map((cat) =>
                        /*#__PURE__*/ React.createElement(
                          "option",
                          {
                            key: cat.name,
                            value: cat.name,
                          },
                          cat.icon,
                          " ",
                          cat.name,
                        ),
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "w-full",
                    },
                    /*#__PURE__*/ React.createElement("textarea", {
                      value: newPost,
                      onChange: (e) => setNewPost(e.target.value),
                      placeholder: /*#__PURE__*/ React.createElement(
                        React.Fragment,
                        null,
                        "Share your workout achievements, nutrition discoveries, transformation milestones, training tips, or motivational stories. Your journey inspires others! ",
                        /*#__PURE__*/ React.createElement(BicepsFlexed, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                      ),
                      className:
                        "w-full p-2.5 xs:p-3 sm:p-4 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 font-body resize-none text-xs xs:text-sm sm:text-base transition-all",
                      rows: window.innerWidth < 640 ? 3 : 4,
                      maxLength: 500,
                    }),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1.5 sm:mt-2 gap-1 sm:gap-2",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "text-[10px] xs:text-xs text-neutral-500 font-body",
                        },
                        newPost.length,
                        "/500 characters",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "text-[10px] xs:text-xs text-red-500 font-body",
                        },
                        "\u2713 Auto-saved \u2022 Visible to all users",
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex justify-center sm:justify-end pt-1",
                    },
                    /*#__PURE__*/ React.createElement(
                      motion.button,
                      {
                        type: "submit",
                        disabled: !newPost.trim(),
                        whileHover: {
                          scale: 1.02,
                        },
                        whileTap: {
                          scale: 0.98,
                        },
                        className:
                          "w-full sm:w-auto px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 bg-gradient-to-r from-red-700 to-red-700 hover:from-red-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-red-600/25 font-body text-xs xs:text-sm sm:text-base active:scale-95",
                      },
                      /*#__PURE__*/ React.createElement(Rocket, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " Share Journey",
                    ),
                  ),
                ),
              )
            : /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "card bg-neutral-900/40 border border-neutral-700/30",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-center py-4 xs:py-6 sm:py-8 px-3 xs:px-4",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-2xl xs:text-3xl sm:text-4xl mb-2 xs:mb-3 sm:mb-4",
                    },
                    /*#__PURE__*/ React.createElement(Lock, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "h3",
                    {
                      className:
                        "text-sm xs:text-base sm:text-lg font-heading text-white mb-1.5 xs:mb-2 tracking-wide",
                    },
                    "JOIN THE COMMUNITY",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className:
                        "text-xs xs:text-sm sm:text-base text-neutral-400 font-body mb-3 xs:mb-4 leading-relaxed",
                    },
                    "Login to share your fitness journey with ",
                    liveUsers.toLocaleString(),
                    " elite athletes worldwide",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "flex flex-col sm:flex-row gap-2 xs:gap-3 justify-center max-w-xs mx-auto",
                    },
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => (window.location.href = "/login"),
                        className:
                          "w-full sm:w-auto px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 bg-red-700 hover:bg-blue-700 text-white rounded-lg font-body transition-all active:scale-95 text-xs xs:text-sm sm:text-base shadow-lg",
                      },
                      "Login",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => (window.location.href = "/register"),
                        className:
                          "w-full sm:w-auto px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-body transition-all active:scale-95 text-xs xs:text-sm sm:text-base shadow-lg",
                      },
                      "Sign Up",
                    ),
                  ),
                ),
              ),
          isLoading
            ? /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center py-6 xs:py-8 sm:py-12",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "animate-spin w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-2 xs:mb-3 sm:mb-4",
                }),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-xs xs:text-sm sm:text-base text-neutral-400 font-body",
                  },
                  "Loading community posts...",
                ),
              )
            : /*#__PURE__*/ React.createElement(
                AnimatePresence,
                null,
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "space-y-3 sm:space-y-4 md:space-y-6",
                  },
                  filteredPosts.length === 0
                    ? /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-center py-6 xs:py-8 sm:py-12 px-3 xs:px-4",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-2xl xs:text-3xl sm:text-4xl mb-2 xs:mb-3 sm:mb-4",
                          },
                          /*#__PURE__*/ React.createElement(Edit, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "h3",
                          {
                            className:
                              "text-sm xs:text-base sm:text-lg font-heading text-white mb-1.5 xs:mb-2 tracking-wide",
                          },
                          "NO POSTS YET",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "p",
                          {
                            className:
                              "text-xs xs:text-sm sm:text-base text-neutral-400 font-body",
                          },
                          "Be the first to share your fitness journey in this category!",
                        ),
                      )
                    : filteredPosts.map((post, index) =>
                        /*#__PURE__*/ React.createElement(
                          motion.div,
                          {
                            key: post._id,
                            initial: {
                              opacity: 0,
                              y: 20,
                            },
                            animate: {
                              opacity: 1,
                              y: 0,
                            },
                            transition: {
                              duration: 0.3,
                              delay: index * 0.1,
                            },
                            className:
                              "card hover:scale-[1.01] transition-all duration-300 relative",
                          },
                          post.trending &&
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className:
                                  "absolute -top-1.5 xs:-top-2 -right-1.5 xs:-right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full font-bold animate-pulse shadow-lg",
                              },
                              /*#__PURE__*/ React.createElement(Star, {
                                className: "w-[1em] h-[1em] inline-block",
                              }),
                              " TRENDING",
                            ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "flex items-start gap-2 xs:gap-3 sm:gap-4",
                            },
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "relative flex-shrink-0",
                              },
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className:
                                    "w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-xs xs:text-sm sm:text-base shadow-lg",
                                },
                                post.user.avatar,
                              ),
                              post.user.verified &&
                                /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className:
                                      "absolute -bottom-0.5 xs:-bottom-1 -right-0.5 xs:-right-1 w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "text-white text-[8px] xs:text-[10px] sm:text-xs",
                                    },
                                    "\u2713",
                                  ),
                                ),
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "flex-1 min-w-0",
                              },
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className:
                                    "flex flex-wrap items-center gap-1 xs:gap-1.5 sm:gap-2 mb-1.5 xs:mb-2",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "h4",
                                  {
                                    className:
                                      "font-semibold text-white font-body text-xs xs:text-sm sm:text-base truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none",
                                  },
                                  post.user.name,
                                ),
                                post.user.verified &&
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "text-red-500 text-[10px] xs:text-xs",
                                    },
                                    "\u2713",
                                  ),
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  {
                                    className:
                                      "px-1.5 xs:px-2 py-0.5 xs:py-1 bg-neutral-800/50 rounded-full text-[10px] xs:text-xs text-neutral-300 font-body",
                                  },
                                  post.user.level,
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[10px] xs:text-xs text-neutral-500 font-body hidden sm:inline",
                                  },
                                  "\u2022 ",
                                  post.timestamp,
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  {
                                    className: `px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-body ${post.category === "Strength" ? "bg-red-600/20 text-red-400" : post.category === "Cardio" ? "bg-green-600/20 text-red-500" : post.category === "Nutrition" ? "bg-orange-600/20 text-orange-400" : post.category === "Transformation" ? "bg-red-800/20 text-red-600" : "bg-red-700/20 text-red-500"}`,
                                  },
                                  post.category,
                                ),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className:
                                    "sm:hidden text-[10px] xs:text-xs text-neutral-500 font-body mb-1.5 xs:mb-2",
                                },
                                post.timestamp,
                              ),
                              /*#__PURE__*/ React.createElement(
                                "p",
                                {
                                  className:
                                    "text-neutral-300 mb-2 xs:mb-3 sm:mb-4 font-body leading-relaxed text-xs xs:text-sm sm:text-base break-words",
                                },
                                post.content,
                              ),
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className:
                                    "flex items-center gap-2 xs:gap-3 sm:gap-6 flex-wrap",
                                },
                                /*#__PURE__*/ React.createElement(
                                  motion.button,
                                  {
                                    onClick: () => handleLike(post._id),
                                    whileHover: {
                                      scale: 1.1,
                                    },
                                    whileTap: {
                                      scale: 0.9,
                                    },
                                    className: `flex items-center gap-1 xs:gap-1.5 sm:gap-2 transition-colors font-body active:scale-90 ${post.liked ? "text-red-400" : "text-neutral-400 hover:text-red-400"}`,
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "text-xs xs:text-sm sm:text-base",
                                    },
                                    post.liked ? "❤️" : "🤍",
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "text-[10px] xs:text-xs sm:text-sm font-semibold",
                                    },
                                    post.likes,
                                  ),
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "button",
                                  {
                                    className:
                                      "flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-neutral-400 hover:text-red-500 transition-colors font-body active:scale-90",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "text-xs xs:text-sm sm:text-base",
                                    },
                                    /*#__PURE__*/ React.createElement(
                                      MessageCircle,
                                      {
                                        className:
                                          "w-[1em] h-[1em] inline-block",
                                      },
                                    ),
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "text-[10px] xs:text-xs sm:text-sm",
                                    },
                                    post.replies,
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "hidden sm:inline text-[10px] xs:text-xs sm:text-sm",
                                    },
                                    "replies",
                                  ),
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "button",
                                  {
                                    className:
                                      "flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-neutral-400 hover:text-red-500 transition-colors font-body active:scale-90",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "text-xs xs:text-sm sm:text-base",
                                    },
                                    /*#__PURE__*/ React.createElement(
                                      RefreshCw,
                                      {
                                        className:
                                          "w-[1em] h-[1em] inline-block",
                                      },
                                    ),
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "hidden sm:inline text-[10px] xs:text-xs sm:text-sm",
                                    },
                                    "Share",
                                  ),
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "button",
                                  {
                                    className:
                                      "flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-neutral-400 hover:text-yellow-400 transition-colors font-body ml-auto active:scale-90",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "text-xs xs:text-sm sm:text-base",
                                    },
                                    /*#__PURE__*/ React.createElement(Star, {
                                      className: "w-[1em] h-[1em] inline-block",
                                    }),
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className:
                                        "hidden sm:inline text-[10px] xs:text-xs sm:text-sm",
                                    },
                                    "Save",
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                ),
              ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "card bg-gradient-to-r from-red-700/10 to-red-800/10 border border-red-600/20 shadow-lg",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center px-2 xs:px-3 sm:px-4",
                },
                /*#__PURE__*/ React.createElement(
                  "h3",
                  {
                    className:
                      "text-sm xs:text-base sm:text-lg font-heading text-white mb-2 xs:mb-3 sm:mb-4 tracking-wide",
                  },
                  "COMMUNITY IMPACT",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-base xs:text-lg sm:text-2xl font-bold text-red-500 font-body",
                      },
                      totalPosts,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[10px] xs:text-xs text-neutral-400 font-body",
                      },
                      "Total Journeys",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-base xs:text-lg sm:text-2xl font-bold text-red-500 font-body",
                      },
                      posts.reduce((sum, p) => sum + p.likes, 0),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[10px] xs:text-xs text-neutral-400 font-body",
                      },
                      "Total Likes",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-base xs:text-lg sm:text-2xl font-bold text-red-600 font-body",
                      },
                      liveUsers.toLocaleString(),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[10px] xs:text-xs text-neutral-400 font-body",
                      },
                      "Active Users",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-[10px] xs:text-xs sm:text-sm text-neutral-500 font-body mt-2 xs:mt-3 sm:mt-4 leading-relaxed",
                  },
                  "Every journey shared inspires others to achieve their fitness goals",
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
