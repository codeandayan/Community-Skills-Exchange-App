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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  BookOpen,
  Clock,
  Mail,
  Settings,
  LogOut,
  Check,
  X,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { skillsAPI, bookingsAPI } from "@/lib/api";
import { reviewsAPI } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("offered");
  const [skills, setSkills] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    bookingId: null,
    skillId: null,
    rating: 5,
    comment: "",
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Refresh user data on mount to get latest avatar
  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, []);

  // Fetch user's skills and bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user) {
          const [skillsRes, bookingsRes] = await Promise.all([
            skillsAPI.getMySkills(user.id),
            bookingsAPI.getIncomingBookings(user.id),
          ]);
          setSkills(skillsRes?.data || []);
          setIncomingBookings(bookingsRes?.data || []);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter skills by type
  const offeredSkills = skills.filter((s) => s.skill_type === "Offering");
  const requestedSkills = skills.filter((s) => s.skill_type === "Requesting");

  // Count pending bookings
  const pendingBookings = incomingBookings.filter(
    (b) => b.booking_status === "Pending",
  );

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleBookingAction = async (bookingId, status, booking) => {
    setActionLoading(bookingId);
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      const bookingsRes = await bookingsAPI.getIncomingBookings(user.id);
      setIncomingBookings(bookingsRes?.data || []);
    } catch (err) {
      console.error("Failed to update booking:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitReview = async () => {
    setReviewError("");
    setReviewSubmitting(true);

    try {
      await reviewsAPI.create({
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        reviewer: user.id,
        skill: reviewForm.skillId,
      });

      setShowReviewModal(false);
      setReviewForm({ bookingId: null, skillId: null, rating: 5, comment: "" });

      const bookingsRes = await bookingsAPI.getIncomingBookings(user.id);
      setIncomingBookings(bookingsRes?.data || []);
    } catch (err) {
      console.error("Failed to submit review:", err);
      setReviewError(
        err.response?.data?.error?.message ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = String(name).split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar?.url) return null;
    const url = avatar.url;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `http://localhost:1337${url}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-300"
          >
            Pending
          </Badge>
        );
      case "Accepted":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-300"
          >
            Accepted
          </Badge>
        );
      case "Completed":
        return <Badge variant="default">Completed</Badge>;
      case "Cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-300"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar with fallback */}
              <div className="h-16 w-16 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0">
                {getAvatarUrl(user?.avatar) ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user?.username || "User"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`text-white text-xl font-medium ${
                    getAvatarUrl(user?.avatar) ? "hidden" : "flex"
                  }`}
                >
                  {user ? getInitials(user.username) : "?"}
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  {user?.username || "User"}
                </h1>
                <p className="text-gray-600">{user?.email || ""}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {offeredSkills.length} skills offered •{" "}
                  {requestedSkills.length} requested • {pendingBookings.length}{" "}
                  pending requests
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/edit-profile")}
            >
              <Settings className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button
                    variant={activeTab === "offered" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("offered")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" /> Offered Skills (
                    {offeredSkills.length})
                  </Button>
                  <Button
                    variant={activeTab === "requested" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("requested")}
                  >
                    <Clock className="h-4 w-4 mr-2" /> Requested Skills (
                    {requestedSkills.length})
                  </Button>
                  <Button
                    variant={activeTab === "bookings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("bookings")}
                  >
                    <Mail className="h-4 w-4 mr-2" /> Bookings (
                    {incomingBookings.length})
                    {pendingBookings.length > 0 && (
                      <Badge variant="default" className="ml-auto">
                        {pendingBookings.length} new
                      </Badge>
                    )}
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Button onClick={() => router.push("/create-skill")}>
              <Plus className="h-4 w-4 mr-2" /> List a New Skill
            </Button>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : activeTab === "bookings" ? (
              /* BOOKINGS TAB */
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Incoming Requests</h2>
                {incomingBookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No booking requests yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  incomingBookings.map((booking) => (
                    <Card
                      key={booking.id || booking.documentId}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">
                                {booking.skill?.title || "Unknown Skill"}
                              </CardTitle>
                              {getStatusBadge(booking.booking_status)}
                            </div>
                            <CardDescription>
                              <div className="flex items-center gap-2 mt-1">
                                {/* Requester avatar */}
                                <div className="h-6 w-6 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center flex-shrink-0">
                                  {getAvatarUrl(booking.requester?.avatar) ? (
                                    <img
                                      src={getAvatarUrl(
                                        booking.requester.avatar,
                                      )}
                                      alt={booking.requester?.username}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display =
                                          "flex";
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`text-white text-xs font-medium ${
                                      getAvatarUrl(booking.requester?.avatar)
                                        ? "hidden"
                                        : "flex"
                                    }`}
                                  >
                                    {booking.requester?.username
                                      ? getInitials(booking.requester.username)
                                      : "?"}
                                  </div>
                                </div>
                                <span>
                                  From:{" "}
                                  <strong>
                                    {booking.requester?.username || "Unknown"}
                                  </strong>
                                </span>
                              </div>
                              {booking.scheduled_date && (
                                <p className="text-xs mt-1">
                                  📅{" "}
                                  {new Date(
                                    booking.scheduled_date,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {booking.message && (
                          <div className="bg-gray-50 p-3 rounded-md mb-3">
                            <p className="text-sm text-gray-700">
                              {booking.message}
                            </p>
                          </div>
                        )}

                        {booking.booking_status === "Pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={actionLoading === booking.documentId}
                              onClick={() =>
                                handleBookingAction(
                                  booking.documentId,
                                  "Accepted",
                                  booking,
                                )
                              }
                            >
                              {actionLoading === booking.documentId ? (
                                "Processing..."
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-1" /> Accept
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() =>
                                handleBookingAction(
                                  booking.documentId,
                                  "Cancelled",
                                )
                              }
                            >
                              <X className="h-4 w-4 mr-1" /> Decline
                            </Button>
                          </div>
                        )}

                        {booking.booking_status === "Accepted" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={async () => {
                                await handleBookingAction(
                                  booking.documentId,
                                  "Completed",
                                  booking,
                                );
                                setReviewForm({
                                  bookingId: booking.documentId,
                                  skillId:
                                    booking.skill?.documentId ||
                                    booking.skill?.id,
                                  rating: 5,
                                  comment: "",
                                });
                                setReviewError("");
                                setShowReviewModal(true);
                              }}
                            >
                              <Star className="h-4 w-4 mr-1" /> Mark as
                              Completed & Review
                            </Button>
                          </div>
                        )}

                        {booking.booking_status === "Completed" && (
                          <p className="text-sm text-gray-500 italic">
                            ✅ This exchange has been completed.
                          </p>
                        )}

                        {booking.booking_status === "Cancelled" && (
                          <p className="text-sm text-red-500 italic">
                            ❌ This request was declined.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : activeTab === "offered" ? (
              /* OFFERED SKILLS TAB */
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Skills You Offer</h2>
                {offeredSkills.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">
                        You haven&apos;t listed any skills yet.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push("/create-skill")}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Your First Skill
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  offeredSkills.map((skill) => (
                    <Card
                      key={skill.id || skill.documentId}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        router.push(`/skills/${skill.documentId || skill.id}`)
                      }
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{skill.title || "Untitled"}</CardTitle>
                            <CardDescription>
                              <Badge variant="secondary" className="mt-1">
                                {skill.category || "Other"}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              /* REQUESTED SKILLS TAB */
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Skills You Need</h2>
                {requestedSkills.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">
                        You haven&apos;t requested any skills yet.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push("/create-skill")}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Request a Skill
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  requestedSkills.map((skill) => (
                    <Card
                      key={skill.id || skill.documentId}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        router.push(`/skills/${skill.documentId || skill.id}`)
                      }
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{skill.title || "Untitled"}</CardTitle>
                            <CardDescription>
                              <Badge variant="secondary" className="mt-1">
                                {skill.category || "Other"}
                              </Badge>
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Rate Your Exchange
              </CardTitle>
              <CardDescription>
                How was your experience with this skill exchange?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {reviewError}
                  </div>
                )}

                <div>
                  <Label>Your Rating</Label>
                  <div className="flex gap-1 mt-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewForm({ ...reviewForm, rating: star })
                        }
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 transition-colors ${
                            star <= reviewForm.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 hover:text-yellow-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-1">
                    {reviewForm.rating === 1 && "Poor"}
                    {reviewForm.rating === 2 && "Fair"}
                    {reviewForm.rating === 3 && "Good"}
                    {reviewForm.rating === 4 && "Very Good"}
                    {reviewForm.rating === 5 && "Excellent!"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="review-comment">Your Review (Optional)</Label>
                  <Textarea
                    id="review-comment"
                    placeholder="Share your experience with this skill exchange..."
                    rows={3}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewError("");
                    }}
                  >
                    Skip
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting}
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
