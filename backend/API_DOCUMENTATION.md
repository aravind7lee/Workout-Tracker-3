# Workout Tracker API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication Routes (`/auth`)

#### Register User
- **POST** `/auth/register`
- **Body**: `{ name, email, password }` + optional `profileImage` file
- **Response**: `{ message: "User registered successfully" }`

#### Login User
- **POST** `/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ token, id, name, email, profileImage }`

### User Routes (`/users`) 🔒

#### Get Current User
- **GET** `/users/me`
- **Response**: User object

#### Update Current User
- **PUT** `/users/me`
- **Body**: User fields to update
- **Response**: Updated user object

#### Upload Profile Image
- **POST** `/users/me/avatar`
- **Body**: `profileImage` file
- **Response**: `{ profileImage: "cloudinary_url" }`

### Workout Routes (`/workouts`) 🔒

#### Get Workouts
- **GET** `/workouts?public=true` (for public workouts)
- **GET** `/workouts` (for user's workouts)
- **Response**: Array of workout objects

#### Create Workout
- **POST** `/workouts`
- **Body**: `{ title, exercises, durationMinutes, calories, isPublic }`
- **Response**: Created workout object

#### Get Single Workout
- **GET** `/workouts/:id`
- **Response**: Workout object with populated exercises

#### Update Workout
- **PUT** `/workouts/:id`
- **Body**: Workout fields to update
- **Response**: Updated workout object

#### Toggle Workout Visibility
- **PATCH** `/workouts/:id/visibility`
- **Response**: `{ isPublic: boolean }`

#### Delete Workout
- **DELETE** `/workouts/:id`
- **Response**: `{ message: "Workout deleted successfully" }`

### Exercise Routes (`/exercises`)

#### Get Exercises with Filtering
- **GET** `/exercises?q=search&category=strength&muscle=chest&difficulty=beginner&sort=rating&page=1&limit=20`
- **Query Parameters**:
  - `q`: Search term (name/instructions)
  - `category`: Exercise category
  - `muscle`: Target muscle
  - `difficulty`: Beginner/Intermediate/Advanced
  - `sort`: name/rating/reviews/newest
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
- **Response**: `{ exercises: [], pagination: { current, pages, total } }`

#### Get Filter Options
- **GET** `/exercises/filters`
- **Response**: `{ categories: [], muscles: [], difficulties: [] }`

#### Get Single Exercise
- **GET** `/exercises/:id`
- **Response**: Exercise object

#### Create Exercise 🔒
- **POST** `/exercises`
- **Body**: `{ name, category, muscles, instructions, videoUrl, difficulty }` + optional `thumbnail` file
- **Response**: Created exercise object

### Review Routes (`/reviews`) 🔒

#### Get Reviews for Item
- **GET** `/reviews/:targetType/:targetId?page=1&limit=10&sort=createdAt`
- **Parameters**:
  - `targetType`: workout/exercise/meal/plan
  - `targetId`: ID of the item being reviewed
- **Response**: `{ reviews: [], pagination: {}, stats: { avg, count } }`

#### Create Review
- **POST** `/reviews`
- **Body**: `{ targetType, targetId, rating, title, content }`
- **Response**: Created review object

#### Update Review
- **PUT** `/reviews/:id`
- **Body**: `{ rating, title, content }`
- **Response**: Updated review object

#### Delete Review
- **DELETE** `/reviews/:id`
- **Response**: `{ message: "Review deleted successfully" }`

#### Mark Review as Helpful
- **POST** `/reviews/:id/helpful`
- **Response**: `{ helpful: number, isHelpful: boolean }`

#### Get User's Reviews
- **GET** `/reviews/user/me`
- **Response**: Array of user's reviews

### Meal Routes (`/meals`) 🔒

#### Get User's Meals
- **GET** `/meals`
- **Response**: Array of meal objects

#### Create Meal
- **POST** `/meals`
- **Body**: `{ date, type, items, totalCalories, macros }`
- **Response**: Created meal object

### Plan Routes (`/plans`) 🔒

#### Get User's Plans
- **GET** `/plans`
- **Response**: Array of plan objects with populated exercises

#### Create Plan
- **POST** `/plans`
- **Body**: `{ name, description, days }`
- **Response**: Created plan object

### Achievement Routes (`/achievements`) 🔒

#### Get User's Achievements
- **GET** `/achievements`
- **Response**: Array of achievement objects

#### Create Achievement
- **POST** `/achievements`
- **Body**: `{ title, description, badgeIcon }`
- **Response**: Created achievement object

### Post Routes (`/posts`) 🔒

#### Get All Posts
- **GET** `/posts`
- **Response**: Array of posts with populated user info

#### Create Post
- **POST** `/posts`
- **Body**: `{ content }` + optional `image` file
- **Response**: Created post object

#### Like/Unlike Post
- **POST** `/posts/:id/like`
- **Response**: Updated post object

## Data Models

### User
```javascript
{
  name: String,
  email: String,
  password: String,
  profileImage: String,
  bio: String,
  stats: {
    weight: Number,
    bodyFat: Number,
    height: Number,
    xp: Number,
    streak: Number
  }
}
```

### Workout
```javascript
{
  user: ObjectId,
  title: String,
  exercises: [{
    exercise: ObjectId,
    sets: [{ reps: Number, weight: Number, rest: Number }],
    notes: String
  }],
  durationMinutes: Number,
  calories: Number,
  isPublic: Boolean,
  reviewStats: {
    averageRating: Number,
    totalReviews: Number
  }
}
```

### Exercise
```javascript
{
  name: String,
  category: String,
  muscles: [String],
  instructions: String,
  videoUrl: String,
  thumbnail: String,
  difficulty: String,
  reviewStats: {
    averageRating: Number,
    totalReviews: Number
  }
}
```

### Review
```javascript
{
  user: ObjectId,
  targetType: String, // workout/exercise/meal/plan
  targetId: ObjectId,
  rating: Number, // 1-5
  title: String,
  content: String,
  helpful: [ObjectId] // users who found it helpful
}
```

## Error Responses
All endpoints return errors in this format:
```javascript
{
  message: "Error description",
  error: "Detailed error info" // in development
}
```

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

🔒 = Requires Authentication