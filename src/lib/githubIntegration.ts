// lib/githubIntegration.ts - GitHub activity tracking and gamification
import { Octokit } from 'octokit';
import { activityTracker } from './activityTracker';

export interface GitHubStats {
  totalCommits: number;
  totalRepositories: number;
  contributionData: {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
  }[];
  languages: { [language: string]: number };
  streakData: {
    current: number;
    longest: number;
  };
}

export class GitHubIntegration {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getUserStats(username: string): Promise<GitHubStats> {
    try {
      // Get user repositories
      const { data: repos } = await this.octokit.rest.repos.listForUser({
        username,
        per_page: 100,
      });

      // Get contribution data for the last year
      const contributionData = await this.getContributionData(username);

      // Calculate language statistics
      const languages: { [language: string]: number } = {};
      for (const repo of repos) {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      }

      // Calculate streak data
      const streakData = this.calculateStreaks(contributionData);

      return {
        totalCommits: contributionData.reduce((sum, day) => sum + day.count, 0),
        totalRepositories: repos.length,
        contributionData,
        languages,
        streakData,
      };
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      throw error;
    }
  }

  async trackRepositoryActivity(user: { _id: string } | null, repoOwner: string, repoName: string) {
    if (!user || !user._id) throw new Error('User must be authenticated to track repository activity.');
    
    try {
      // Get recent commits
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner: repoOwner,
        repo: repoName,
        per_page: 10,
      });

      // Log each commit as an activity
      for (const commit of commits) {
        await activityTracker.logActivity(user, {
          type: 'code_commit',
          description: `Committed: ${commit.commit.message}`,
          metadata: {
            githubCommitSha: commit.sha,
            repository: `${repoOwner}/${repoName}`,
            additions: commit.stats?.additions || 0,
            deletions: commit.stats?.deletions || 0,
          },
        });
      }

      return commits.length;
    } catch (error) {
      console.error('Error tracking repository activity:', error);
      return 0;
    }
  }

  private async getContributionData(username: string) {
    // This would typically use GitHub's GraphQL API for contribution data
    // For now, we'll simulate the data structure
    const contributionData = [];
    const today = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate contribution data
      const count = Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0;
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;
      
      contributionData.push({
        date: date.toISOString().split('T')[0],
        count,
        level: level as 0 | 1 | 2 | 3 | 4,
      });
    }
    
    return contributionData;
  }

  private calculateStreaks(contributionData: { date: string; count: number }[]) {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate from most recent backwards
    for (let i = contributionData.length - 1; i >= 0; i--) {
      if (contributionData[i].count > 0) {
        tempStreak++;
        if (i === contributionData.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (i === contributionData.length - 1) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return {
      current: currentStreak,
      longest: longestStreak,
    };
  }
}

export const createGitHubIntegration = (accessToken: string) => new GitHubIntegration(accessToken);
