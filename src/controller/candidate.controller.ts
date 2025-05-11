import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitCandidateForm = async (req: Request, res: Response): Promise<void> => {
    const { userName, electionId, proposedElectionDate } = req.body;
  
    try {
      // 1. Get the user
      const user = await prisma.member.findFirst({
        where: { name: userName }
      });
  
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      // 2. Verify election exists
      const election = await prisma.election.findUnique({
        where: { id: electionId }
      });
  
      if (!election) {
        res.status(404).json({ message: 'Election not found' });
        return;
      }
  
      // 3. Check if already applied
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
  
      // 4. Create new candidate
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


  export const getCurrentElections = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentDate = new Date();
      
      const currentElections = await prisma.election.findMany({
        where: {
          startTime: {
            lte: currentDate, // Election has started
          },
          endTime: {
            gte: currentDate, // Election hasn't ended
          },
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          candidates: {
            include: {
              member: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });
  
      res.status(200).json({
        success: true,
        data: currentElections,
        message: 'Current elections retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching current elections:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  export const getUpcomingElections = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentDate = new Date();
      
      const upcomingElections = await prisma.election.findMany({
        where: {
          startTime: {
            gt: currentDate, // Only elections that haven't started yet
          },
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          candidates: {
            include: {
              member: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          startTime: 'asc', // Order by nearest first
        },
      });
  
      res.status(200).json({
        success: true,
        data: upcomingElections,
        message: 'Upcoming elections retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching upcoming elections:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  export const getPendingCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
      const pendingCandidates = await prisma.candidate.findMany({
        where: {
          status: 'PENDING'
        },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          election: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true
            }
          }
        },
        orderBy: {
          appliedAt: 'desc' // Sort by most recently applied first
        }
      });
  
      res.status(200).json({
        success: true,
        data: pendingCandidates,
        message: 'Pending candidates retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching pending candidates:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
  export const approveCandidate = async (req: Request, res: Response): Promise<void> => {
    const { memberId, electionId } = req.params;
    const { status } = req.body;
  
    try {
      // Validate status
      if (status !== 'APPROVED' && status !== 'REJECTED') {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }
  
      // Check if candidate exists
      const existingCandidate = await prisma.candidate.findUnique({
        where: {
          memberId_electionId: {
            memberId,
            electionId
          }
        }
      });
  
      if (!existingCandidate) {
        res.status(404).json({ success: false, message: 'Candidate not found' });
        return;
      }
  
      // Update candidate status
      const updatedCandidate = await prisma.candidate.update({
        where: {
          memberId_electionId: {
            memberId,
            electionId
          }
        },
        data: {
          status: status
        },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          election: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
  
      res.status(200).json({
        success: true,
        data: updatedCandidate,
        message: `Candidate ${status.toLowerCase()} successfully`
      });
  
    } catch (error) {
      console.error('Error updating candidate status:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
  export const rejectCandidate = async (req: Request, res: Response): Promise<void> => {
    const { memberId, electionId } = req.params;
  
    try {
      // Check if candidate exists
      const existingCandidate = await prisma.candidate.findUnique({
        where: {
          memberId_electionId: {
            memberId,
            electionId
          }
        }
      });
  
      if (!existingCandidate) {
        res.status(404).json({ success: false, message: 'Candidate not found' });
        return;
      }
  
      // Delete the candidate record for rejection
      await prisma.candidate.delete({
        where: {
          memberId_electionId: {
            memberId,
            electionId
          }
        }
      });
  
      res.status(200).json({
        success: true,
        message: 'Candidate rejected and removed successfully'
      });
  
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  