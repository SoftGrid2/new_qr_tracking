import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin already exists with this email:', email);
      process.exit(0);
    }

    const admin = await Admin.create({
      email,
      password,
      name,
    });

    console.log('Admin created successfully:');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
