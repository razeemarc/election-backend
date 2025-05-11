import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get total number of elections
    const totalElections = await prisma.election.count();

    // Get total number of users
    const totalUsers = await prisma.member.count();

    // Get active elections (current date between start and end date)
    const today = new Date();
    const activeElections = await prisma.election.count({
      where: {
        startTime: {
          lte: today,
        },
        endTime: {
          gte: today,
        },
      },
    });

    // Get pending candidate requests
    const pendingRequests = await prisma.candidate.count({
      where: {
        status: 'PENDING',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalElections,
        totalUsers,
        activeElections,
        pendingRequests,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: (error as Error).message,
    });
  }
};

export const getMonthlyElectionCounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentYear = new Date().getFullYear();
      
      // Create an array for all months with initial count of 0
      const monthsData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        name: new Date(0, i).toLocaleString('default', { month: 'short' }),
        count: 0
      }));
  
      // Get elections created in the current year
      const startOfYear = new Date(currentYear, 0, 1); // January 1st of current year
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st of current year
  
      const elections = await prisma.election.findMany({
        where: {
          createdAt: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        select: {
          createdAt: true
        }
      });
  
      // Count elections by month
      elections.forEach(election => {
        const month = election.createdAt.getMonth(); // 0-indexed (0 = January)
        monthsData[month].count++;
      });
  
      res.status(200).json({
        success: true,
        data: {
          year: currentYear,
          months: monthsData
        }
      });
    } catch (error) {
      console.error('Error fetching monthly election counts:', error);
      res.status(500).json({
        success: false, 
        message: 'Failed to fetch monthly election statistics',
        error: (error as Error).message
      });
    }
  };