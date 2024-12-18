const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation,
} = require("./db");

const express = require("express");
const app = express();
app.use(express.json());

// Routes

// GET /api/customers
app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurants
app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (err) {
    next(err);
  }
});

// GET /api/reservations
app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (err) {
    next(err);
  }
});

// POST /api/customers/:id/reservations
app.post("/api/customers/:id/reservations", async (req, res, next) => {
  try {
    const { id: customer_id } = req.params;
    const { restaurant_id, date, party_count } = req.body;
    const reservation = await createReservation({
      customer_id,
      restaurant_id,
      date,
      party_count,
    });
    res.status(201).send(reservation);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/customers/:customer_id/reservations/:id
app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      const { customer_id, id } = req.params;
      await destroyReservation({ customer_id, id });
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ error: err.message });
});

// Init function
const init = async () => {
  console.log("Connecting to database...");
  try {
    await client.connect();
    console.log("Connected to database!");
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1);
  }

  try {
    await createTables();
    console.log("Tables created!");
  } catch (err) {
    console.error("Failed to create tables:", err.message);
    process.exit(1);
  }

  try {
    const [alexis, erick, kelsey, esti] = await Promise.all([
      createCustomer({ name: "Alexis" }),
      createCustomer({ name: "Erick" }),
      createCustomer({ name: "Kelsey" }),
      createCustomer({ name: "Esti" }),
    ]);

    const [mcdonalds, pizzaHut, burgerKing, chickFillA] = await Promise.all([
      createRestaurant({ name: "McDonalds" }),
      createRestaurant({ name: "Pizza Hut" }),
      createRestaurant({ name: "Burger King" }),
      createRestaurant({ name: "Chick-fil-A" }),
    ]);

    console.log("Customers: ", await fetchCustomers());
    console.log("Restaurants: ", await fetchRestaurants());

    const [reservation1] = await Promise.all([
      createReservation({
        date: "2024-12-25",
        party_count: 4,
        restaurant_id: mcdonalds.id,
        customer_id: alexis.id,
      }),
    ]);

    console.log("Reservations: ", await fetchReservations());
  } catch (err) {
    console.error("Failed to seed database:", err.message);
    process.exit(1);
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server is running on port ${port}`));
};

init();
