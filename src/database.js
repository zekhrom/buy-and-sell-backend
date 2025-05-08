import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: "localhost",
  user: "jonathan",
  password: "abc123$",
  database: "buy-and-sell",
});

export const db = {
  query: async (sql, params) => {
    try {
      const [results] = await connection.query(sql, params);
      console.log("Query executed successfully:", sql, params);
      return results;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  },
  end: () => {
    connection.end((err) => {
      if (err) {
        console.error("Error ending the database connection:", err);
        return;
      }
      console.log("Database connection closed");
    });
  },
};
