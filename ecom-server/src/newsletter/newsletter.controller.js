const Newsletter = require('./newsletter.model');

// Subscribe to newsletter
const subscribe = async (req, res) => {
  try {
    const { email, source = 'homepage' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        existingSubscription.unsubscribedAt = null;
        existingSubscription.source = source;
        await existingSubscription.save();

        return res.status(200).json({
          success: true,
          message: 'Newsletter subscription reactivated successfully!'
        });
      }
    }

    // Create new subscription
    const subscription = new Newsletter({
      email,
      source
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!',
      data: subscription
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Email already subscribed'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || "Some error occurred while subscribing to newsletter."
      });
    }
  }
};

// Get all subscribers (admin only)
const getAllSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const subscribers = await Newsletter.find(filter)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Newsletter.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: subscribers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Unsubscribe from newsletter
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscription = await Newsletter.findOne({ email });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscription list'
      });
    }

    if (!subscription.isActive) {
      return res.status(200).json({
        success: true,
        message: 'You are already unsubscribed'
      });
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get subscription stats (admin only)
const getSubscriptionStats = async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({ isActive: true });
    const totalUnsubscribed = await Newsletter.countDocuments({ isActive: false });
    const totalAll = await Newsletter.countDocuments();

    // Get subscriptions by month for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await Newsletter.aggregate([
      {
        $match: {
          subscribedAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$subscribedAt" },
            month: { $month: "$subscribedAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        totalUnsubscribed,
        totalAll,
        monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  subscribe,
  getAllSubscribers,
  unsubscribe,
  getSubscriptionStats
};
