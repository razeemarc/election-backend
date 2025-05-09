import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

// Helper function for email format validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check for missing fields
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required.' });
      return;
    }

    // Check if types are correct
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ message: 'Invalid data types provided.' });
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      res.status(400).json({ message: 'Invalid email format.' });
      return;
    }

    // Enforce password strength (minimum 6 chars)
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.member.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.member.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error('Signup error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma-specific errors
      if (error.code === 'P2002') {
        res.status(409).json({ message: 'Email already in use.' });
      } else {
        res.status(400).json({ message: `Database error: ${error.message}` });
      }
    } else {
      // Unknown server error
      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  } finally {
    await prisma.$disconnect();
  }
};
