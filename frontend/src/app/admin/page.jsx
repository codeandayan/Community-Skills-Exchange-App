"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  BookOpen,
  Calendar,
  Star,
  Trash2,
  Shield,
  ArrowLeft,
  Search,
  RefreshCw,
  Ban,
  UserCheck,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminAPI } from "@/lib/api";
import axios from "axios";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    totalBookings: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const isAdmin =
      user &&
      (user.role === "Admin" ||
        user.role?.name === "Admin" ||
        user.custom_role === "Admin");
    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchAllData();
  }, [user, isAuthenticated]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsData, usersRes, skillsRes, bookingsRes, reviewsRes] =
        await Promise.all([
          adminAPI.getStats(),
          adminAPI.getAllUsers(),
          axios.get(
            "http://localhost:1337/api/skills?populate=*&sort=createdAt:desc",
            { headers },
          ),
          axios.get(
            "http://localhost:1337/api/bookings?populate=*&sort=createdAt:desc",
            { headers },
          ),
          axios.get(
            "http://localhost:1337/api/reviews?populate=*&sort=createdAt:desc",
            { headers },
          ),
        ]);

      setStats(statsData);
      setUsers(usersRes || []);
      setSkills(skillsRes.data?.data || []);
      setBookings(bookingsRes.data?.data || []);
      setReviews(reviewsRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "Suspended" ? "Active" : "Suspended";
    const action = newStatus === "Suspended" ? "suspend" : "activate";

    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, account_status: newStatus } : u,
        ),
      );
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      alert(`Failed to ${action} user.`);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const currentRoleName = currentRole || "Authenticated";
    const newRole = currentRoleName === "Admin" ? "Authenticated" : "Admin";
    const action = newRole === "Admin" ? "make admin" : "remove admin";

    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, custom_role: newRole } : u,
        ),
      );
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      alert(`Failed to ${action} user.`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This cannot be undone.",
      )
    )
      return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      fetchAllData();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    try {
      await adminAPI.deleteSkill(skillId);
      setSkills(
        skills.filter((s) => s.documentId !== skillId && s.id !== skillId),
      );
      fetchAllData();
    } catch (err) {
      console.error("Failed to delete skill:", err);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await adminAPI.deleteBooking(bookingId);
      setBookings(
        bookings.filter(
          (b) => b.documentId !== bookingId && b.id !== bookingId,
        ),
      );
      fetchAllData();
    } catch (err) {
      console.error("Failed to delete booking:", err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await adminAPI.deleteReview(reviewId);
      setReviews(
        reviews.filter((r) => r.documentId !== reviewId && r.id !== reviewId),
      );
      fetchAllData();
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  const getUserRole = (u) => {
    if (u.custom_role) return u.custom_role;
    if (typeof u.role === "string") return u.role;
    if (u.role?.name) return u.role.name;
    return "User";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-yellow-400" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Site
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Skills</p>
                  <p className="text-2xl font-bold">{stats.totalSkills}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
          >
            Users ({users.length})
          </Button>
          <Button
            variant={activeTab === "skills" ? "default" : "outline"}
            onClick={() => setActiveTab("skills")}
          >
            Skills ({skills.length})
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "outline"}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings ({bookings.length})
          </Button>
          <Button
            variant={activeTab === "reviews" ? "default" : "outline"}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({reviews.length})
          </Button>
          <Button variant="outline" onClick={fetchAllData}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manage Users</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left bg-gray-50">
                      <th className="pb-3 font-medium px-2">User</th>
                      <th className="pb-3 font-medium px-2">Email</th>
                      <th className="pb-3 font-medium px-2">Role</th>
                      <th className="pb-3 font-medium px-2">Status</th>
                      <th className="pb-3 font-medium px-2">Joined</th>
                      <th className="pb-3 font-medium px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {u.username?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span className="font-medium">{u.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-600 text-xs">
                          {u.email}
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={
                              getUserRole(u) === "Admin" ? "default" : "outline"
                            }
                          >
                            {getUserRole(u)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant="outline"
                            className={
                              u.account_status === "Suspended"
                                ? "bg-red-50 text-red-700 border-red-300"
                                : "bg-green-50 text-green-700 border-green-300"
                            }
                          >
                            {u.account_status || "Active"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-gray-600 text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            {/* Role Toggle */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className={
                                getUserRole(u) === "Admin"
                                  ? "text-blue-600 hover:text-blue-700"
                                  : "text-gray-400 hover:text-gray-600"
                              }
                              onClick={() =>
                                handleToggleRole(u.id, getUserRole(u))
                              }
                              title={
                                getUserRole(u) === "Admin"
                                  ? "Remove Admin"
                                  : "Make Admin"
                              }
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>

                            {/* Suspend/Activate */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className={
                                u.account_status === "Suspended"
                                  ? "text-green-600 hover:text-green-700"
                                  : "text-yellow-600 hover:text-yellow-700"
                              }
                              onClick={() =>
                                handleToggleStatus(u.id, u.account_status)
                              }
                              title={
                                u.account_status === "Suspended"
                                  ? "Activate User"
                                  : "Suspend User"
                              }
                            >
                              {u.account_status === "Suspended" ? (
                                <UserCheck className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteUser(u.id)}
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    No users found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "skills" && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {skills.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No skills found.
                  </p>
                ) : (
                  skills.map((skill) => (
                    <div
                      key={skill.id || skill.documentId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{skill.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{skill.category}</Badge>
                          <Badge variant="outline">{skill.skill_type}</Badge>
                          <span className="text-xs text-gray-500">
                            by {skill.user?.username || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          handleDeleteSkill(skill.documentId || skill.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "bookings" && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No bookings found.
                  </p>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking.id || booking.documentId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {booking.skill?.title || "Unknown Skill"}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge>{booking.booking_status}</Badge>
                          <span className="text-xs text-gray-500">
                            {booking.requester?.username} →{" "}
                            {booking.skill?.user?.username}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          handleDeleteBooking(booking.documentId || booking.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "reviews" && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No reviews found.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id || review.documentId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            by {review.reviewer?.username || "Unknown"}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-1">
                            {review.comment}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          handleDeleteReview(review.documentId || review.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "dashboard" && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                Quick view of all platform activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Recent Users</h3>
                  <div className="space-y-2">
                    {users.slice(0, 5).map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span>{u.username}</span>
                          {u.account_status === "Suspended" && (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-300 text-xs"
                            >
                              Suspended
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Recent Skills</h3>
                  <div className="space-y-2">
                    {skills.slice(0, 5).map((s) => (
                      <div
                        key={s.id || s.documentId}
                        className="flex items-center justify-between"
                      >
                        <span>{s.title}</span>
                        <Badge variant="secondary">{s.category}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
