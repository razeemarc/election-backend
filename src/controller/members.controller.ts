import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const members = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        candidacies: {
          select: {
            isBlocked: true,
            electionId: true
          }
        }
      }
    });

    // Flatten response if needed (e.g., only get one candidacy per member)
    const formatted = members.map(member => ({
      name: member.name,
      email: member.email,
      role: member.role,
      candidacies: member.candidacies.map(c => ({
        isBlocked: c.isBlocked,
        electionId: c.electionId
      }))
    }));

    res.status(200).json({ members: formatted });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};
