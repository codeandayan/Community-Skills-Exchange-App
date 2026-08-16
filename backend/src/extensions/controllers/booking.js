module.exports = {
  async afterCreate(event) {
    const { result } = event;

    try {
      const booking = await strapi.entityService.findOne(
        "api::booking.booking",
        result.id,
        { populate: ["requester", "skill", "skill.user"] },
      );
      console.log(
        "Booking data:",
        JSON.stringify(
          {
            to: booking.skill?.user?.email,
            skillOwner: booking.skill?.user?.username,
            requester: booking.requester?.username,
            skillTitle: booking.skill?.title,
          },
          null,
          2,
        ),
      );

      // Send email to skill owner about new request
      if (booking.requester && booking.skill?.user?.email) {
        await strapi.plugins["email"].services.email.send({
          to: booking.skill.user.email,
          subject: `🔔 New Skill Request: ${booking.skill.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
              <h2 style="color: #2563eb;">New Skill Exchange Request!</h2>
              <p>Hi <strong>${booking.skill.user.username}</strong>,</p>
              <p><strong>${booking.requester.username}</strong> wants to learn <strong>${booking.skill.title}</strong> from you!</p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Message:</strong> ${booking.message || "No message provided"}</p>
                <p><strong>Date:</strong> ${booking.scheduled_date ? new Date(booking.scheduled_date).toLocaleDateString() : "Not specified"}</p>
              </div>
              
              <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Request</a>
            </div>
          `,
        });
        console.log("📧 New request email sent to:", booking.skill.user.email);
      }
    } catch (err) {
      console.error("Email error (afterCreate):", err.message);
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    try {
      const booking = await strapi.entityService.findOne(
        "api::booking.booking",
        result.id,
        { populate: ["requester", "skill", "skill.user"] },
      );

      // Email when request is accepted
      if (result.booking_status === "Accepted" && booking.requester?.email) {
        await strapi.plugins["email"].services.email.send({
          to: booking.requester.email,
          subject: `✅ Request Accepted: ${booking.skill?.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
              <h2 style="color: #16a34a;">Your Request Was Accepted! 🎉</h2>
              <p>Hi <strong>${booking.requester.username}</strong>,</p>
              <p><strong>${booking.skill?.user?.username}</strong> has accepted your request for <strong>${booking.skill?.title}</strong>!</p>
              <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
            </div>
          `,
        });
        console.log("📧 Accepted email sent to:", booking.requester.email);
      }

      // Email when request is completed
      if (result.booking_status === "Completed" && booking.requester?.email) {
        await strapi.plugins["email"].services.email.send({
          to: booking.requester.email,
          subject: `⭐ Exchange Completed: ${booking.skill?.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
              <h2 style="color: #7c3aed;">Exchange Completed! ⭐</h2>
              <p>Hi <strong>${booking.requester.username}</strong>,</p>
              <p>Your exchange with <strong>${booking.skill?.user?.username}</strong> for <strong>${booking.skill?.title}</strong> is complete!</p>
              <p>Please rate your experience on the platform.</p>
              <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Rate Experience</a>
            </div>
          `,
        });
        console.log("📧 Completed email sent to:", booking.requester.email);
      }
    } catch (err) {
      console.error("Email error (afterUpdate):", err.message);
    }
  },
};
