# Sports Data API

A RESTful API built with Node.js and Express that provides real-time football/soccer data including tournament standings, team events, match statistics, and more. The API fetches data from LiveScore and provides a clean, structured interface for accessing sports information.

## Features

- 🏆 Tournament standings and league tables
- ⚽ Team match events and results
- 📊 Detailed match statistics
- 🔄 Real-time competition status tracking
- 🎯 Live match detection
- 📈 Tournament progress monitoring

## Supported Competitions

- **Champions League** (Cup format)
- **Europa League** (Cup format)
- **Premier League** (English top division)
- **Bundesliga** (German top division)
- **Brasileirão** (Brazilian top division)
- **La Liga** (Spanish top division)
- **Serie A Tim** (Italian top division)
- **Championship** (English second division)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/A-Y-A-N-O-K-O-J-I/sports-data-api.git
cd sports-data-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Health Check
```http
GET /
```
Returns API status and basic information.

**Response:**
```json
{
  "status": "API is running",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Get All Tournaments
```http
GET /api/v1/tournaments
```
Retrieve all supported tournaments with their current status.

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "name": "Champions League",
      "type": "cup",
      "status": "ongoing",
      "isActive": true
    }
  ]
}
```

### Get Tournament Standings
```http
GET /api/v1/standings/:id
```
Get league table/standings for a specific tournament.

**Parameters:**
- `id` (required) - Tournament ID (1-8)

**Tournament IDs:**
- `1` - Champions League
- `2` - Europa League
- `3` - Premier League
- `4` - Bundesliga
- `5` - Brasileirão
- `6` - La Liga
- `7` - Serie A Tim
- `8` - Championship

**Response:**
```json
{
  "status": 200,
  "tournament": {
    "name": "Premier League",
    "type": "league",
    "stage": "Regular Season"
  },
  "competitionStatus": {
    "status": "ongoing",
    "isActive": true,
    "hasStarted": true,
    "hasEnded": false,
    "totalMatches": 38,
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  },
  "data": [
    {
      "id": 12345,
      "name": "Manchester City",
      "played": 15,
      "points": 42,
      "wins": 13,
      "draws": 3,
      "losses": 0,
      "goalsFor": 35,
      "goalsAgainst": 8,
      "goalDifference": 27,
      "position": 1
    }
  ]
}
```

### Get Team Events
```http
GET /api/v1/events/:teamId
```
Retrieve all matches (completed and live) for a specific team.

**Parameters:**
- `teamId` (required) - Team ID from LiveScore

**Response:**
```json
{
  "status": 200,
  "teamId": "12345",
  "totalMatches": 15,
  "data": [
    {
      "id": "67890",
      "tournament": "Premier League",
      "tournamentColors": {
        "primary": "#38003c",
        "badge": "https://example.com/badge.png"
      },
      "day": "2024-01-15",
      "homeTeam": "Manchester City",
      "homeScore": 2,
      "awayTeam": "Liverpool",
      "awayScore": 1,
      "status": "FT",
      "matchResult": "win",
      "isLive": false
    }
  ]
}
```

### Get Match Statistics
```http
GET /api/v1/statistics/:eventId
```
Get detailed statistics for a specific match.

**Parameters:**
- `eventId` (required) - Match/Event ID

**Response:**
```json
{
  "status": 200,
  "eventId": "67890",
  "statistics": [
    {
      "team": "Home",
      "stats": {
        "Possession": "65%",
        "Shots on target": "8",
        "Shots off target": "4",
        "Corner kicks": "7",
        "Fouls": "12",
        "Yellow cards": "2",
        "Red cards": "0"
      }
    },
    {
      "team": "Away",
      "stats": {
        "Possession": "35%",
        "Shots on target": "3",
        "Shots off target": "2",
        "Corner kicks": "3",
        "Fouls": "15",
        "Yellow cards": "3",
        "Red cards": "1"
      }
    }
  ]
}
```

## Competition Status Types

- `not_started` - Competition hasn't begun yet
- `ongoing` - Competition is currently active
- `completed` - Competition has finished
- `error` - Unable to determine status
- `unknown` - Status cannot be determined

## Match Status Types

- `FT` - Full Time (finished)
- `AET` - After Extra Time (finished)
- `AP` - After Penalties (finished)
- `HT` - Half Time (live)
- `45'`, `67'`, etc. - Live match with current minute
- `isLive: true` - Indicates if match is currently being played

## Error Handling

The API returns consistent error responses:

```json
{
  "status": 400,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing parameters)
- `404` - Not Found (tournament/event not found)
- `500` - Internal Server Error

## Project Structure

```
├── controllers/
│   └── sportsController.js    # Business logic and API handlers
├── routes/
│   └── sportsRoutes.js       # Route definitions
├── server.js                 # Main application entry point
├── package.json
├── .env
└── README.md
```

## Dependencies

- **express** - Web framework
- **axios** - HTTP client for API requests
- **dotenv** - Environment variable management

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. The API will restart automatically when files change.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Rate Limiting

The API uses external LiveScore endpoints which may have their own rate limiting. Be mindful of request frequency to avoid being blocked.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This API fetches data from LiveScore's public endpoints. Please ensure you comply with their terms of service and use this responsibly. This project is for educational and personal use only.