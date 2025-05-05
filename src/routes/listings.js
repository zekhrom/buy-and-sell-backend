import { notFound } from "@hapi/boom"
import { fakeListings } from "./fake-data.js"

export const getAllListingsRoute = {
  method: 'GET',
  path: '/api/listings',
  handler: async (req, res) => {
    return fakeListings
  },
}

export const getListingRoute = {
  method: 'GET',
  path: '/api/listings/{id}',
  handler: async (req, res) => {
    const { id } = req.params
    const listing = fakeListings.find((listing) => listing.id === id)
    if (!listing) {
      throw notFound(`Listing with id ${id} not found`)
    }
    return listing
  },
}