import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitVote = async (req: Request, res: Response): Promise<void> => {
  const { electionId, candidateId, memberId } = req.body;

  try {
    // 1. Validate the election is currently active
    const currentDate = new Date();
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { candidates: true }
    });

    if (!election) {
      res.status(404).json({ success: false, message: 'Election not found' });
      return;
    }

    if (currentDate < election.startTime || currentDate > election.endTime) {
      res.status(400).json({ 
        success: false, 
        message: 'Voting is only allowed during the election period' 
      });
      return;
    }

    // 2. Validate the candidate belongs to this election
    const candidateValid = election.candidates.some(
      c => c.id === candidateId && c.electionId === electionId
    );

    if (!candidateValid) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid candidate for this election' 
      });
      return;
    }

    // 3. Check if member has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        memberId_electionId: {
          memberId,
          electionId
        }
      }
    });

    if (existingVote) {
      res.status(400).json({ 
        success: false, 
        message: 'You have already voted in this election' 
      });
      return;
    }

    // 4. Create the vote
    const vote = await prisma.vote.create({
      data: {
        memberId,
        electionId,
        candidateId
      },
      include: {
        candidate: {
          select: {
            member: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        electionId: vote.electionId,
        candidateName: vote.candidate.member.name,
        votedAt: vote.votedAt
      },
      message: 'Vote submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};