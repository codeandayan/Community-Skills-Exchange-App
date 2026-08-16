import axios from "axios";

// Base URL for our Strapi backend
const API_URL = "http://localhost:1337/api";

// Helper to get auth token
const getToken = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined" && token !== "") {
      return token;
    }
  }
  return null;
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Helper to extract plain text from Strapi rich text blocks
export const extractPlainText = (richText) => {
  if (!richText) return "";
  if (typeof richText === "string") return richText;

  if (Array.isArray(richText)) {
    return richText
      .map((block) => {
        if (block.children && Array.isArray(block.children)) {
          return block.children.map((child) => child.text || "").join("");
        }
        return "";
      })
      .join("\n");
  }

  return String(richText);
};

// Skills API
export const skillsAPI = {
  // Get all published skills
  getAll: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/skills`, {
        headers: getAuthHeaders(),
        params: {
          populate: "*",
          sort: "createdAt:desc",
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching skills:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Get single skill by ID
  getOne: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/skills/${id}`, {
        headers: getAuthHeaders(),
        params: {
          populate: "*",
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching skill:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Create a new skill (requires auth)
  create: async (skillData, userId) => {
    try {
      const response = await axios.post(
        `${API_URL}/skills`,
        {
          data: {
            ...skillData,
            user: userId,
            publishedAt: new Date().toISOString(),
          },
        },
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating skill:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Get skills for a specific user
  getMySkills: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/skills`, {
        headers: getAuthHeaders(),
        params: {
          populate: "*",
          sort: "createdAt:desc",
          pagination: { pageSize: 100 }, // ADD THIS LINE
          filters: {
            user: {
              id: {
                $eq: userId,
              },
            },
          },
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user skills:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Bookings API
export const bookingsAPI = {
  // Create a new booking request
  create: async (bookingData) => {
    try {
      const payload = {
        data: {
          message:
            bookingData.message || "I'm interested in learning this skill!",
          scheduled_date:
            bookingData.scheduled_date || new Date().toISOString(),
          booking_status: "Pending",
        },
      };

      // Add relations if provided
      if (bookingData.requester) {
        payload.data.requester = bookingData.requester;
      }
      if (bookingData.skill) {
        payload.data.skill = bookingData.skill;
      }

      const response = await axios.post(
        `${API_URL}/bookings?populate=*`,
        payload,
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating booking:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Get bookings for a specific user (as requester)
  getMyBookings: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: getAuthHeaders(),
        params: {
          populate: "*",
          filters: {
            requester: {
              id: {
                $eq: userId,
              },
            },
          },
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching bookings:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Get bookings for skills owned by a user (incoming requests)
  getIncomingBookings: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: getAuthHeaders(),
        params: {
          populate: "*",
          filters: {
            skill: {
              user: {
                id: {
                  $eq: userId,
                },
              },
            },
          },
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching incoming bookings:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Update booking status (accept/complete/cancel)
  updateStatus: async (bookingId, status) => {
    try {
      const response = await axios.put(
        `${API_URL}/bookings/${bookingId}`,
        {
          data: {
            booking_status: status,
          },
        },
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error updating booking:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  // Check if a user has already requested a specific skill
  checkExistingRequest: async (userId, skillDocumentId) => {
    try {
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: getAuthHeaders(),
        params: {
          populate: "*",
          filters: {
            $and: [
              {
                requester: {
                  id: {
                    $eq: userId,
                  },
                },
              },
              {
                skill: {
                  documentId: {
                    $eq: skillDocumentId,
                  },
                },
              },
            ],
          },
        },
      });
      // Return the first existing booking, or null
      return response.data?.data?.[0] || null;
    } catch (error) {
      console.error(
        "Error checking existing request:",
        error.response?.data || error.message,
      );
      return null;
    }
  },
};
// Reviews API
export const reviewsAPI = {
  // Create a review
  create: async (reviewData) => {
    try {
      const response = await axios.post(
        `${API_URL}/reviews`,
        {
          data: {
            rating: reviewData.rating,
            comment: reviewData.comment,
            reviewer: reviewData.reviewer,
            skill: reviewData.skill,
            booking: reviewData.booking,
            publishedAt: new Date().toISOString(),
          },
        },
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating review:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Get reviews for a specific skill
  getForSkill: async (skillDocumentId) => {
    try {
      const response = await axios.get(`${API_URL}/reviews`, {
        headers: getAuthHeaders(),
        params: {
          populate: "*",
          sort: "createdAt:desc",
          filters: {
            skill: {
              documentId: {
                $eq: skillDocumentId,
              },
            },
          },
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching reviews:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Get average rating for a skill
  getAverageRating: async (skillDocumentId) => {
    try {
      const response = await reviewsAPI.getForSkill(skillDocumentId);
      const reviews = response?.data || [];
      if (reviews.length === 0) return { average: 0, count: 0 };

      const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      return {
        average: (total / reviews.length).toFixed(1),
        count: reviews.length,
      };
    } catch (error) {
      console.error("Error calculating average rating:", error);
      return { average: 0, count: 0 };
    }
  },

  // Check if user already reviewed a booking
  checkExistingReview: async (bookingDocumentId) => {
    try {
      const response = await axios.get(`${API_URL}/reviews`, {
        headers: getAuthHeaders(),
        params: {
          filters: {
            booking: {
              documentId: {
                $eq: bookingDocumentId,
              },
            },
          },
        },
      });
      return response.data?.data?.[0] || null;
    } catch (error) {
      console.error(
        "Error checking existing review:",
        error.response?.data || error.message,
      );
      return null;
    }
  },
};
// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: getAuthHeaders(),
        params: {
          fields: ["username", "email", "custom_role", "createdAt", "avatar"],
          sort: "createdAt:desc",
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        { role },
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting user:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Get dashboard stats
  getStats: async () => {
    try {
      const [usersRes, skillsRes, bookingsRes, reviewsRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/skills`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/bookings`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/reviews`, { headers: getAuthHeaders() }),
      ]);
      return {
        totalUsers: usersRes.data?.length || 0,
        totalSkills: skillsRes.data?.data?.length || 0,
        totalBookings: bookingsRes.data?.data?.length || 0,
        totalReviews: reviewsRes.data?.data?.length || 0,
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        totalUsers: 0,
        totalSkills: 0,
        totalBookings: 0,
        totalReviews: 0,
      };
    }
  },

  // Delete skill
  deleteSkill: async (skillId) => {
    try {
      const response = await axios.delete(`${API_URL}/skills/${skillId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting skill:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Delete booking
  deleteBooking: async (bookingId) => {
    try {
      const response = await axios.delete(`${API_URL}/bookings/${bookingId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting booking:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Delete review
  deleteReview: async (reviewId) => {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting review:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  updateUserStatus: async (userId, status) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        { account_status: status },
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error updating user status:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        { custom_role: role },
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error updating user role:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Email API
export const emailAPI = {
  sendNotification: async (type, data) => {
    try {
      const response = await axios.post(
        `${API_URL}/email/send`,
        { type, ...data },
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error sending email notification:",
        error.response?.data || error.message,
      );
      // Don't throw - email failure shouldn't break the app
      return { success: false };
    }
  },
};
// Auth API
export const authAPI = {
  login: async (identifier, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/local`,
        { identifier, password },
        { headers: { "Content-Type": "application/json" } },
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("Login error - Server response:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error("Login error - No response:", error.request);
      } else {
        console.error("Login error - Setup:", error.message);
      }
      throw error;
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/local/register`,
        { username, email, password },
        { headers: { "Content-Type": "application/json" } },
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("Registration error - Server response:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error("Registration error - No response:", error.request);
      } else {
        console.error("Registration error - Setup:", error.message);
      }
      throw error;
    }
  },
};
// Pages API
export const pagesAPI = {
  getBySlug: async (slug) => {
    try {
      const response = await axios.get(`${API_URL}/pages`, {
        params: {
          filters: {
            slug: {
              $eq: slug,
            },
          },
        },
      });
      return response.data?.data?.[0] || null;
    } catch (error) {
      console.error(
        "Error fetching page:",
        error.response?.data || error.message,
      );
      return null;
    }
  },
};
