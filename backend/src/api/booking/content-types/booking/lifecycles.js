"use strict";

// Helper to send email without blocking the response
const sendEmailNonBlocking = (emailConfig) => {
  // Fire and forget - don't await
  strapi.plugins["email"].services.email
    .send(emailConfig)
    .then(() => {
      console.log("📧 Email sent to:", emailConfig.to);
    })
    .catch((err) => {
      console.error("❌ Email error:", err.message);
    });
};

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    try {
      // Get booking with related data
      const booking = await strapi.entityService.findOne(
        "api::booking.booking",
        result.id,
        { populate: ["requester", "skill", "skill.user"] },
      );

      console.log("📧 Lifecycle triggered - afterCreate");
      console.log("  - Skill:", booking.skill?.title);

      if (booking.skill?.user?.email) {
        // Send email without blocking
        sendEmailNonBlocking({
          to: booking.skill.user.email,
          subject: `New Request: ${booking.skill.title}`,
          html: `
            <h2>New Skill Request!</h2>
            <p>${booking.requester?.username || "Someone"} wants to learn <strong>${booking.skill.title}</strong></p>
            <p><strong>Message:</strong> ${booking.message || "No message"}</p>
            <a href="http://localhost:3000/dashboard">View Dashboard</a>
          `,
        });
        console.log("📧 Email queued for:", booking.skill.user.email);
      }
    } catch (err) {
      console.error("❌ Error in afterCreate:", err.message);
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    // Only send emails for status changes
    if (!result.booking_status) return;

    try {
      const booking = await strapi.entityService.findOne(
        "api::booking.booking",
        result.id,
        { populate: ["requester", "skill", "skill.user"] },
      );

      console.log("📧 Lifecycle triggered - afterUpdate");
      console.log("  - Status:", result.booking_status);

      // Email for accepted - non-blocking
      if (result.booking_status === "Accepted" && booking.requester?.email) {
        sendEmailNonBlocking({
          to: booking.requester.email,
          subject: `Request Accepted: ${booking.skill?.title}`,
          html: `
            <h2>Request Accepted! 🎉</h2>
            <p>${booking.skill?.user?.username || "The owner"} accepted your request for ${booking.skill?.title}</p>
            <a href="http://localhost:3000/dashboard">View Dashboard</a>
          `,
        });
        console.log("📧 Accepted email queued for:", booking.requester.email);
      }

      // Email for completed - non-blocking
      if (result.booking_status === "Completed" && booking.requester?.email) {
        sendEmailNonBlocking({
          to: booking.requester.email,
          subject: `Exchange Completed: ${booking.skill?.title}`,
          html: `
            <h2>Exchange Completed! ⭐</h2>
            <p>Please rate your experience with ${booking.skill?.user?.username}</p>
            <a href="http://localhost:3000/dashboard">Rate Now</a>
          `,
        });
        console.log("📧 Completed email queued for:", booking.requester.email);
      }
    } catch (err) {
      console.error("❌ Error in afterUpdate:", err.message);
    }
  },
};
