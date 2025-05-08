import mysql from "mysql2/promise";

export function connect() {
  return mysql.createConnection({
    host: "localhost",
    user: "jonathan",
    password: "abc123$",
    database: "buy-and-sell",
  });
}
