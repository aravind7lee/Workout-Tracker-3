// frontend/src/services/reviewService.js - Real-time review system
import api from '../utils/api';

class ReviewService {
  // Submit review with real-time database storage
  async submitReview(exerciseId, reviewData) {
    try {
      const response = await api.post('/reviews', {
        exerciseId,
        ...reviewData,
        timestamp: new Date().toISOString()
      });
      
      // Trigger real-time update event
      window.dispatchEvent(new CustomEvent('reviewSubmitted', { 
        detail: { exerciseId, review: response.data } 
      }));
      
      return response.data;
    } catch (error) {
      // Fallback to localStorage if API fails
      const reviews = JSON.parse(localStorage.getItem(`reviews_${exerciseId}`) || '[]');
      const newReview = {
        id: Date.now(),
        ...reviewData,
        author: 'You',
        avatar: '👤',
        date: new Date().toLocaleDateString(),
        helpful: 0,
        timestamp: new Date().toISOString()
      };
      
      const updatedReviews = [newReview, ...reviews];
      localStorage.setItem(`reviews_${exerciseId}`, JSON.stringify(updatedReviews));
      
      // Trigger local update event
      window.dispatchEvent(new CustomEvent('reviewSubmitted', { 
        detail: { exerciseId, review: newReview } 
      }));
      
      return newReview;
    }
  }

  // Get reviews for exercise
  async getReviews(exerciseId) {
    try {
      const response = await api.get(`/reviews/${exerciseId}`);
      return response.data;
    } catch (error) {
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem(`reviews_${exerciseId}`) || '[]');
    }
  }

  // Mark review as helpful
  async markHelpful(reviewId) {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark helpful:', error);
      return null;
    }
  }
}

export const reviewService = new ReviewService();
export default reviewService;