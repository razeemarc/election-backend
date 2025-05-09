// import { Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// import { AuthenticatedRequest } from '../middleware/auth';

// const prisma = new PrismaClient();

// export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     // Get user from database
//     const user = await prisma.member.findUnique({
//       where: { id: req.user?.id },
//     });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Return user data without password
//     const { password, ...userWithoutPassword } = user;

//     return res.status(200).json({ user: userWithoutPassword });
//   } catch (error) {
//     console.error('Profile error:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   } finally {
//     await prisma.$disconnect();
//   }
// };