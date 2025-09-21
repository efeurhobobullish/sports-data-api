const axios = require("axios");

// Tournament configuration
const tournaments = [
  {
    name: "Champions League",
    id: 2,
    ourID: 1,
    type: "cup",
    expectedMatches: 8,
  },
  { name: "Europa League", id: 36, ourID: 2, type: "cup", expectedMatches: 8 },
  {
    name: "Premier League",
    id: 65,
    ourID: 3,
    type: "league",
    expectedMatches: 38,
  },
  { name: "Bundesliga", id: 78, ourID: 4, type: "league", expectedMatches: 34 },
  {
    name: "Brasileirão",
    id: 71,
    ourID: 5,
    type: "league",
    expectedMatches: 38,
  },
  { name: "La Liga", id: 75, ourID: 6, type: "league", expectedMatches: 38 },
  {
    name: "Serie A Tim",
    id: 135,
    ourID: 7,
    type: "league",
    expectedMatches: 38,
  },
  {
    name: "Championship",
    id: 4,
    ourID: 8,
    type: "league",
    expectedMatches: 46,
  },
];

// Statistics mapping
const statMapping = {
  Fls: "Fouls",
  Ths: "Throw-ins",
  Ofs: "Offsides",
  Crs: "Crosses",
  Ycs: "Yellow cards",
  Rcs: "Red cards",
  Pss: "Possession",
  Goa: "Goal kicks",
  Gks: "Goalkeeper saves",
  Shbl: "Shots blocked",
  Shof: "Shots off target",
  Shon: "Shots on target",
  Cos: "Corner kicks"
};

// Helper functions
function isLive(status) {
  return status.includes("'") || status === "HT";
}

function getEvents(teamData, teamId) {
  const result = [];
  teamData.Stages.forEach((stage) => {
    const tournament = {
      name: stage.Snm,
      colors: stage.firstColor || null,
      badge: stage.badgeUrl || null,
      competition: stage.CompN || stage.Snm,
    };

    stage.Events.forEach((event) => {
      const finishedStatuses = ["FT", "AET", "AP"];

      if (finishedStatuses.includes(event.Eps) || isLive(event.Eps)) {
        const eventData = {
          id: event.Eid,
          tournament: tournament.name,
          tournamentColors: {
            primary: tournament.colors,
            badge: tournament.badge,
          },
          day: convertTimestampToDate(event.Esd),
          homeTeam: event.T1[0].Nm,
          homeScore: parseInt(event.Tr1) || 0,
          awayTeam: event.T2[0].Nm,
          awayScore: parseInt(event.Tr2) || 0,
          status: event.Eps,
          matchResult: determineResult(event, teamId),
          isLive: isLive(event.Eps),
        };

        result.push(eventData);
      }
    });
  });
  return result;
}

function convertTimestampToDate(timestamp) {
  const timestampStr = timestamp.toString();
  return `${timestampStr.substring(0, 4)}-${timestampStr.substring(
    4,
    6
  )}-${timestampStr.substring(6, 8)}`;
}

function determineResult(event, teamId) {
  const homeScore = parseInt(event.Tr1) || 0;
  const awayScore = parseInt(event.Tr2) || 0;
  const isHomeTeam = event.T1[0].ID === teamId;

  if (homeScore === awayScore) return "draw";
  if (isHomeTeam) return homeScore > awayScore ? "win" : "loss";
  return awayScore > homeScore ? "win" : "loss";
}

function determineCompetitionStatus(teams, expectedMatches) {
  if (!teams || teams.length === 0) return "unknown";

  const totalGamesPlayed = teams.reduce(
    (sum, team) => sum + (team.pld || 0),
    0
  );

  if (totalGamesPlayed === 0) {
    return "not_started";
  }

  const teamsCompleted = teams.filter(
    (team) => team.pld >= expectedMatches
  ).length;
  const completionThreshold = teams.length * 0.8;

  if (teamsCompleted >= completionThreshold) {
    return "completed";
  }

  return "ongoing";
}

