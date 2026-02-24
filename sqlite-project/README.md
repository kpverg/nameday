# SQLite Project

This project is a simple application that utilizes an SQLite3 database to manage data through three defined tables. Below are the details for setting up and using the application.

## Project Structure

```
sqlite-project
├── data
│   └── AppData.db        # SQLite3 database file
├── src
│   └── index.js          # Entry point of the application
├── package.json           # npm configuration file
└── README.md              # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd sqlite-project
   ```

2. **Install dependencies**:
   Make sure you have Node.js installed. Then run:
   ```
   npm install
   ```

3. **Database Initialization**:
   The application will automatically create the SQLite3 database and the necessary tables when you run the application for the first time.

## Usage

To start the application, run:
```
node src/index.js
```

This will connect to the SQLite3 database and ensure that the three tables are created if they do not already exist. You can then implement additional functionality to interact with the database as needed.

## License

This project is licensed under the MIT License.