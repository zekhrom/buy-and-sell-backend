import { notFound } from "@hapi/boom";
import { db } from "../database.js";
import admin from "firebase-admin";

export const getAllListingsRoute = {
  method: "GET",
  path: "/api/listings",
  handler: async (req, res) => {
    const results = await db.query("SELECT * FROM listings", null);
    if (!results) {
      throw notFound("No listings found");
    }
    return results;
  },
};

export const getListingRoute = {
  method: "GET",
  path: "/api/listings/{id}",
  handler: async (req, res) => {
    const { id } = req.params;
    const [listing] = await db.query("SELECT * FROM listings WHERE id = ?", [
      id,
    ]);
    if (!listing) {
      throw notFound(`Listing with id ${id} not found`);
    }
    return listing;
  },
};

export const addViewToListingRoute = {
  method: "POST",
  path: "/api/listings/{id}/view",
  handler: async (req, res) => {
    const { id } = req.params;
    const [listing] = await db.query("SELECT * FROM listings WHERE id = ?", [
      id,
    ]);
    if (!listing) {
      throw notFound(`Listing with id ${id} not found`);
    }
    await db.query("UPDATE listings SET views = views + 1 WHERE id = ?", [id]);
    const [updatedListing] = await db.query(
      "SELECT * FROM listings WHERE id = ?",
      [id],
    );
    return updatedListing;
  },
};

export const getUserListingsRoute = {
  method: "GET",
  path: "/api/user/{userId}/listings",
  handler: async (req, res) => {
    const { userId } = req.params;
    const { authtoken } = req.headers;
    try {
      if (!authtoken) {
        throw notFound("No auth token provided");
      }
      const decodedToken = await admin.auth().verifyIdToken(authtoken);

      if (decodedToken.uid !== userId) {
        console.log('decodedToken', decodedToken.uid);
        throw notFound(`User with id ${userId} not found`);
      }
      const results = await db.query("SELECT * FROM listings WHERE user_id = ?", [
        userId,
      ]);
      if (!results) {
        throw notFound(`No listings found for user with id ${userId}`);
      }
      return results;
    }
    catch (error) {
      console.error("Error verifying token:", error);
      throw notFound(`User with id ${userId} not found`);
    }
  },
};

export const addListingRoute = {
  method: "POST",
  path: "/api/listings",
  handler: async (req, res) => {
    const { name, description, price = 0 } = req.payload;
    const { authtoken } = req.headers;
    if (!authtoken) {
      throw notFound("No auth token provided");
    }
    const { uid } = await admin.auth().verifyIdToken(authtoken);
    const newListing = await db.query(
      "INSERT INTO listings (name, description, price, user_id, views) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, uid, 0],
    );
    return {
      id: newListing.insertId,
      name,
      description,
      price,
      user_id: uid,
      views: 0,
    };
  },
};

export const updateListingRoute = {
  method: "PUT",
  path: "/api/listings/{id}",
  handler: async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.payload;
    const { authtoken } = req.headers;
    if (!authtoken) {
      throw notFound("No auth token provided");
    }
    const { uid } = await admin.auth().verifyIdToken(authtoken);
    const [listing] = await db.query("SELECT * FROM listings WHERE id = ? AND user_id = ?", [
      id,
      uid,
    ]);
    if (!listing) {
      throw notFound(`Listing with id ${id} not found`);
    }
    await db.query(
      "UPDATE listings SET name = ?, description = ?, price = ? WHERE id = ?",
      [name, description, price, id],
    );
    const [updatedListing] = await db.query(
      "SELECT * FROM listings WHERE id = ?",
      [id],
    );
    return updatedListing;
  },
};

export const deleteListingRoute = {
  method: "DELETE",
  path: "/api/listings/{id}",
  handler: async (req, res) => {
    const { id } = req.params;
    const { authtoken } = req.headers;
    if (!authtoken) {
      throw notFound("No auth token provided");
    }
    const { uid } = await admin.auth().verifyIdToken(authtoken);
    const [listing] = await db.query("SELECT * FROM listings WHERE id = ? AND user_id = ?", [
      id,
      uid,
    ]);
    if (!listing) {
      throw notFound(`Listing with id ${id} not found for the user with id ${uid}`);
    }
    await db.query("DELETE FROM listings WHERE id = ? AND user_id = ?", [id, uid]);
    return { message: `Listing for ${listing.name} deleted!` };
  },
};
