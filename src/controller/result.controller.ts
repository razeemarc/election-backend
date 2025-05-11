import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllElectionResults = async (req: Request, res: Response) => {
  try {
    const elections = await prisma.election.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        candidates: {
          select: {
            id: true,
            member: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            status: true,
            _count: {
              select: {
                Vote: true
              }
            }
          },
          orderBy: {
            Vote: {
              _count: 'desc'
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to a more client-friendly format
    const formattedResults = elections.map(election => ({
      id: election.id,
      title: election.title,
      description: election.description,
      startTime: election.startTime,
      endTime: election.endTime,
      candidates: election.candidates.map(candidate => ({
        id: candidate.id,
        member: candidate.member,
        status: candidate.status,
        voteCount: candidate._count.Vote
      }))
    }));

    res.status(200).json({
      success: true,
      data: formattedResults
    });
  } catch (error) {
    console.error('Error fetching election results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election results'
    });
  } finally {
    await prisma.$disconnect();
  }
};