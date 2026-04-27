const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Event = require('../models/Event');
const Message = require('../models/Message');
const Setting = require('../models/Setting');

// Load env vars
dotenv.config();

const seedSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Check if data already exists
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const messageCount = await Message.countDocuments();

    if (userCount > 1 || eventCount > 0 || messageCount > 0) {
      console.log('ℹ️  Sample data already exists. Skipping seed.');
      console.log(`   Users: ${userCount}, Events: ${eventCount}, Messages: ${messageCount}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('📦 Creating sample data...');

    // Get admin user for event creation
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Admin user not found. Please run "npm run seed:admin" first.');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Create sample users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        status: 'active',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        status: 'active',
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user',
        status: 'active',
      },
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'password123',
        role: 'user',
        status: 'blocked',
      },
    ]);
    console.log(`✅ Created ${users.length} sample users`);

    // Create sample events
    const events = await Event.create([
      {
        title: 'Tech Conference 2026',
        description: 'Annual technology conference featuring the latest innovations in AI and cloud computing.',
        location: 'Colombo Convention Center',
        date: new Date('2026-06-15'),
        endDate: new Date('2026-06-17'),
        autoDeleteDate: new Date('2026-07-01'),
        time: '09:00 AM',
        category: 'Education',
        status: 'approved',
        createdBy: admin._id,
      },
      {
        title: 'Music Festival - Summer Vibes',
        description: 'Three-day music festival featuring local and international artists.',
        location: 'Galle Face Green, Colombo',
        date: new Date('2026-07-20'),
        endDate: new Date('2026-07-22'),
        autoDeleteDate: new Date('2026-08-05'),
        time: '06:00 PM',
        category: 'Entertainment',
        status: 'approved',
        createdBy: admin._id,
      },
      {
        title: 'Art Exhibition - Modern Perspectives',
        description: 'Contemporary art exhibition showcasing works from emerging Sri Lankan artists.',
        location: 'National Art Gallery, Colombo',
        date: new Date('2026-05-10'),
        endDate: new Date('2026-05-25'),
        autoDeleteDate: new Date('2026-06-10'),
        time: '10:00 AM',
        category: 'Exhibition',
        status: 'pending',
        createdBy: admin._id,
      },
      {
        title: 'Job Fair 2026',
        description: 'Connect with top employers and explore career opportunities across various industries.',
        location: 'BMICH, Colombo',
        date: new Date('2026-08-05'),
        endDate: new Date('2026-08-06'),
        autoDeleteDate: new Date('2026-08-20'),
        time: '09:00 AM',
        category: 'Jobs',
        status: 'approved',
        createdBy: admin._id,
      },
      {
        title: 'Food Festival - Taste of Sri Lanka',
        description: 'Culinary celebration featuring traditional and fusion Sri Lankan cuisine.',
        location: 'Viharamahadevi Park, Colombo',
        date: new Date('2026-09-12'),
        endDate: new Date('2026-09-14'),
        autoDeleteDate: new Date('2026-09-30'),
        time: '11:00 AM',
        category: 'Festivals',
        status: 'rejected',
        createdBy: admin._id,
      },
    ]);
    console.log(`✅ Created ${events.length} sample events`);

    // Create sample messages
    const messages = await Message.create([
      {
        fullName: 'Sarah Williams',
        email: 'sarah@example.com',
        subject: 'Event Submission Question',
        message: 'Hi, I would like to know the process for submitting a community event. What are the requirements?',
        isRead: false,
      },
      {
        fullName: 'Michael Brown',
        email: 'michael@example.com',
        subject: 'Partnership Inquiry',
        message: 'We are interested in partnering with your platform for our upcoming festival. Please contact us.',
        isRead: false,
      },
      {
        fullName: 'Emily Davis',
        email: 'emily@example.com',
        subject: 'Technical Issue',
        message: 'I am unable to upload images for my event. The upload button is not working properly.',
        isRead: true,
      },
      {
        fullName: 'David Martinez',
        email: 'david@example.com',
        subject: 'Feedback',
        message: 'Great platform! The event discovery feature is very useful. Keep up the good work!',
        isRead: true,
      },
    ]);
    console.log(`✅ Created ${messages.length} sample messages`);

    // Create default settings if not exists
    const existingSettings = await Setting.findOne();
    if (!existingSettings) {
      await Setting.create({
        brandName: 'Golden Curator',
        primaryColor: '#FFE500',
      });
      console.log('✅ Created default settings');
    }

    console.log('');
    console.log('🎉 Sample data seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length + 1} (including admin)`);
    console.log(`   Events: ${events.length}`);
    console.log(`   Messages: ${messages.length}`);
    console.log('');
    console.log('You can now start the server and explore the dashboard.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedSampleData();
