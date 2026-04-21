/**
 * Seed script — creates sample data for development/testing
 * Usage: node backend/scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')
const Task = require('../src/models/Task')

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  // Clear existing data
  await User.deleteMany({})
  await Task.deleteMany({})
  console.log('Cleared existing data')

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@primetrade.com',
    password: 'Admin@123',
    role: 'admin',
  })

  // Create regular users
  const user1 = await User.create({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Alice@123',
    role: 'user',
  })

  const user2 = await User.create({
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'Bob@1234',
    role: 'user',
  })

  console.log('Created users:', admin.email, user1.email, user2.email)

  // Create tasks
  const tasks = [
    { title: 'Set up project structure', description: 'Initialize repo, set up folder structure and linting', status: 'completed', priority: 'high', createdBy: admin._id, tags: ['setup', 'backend'] },
    { title: 'Design database schema', description: 'Create User and Task schemas with proper indexes', status: 'completed', priority: 'high', createdBy: admin._id, tags: ['database'] },
    { title: 'Implement JWT authentication', description: 'Login, register, refresh token, logout endpoints', status: 'completed', priority: 'urgent', createdBy: admin._id },
    { title: 'Add role-based access control', status: 'in_progress', priority: 'high', createdBy: admin._id, tags: ['security'] },
    { title: 'Write API documentation', status: 'todo', priority: 'medium', createdBy: admin._id, tags: ['docs'] },
    { title: 'Set up React frontend', status: 'completed', priority: 'medium', createdBy: user1._id, tags: ['frontend'] },
    { title: 'Implement task CRUD', status: 'in_progress', priority: 'high', createdBy: user1._id },
    { title: 'Add pagination and filters', status: 'todo', priority: 'medium', createdBy: user1._id },
    { title: 'Deploy to Vercel', status: 'todo', priority: 'high', createdBy: user2._id, tags: ['devops'] },
    { title: 'Add unit tests', status: 'todo', priority: 'low', createdBy: user2._id, tags: ['testing'] },
  ]

  await Task.insertMany(tasks)
  console.log(`Created ${tasks.length} tasks`)

  console.log('\n✅ Seed complete!')
  console.log('\nTest credentials:')
  console.log('  Admin: admin@primetrade.com / Admin@123')
  console.log('  User:  alice@example.com   / Alice@123')
  console.log('  User:  bob@example.com     / Bob@1234')

  await mongoose.disconnect()
}

seed().catch((err) => { console.error(err); process.exit(1) })