// Controllers
const sportsController = {
  // Get standings by tournament ID
  getStandings: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Id is required",
      });
    }

    const tournament = tournaments.find((tournament) => tournament.ourID == id);

    if (!tournament) {
      return res.status(404).json({
        status: 404,
        message: `Tournament with ID ${id} not found`,
      });
    }

    try {
      const response = await axios.get(
        `https://prod-cdn-public-api.livescore.com/v1/api/app/competition/${tournament.id}/leagueTable/?locale=en`
      );

      const apiData = response.data;
      const teams = apiData.Stages[0].LeagueTable.L[0].Tables[0].team;

      const competitionStatus = determineCompetitionStatus(
        teams,
        tournament.expectedMatches
      );

      const results = teams.map((team) => {
        return {
          id: team.Tid,
          name: team.Tnm,
          played: team.pld,
          points: team.pts,
          wins: team.win,
          draws: team.drw,
          losses: team.lst,
          goalsFor: team.gf,
          goalsAgainst: team.ga,
          goalDifference: team.gd,
          position: team.rnk,
        };
      });

      res.json({
        status: 200,
        tournament: {
          name: tournament.name,
          type: tournament.type,
          stage: apiData.Stages[0].Sdn,
        },
        competitionStatus: {
          status: competitionStatus,
          isActive: competitionStatus === "ongoing",
          hasStarted: competitionStatus !== "not_started",
          hasEnded: competitionStatus === "completed",
          totalMatches: tournament.expectedMatches,
          lastUpdated: new Date().toISOString(),
        },
        data: results,
      });
    } catch (error) {
      console.error("Axios error:", error?.response?.data || error);
      res.status(500).json({
        status: 500,
        message: "An error occurred",
      });
    }
  },

  // Get events by team ID
  getEvents: async (req, res) => {
    const { teamId } = req.params;

    if (!teamId) {
      return res
        .status(400)
        .json({ status: 400, message: "Team ID is required" });
    }

    try {
      const response = await axios.get(
        `https://prod-cdn-team-api.livescore.com/v1/api/app/team/${teamId}/details?locale=en`
      );

      const events = getEvents(response.data, teamId);

      res.json({
        status: 200,
        teamId,
        totalMatches: events.length,
        data: events,
      });
    } catch (error) {
      console.error("Axios error:", error?.response?.data || error);
      res.status(500).json({ status: 500, message: "An error occurred" });
    }
  },

  // Get statistics by event ID
  getStatistics: async (req, res) => {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        status: 400,
        message: "EventId not found",
      });
    }

    try {
      const response = await axios.get(
        `https://prod-cdn-public-api.livescore.com/v1/api/app/statistics/soccer/${eventId}`
      );

      const data = response.data;

      if (!data || !data.Stat) {
        return res.status(404).json({
          status: 404,
          message: "No statistics found for this event",
        });
      }

      const formattedStats = data.Stat.map((teamStats) => {
        const teamData = {};
        for (const [key, value] of Object.entries(teamStats)) {
          if (statMapping[key]) {
            teamData[statMapping[key]] = value;
          }
        }
        return {
          team: teamStats.Tnb === 1 ? "Home" : "Away",
          stats: teamData,
        };
      });

      res.json({
        status: 200,
        eventId,
        statistics: formattedStats,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Failed to fetch statistics",
        error: error.message,
      });
    }
  },

  // Get all tournaments with their current status
  getTournaments: async (req, res) => {
    try {
      const tournamentsWithStatus = await Promise.allSettled(
        tournaments.map(async (tournament) => {
          try {
            const response = await axios.get(
              `https://prod-cdn-public-api.livescore.com/v1/api/app/competition/${tournament.id}/leagueTable/?locale=en`
            );
            const teams = response.data.Stages[0].LeagueTable.L[0].Tables[0].team;
            const status = determineCompetitionStatus(
              teams,
              tournament.expectedMatches
            );

            return {
              id: tournament.ourID,
              name: tournament.name,
              type: tournament.type,
              status: status,
              isActive: status === "ongoing",
            };
          } catch (error) {
            return {
              id: tournament.ourID,
              name: tournament.name,
              type: tournament.type,
              status: "error",
              isActive: false,
            };
          }
        })
      );

      const results = tournamentsWithStatus.map((result) =>
        result.status === "fulfilled" ? result.value : result.reason
      );

      res.json({
        status: 200,
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "An error occurred",
      });
    }
  },
};

module.exports = sportsController;