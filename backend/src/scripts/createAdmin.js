
import dotenv from 'dotenv';
import readline from 'readline';
import mongoose from 'mongoose';

import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const ask = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

// Read password without displaying the characters
const askHiddenPassword = (question) => {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error('Please run this script directly in your terminal.'));
      return;
    }

    const input = process.stdin;
    let password = '';

    process.stdout.write(question);
    input.setRawMode(true);
    input.resume();
    input.setEncoding('utf8');

    const handleInput = (character) => {
      if (character === '\u0003') {
        input.setRawMode(false);
        input.pause();
        input.removeListener('data', handleInput);
        reject(new Error('Setup cancelled.'));
        return;
      }

      if (character === '\r' || character === '\n') {
        input.setRawMode(false);
        input.pause();
        input.removeListener('data', handleInput);
        process.stdout.write('\n');
        resolve(password);
        return;
      }

      if (character === '\u007f' || character === '\b') {
        password = password.slice(0, -1);
        return;
      }

      if (character >= ' ') {
        password += character;
      }
    };

    input.on('data', handleInput);
  });
};

const createAdmin = async () => {
  try {
    console.log('\n===== MTAAFIX ADMIN ACCOUNT SETUP =====\n');

    const name = await ask('Admin full name: ');
    const email = (await ask('Admin email: ')).toLowerCase();

    if (!name || !email || !email.includes('@')) {
      throw new Error('Please enter a valid name and email address.');
    }

    const password = await askHiddenPassword('Admin password: ');
    const confirmPassword = await askHiddenPassword('Confirm password: ');

    if (password.length < 12) {
      throw new Error('Admin password must contain at least 12 characters.');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        'This email already has an account. No account was changed.'
      );
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      status: 'active',
    });

    console.log('\nAdmin account created successfully!');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
  } catch (error) {
    console.error('\nAdmin setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

createAdmin();
