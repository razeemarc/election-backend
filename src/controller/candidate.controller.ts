import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitCandidateForm = async (req: Request, res: Response): Promise<void> => {
  const { userName, electionId, proposedElectionDate } = req.body;

  try {
    // Get the user
    const user = await prisma.member.findFirst({
      where: { name: userName }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already applied
    const alreadyApplied = await prisma.candidate.findUnique({
      where: {
        memberId_electionId: {
          memberId: user.id,
          electionId,
        }
      }
    });

    if (alreadyApplied) {
      res.status(400).json({ message: 'You have already applied for this election' });
      return;
    }

    // Create new candidate
    const candidate = await prisma.candidate.create({
      data: {
        memberId: user.id,
        electionId,
        proposedElectionDate: new Date(proposedElectionDate),
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Participation submitted successfully', candidate });
  } catch (error) {
    console.error('Error submitting candidate form:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};