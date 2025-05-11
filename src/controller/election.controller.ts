import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating an election
const createElectionSchema = z.object({
  memberId: z.string().uuid(),
  title: z.string().min(1, 'Election title is required'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format. Use HH:MM'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format. Use HH:MM'),
  memberIds: z.array(z.string().uuid())
    .max(5, 'No more than 5 members allowed')
    .optional(),
});

export const createElection = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = createElectionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors
      });
    }

    const { memberId, title, description, startDate, startTime, endDate, endTime, memberIds } = validationResult.data;

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Validate memberIds if provided
    if (memberIds && memberIds.length > 0) {
      // Check if all members exist
      const members = await prisma.member.findMany({
        where: {
          id: {
            in: memberIds
          }
        }
      });

      if (members.length !== memberIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more members in the list do not exist'
        });
      }
    }

    // Parse dates and times
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Create the election
    const election = await prisma.election.create({
      data: {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        createdBy: memberId
      }
    });

    // If memberIds are provided, create candidate entries for these members
    if (memberIds && memberIds.length > 0) {
      // Create candidate entries for each member
      const candidatePromises = memberIds.map(id => 
        prisma.candidate.create({
          data: {
            memberId: id,
            electionId: election.id,
            proposedElectionDate: new Date() // Adding the required field
          }
        })
      );
      
      await Promise.all(candidatePromises);
      
      // Fetch the updated election with candidates
      const updatedElection = await prisma.election.findUnique({
        where: { id: election.id },
        include: {
          admin: true,
          candidates: {
            include: {
              member: true
            }
          }
        }
      });
      
      return res.status(201).json({
        success: true,
        message: 'Election created successfully',
        data: updatedElection
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Election created successfully',
      data: election
    });

  } catch (error) {
    console.error('Error creating election:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the election'
    });
  }
};

export const getAllElections = async (req: Request, res: Response) => {
  try {
    const elections = await prisma.election.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        candidates: true,
        votes: true
      }
    });

    res.status(200).json(elections);
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateElection = async (req: Request, res: Response) => {
  const { id } = req.params
  const { title, description, startTime, endTime } = req.body

  try {
    // Check if election exists
    const existingElection = await prisma.election.findUnique({
      where: { id }
    })

    if (!existingElection) {
      return res.status(404).json({ error: 'Election not found' })
    }

    const updatedElection = await prisma.election.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined
      }
    })

    res.status(200).json(updatedElection)
  } catch (error) {
    console.error('Error updating election:', error)
    res.status(500).json({ error: 'Failed to update election' })
  }
}

export const deleteElection = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Check if election exists
    const existingElection = await prisma.election.findUnique({
      where: { id }
    })

    if (!existingElection) {
      return res.status(404).json({ error: 'Election not found' })
    }

    // Use transaction to delete related records first
    await prisma.$transaction([
      prisma.vote.deleteMany({
        where: { electionId: id }
      }),
      prisma.candidate.deleteMany({
        where: { electionId: id }
      }),
      prisma.election.delete({
        where: { id }
      })
    ])

    res.status(200).json({ message: 'Election deleted successfully' })
  } catch (error) {
    console.error('Error deleting election:', error)
    res.status(500).json({ error: 'Failed to delete election' })
  }
}