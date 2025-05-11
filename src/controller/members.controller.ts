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
        isBlocked: true,
        candidacies: {
          select: {
            
            electionId: true
          }
        }
      }
    });

    // Flatten response if needed (e.g., only get one candidacy per member)
    const formatted = members.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      isBlocked: member.isBlocked,
      candidacies: member.candidacies.map(c => ({
        
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

export const blockOrUnblockCandidate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { memberId } = req.params;
  const { block } = req.body;

  if (typeof block !== 'boolean') {
    res.status(400).json({ error: "'block' must be true or false" });
    return;
  }

  try {
    const updated = await prisma.member.updateMany({
      where: { id: memberId },
      data: { isBlocked: block },
    });

    if (updated.count === 0) {
      res.status(404).json({ message: 'No user found for this Id' });
    } else {
      res.status(200).json({
        message: block ? 'User(s) blocked' : 'user(s) unblocked',
        updatedCount: updated.count,
      });
    }
  } catch (error) {
    console.error('Error updating user block status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

