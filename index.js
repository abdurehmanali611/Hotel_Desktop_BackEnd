const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const cors = require("cors");
const { PrismaClient } = require("./generated/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_Secret = process.env.JWT_Secret;

const typeDefs = gql`
  type User {
    id: Int!
    username: String!
    password: String!
    hotelName: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Item {
    id: Int!
    name: String!
    price: Float!
    hotelName: String!
    category: String!
    imageUrl: String!
    createdAt: String!
  }

  type Order {
    id: Int!
    title: String!
    imageUrl: String!
    tableNo: Int!
    hotelName: String!
    orderAmount: Int!
    category: String!
    price: Float!
    waiterName: String!
    status: String
    payment: String
    createdAt: Float!
  }

  type Query {
    users(hotelName: String): [User!]!
    items(hotelName: String): [Item!]!
    orders(hotelName: String): [Order!]!
    me: User
  }

  type Mutation {
    Login(username: String!, password: String!): AuthPayload!
    CreateCredential(username: String!, password: String!, role: String!, hotelName: String!): User!
    CreateItem(
      name: String!
      price: Float!
      hotelName: String!
      category: String!
      imageUrl: String!
    ): Item!
    OrderCreation(
      title: String!
      imageUrl: String!
      tableNo: Int!
      waiterName: String!
      orderAmount: Int!
      status: String
      hotelName: String!
      payment: String
      category: String!
      price: Float!
    ): Order!
    UpdatePayment(id: Int!, payment: String): Order!
    DeleteItem(id: Int!): Item!
    UpdateItem(
      id: Int!
      name: String!
      category: String!
      price: Float!
      imageUrl: String!
      hotelName: String!
    ): Item!
    UpdateStatus(id: Int!, status: String): Order!
  }
`;

const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  try {
    return jwt.verify(token, JWT_Secret);
  } catch (error) {
    return null;
  }
};

const resolvers = {
  Query: {
    users: async (_, {hotelName}, context) => {
      if(!context.user) throw new Error("Not Authenticated");
      return await prisma.user.findMany({
        where: {hotelName: hotelName}
      });
    },
    items: async (_, {hotelName}, context) => {
      if(!context.user) throw new Error("Not Authenticated");
      return await prisma.item.findMany({
        where: {hotelName: hotelName}
      });
    },
    orders: async (_, {hotelName}, context) => {
      if(!context.user) throw new Error("Not Authenticated");
      return await prisma.order.findMany({
        where: {hotelName: hotelName}
      });
    },
    me: async (_, __, context ) => {
      if (!context.user) throw new Error("Not Authenticated");
      return await prisma.user.findUnique({
        where: { id: context.user.userId },
        select: { id: true, username: true, role: true, hotelName: true }
      });
    },
  },
  Mutation: {
    Login: async (_, { username, password }) => {
      const user = await prisma.user.findUnique({
        where: { username: username },
      });
      if (!user) throw new Error("No user found in this Email");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid Password");
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role, hotelName: user.hotelName },
        JWT_Secret,
        { expiresIn: "1d" }
      );
      return {
        token, user: {
            id: user.id,
            username: user.username,
            role: user.role,
            hotelName: user.hotelName
        }
      }
    },
    CreateCredential: async (_, { username, password, role, hotelName }) => {

        const existingUser = await prisma.user.findUnique({where: {username}})
        if (existingUser) throw new Error("User already Exists")
        const hashedPassword = await bcrypt.hash(password, 12)
      return await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          hotelName,
          role,
        }
      });
    },
    CreateItem: async (_, { name, price, category, imageUrl, hotelName }, context) => {
      if (!context.user) throw new Error("Not Authenticated");
      return await prisma.item.create({
        data: {
          name,
          price,
          category,
          imageUrl,
          hotelName
        },
      });
    },
    OrderCreation: async (
      _,
      { title, imageUrl, tableNo, waiterName, status, payment, category, price, hotelName, orderAmount }, context
    ) => {
      if (!context.user) throw new Error("Not Authenticated");
      return await prisma.order.create({
        data: {
          title,
          imageUrl,
          tableNo,
          waiterName,
          orderAmount,
          status,
          hotelName,
          payment,
          category,
          price,
        },
      });
    },
    UpdatePayment: async (_, { id, payment }, context) => {
      if (!context.user) throw new Error("Not Authenticated");
      return await prisma.order.update({
        where: { id: id },
        data: { payment: payment },
      });
    },
    DeleteItem: async (_, { id }, context) => {
      if (!context.user) throw new Error("Not Authenticated");
      return await prisma.item.delete({
        where: { id: id },
      });
    },
    UpdateItem: async (_, { id, name, category, price, imageUrl, hotelName }, context) => {
      if (!context.user) throw new Error("Not Authenticated");
      return await prisma.item.update({
        where: { id: id },
        data: {
          name,
          category,
          price,
          imageUrl,
          hotelName
        },
      });
    },
    UpdateStatus: async (_, { id, status }, context) => {
      if (!context.user) throw new Error("Not Authenticated");
      return await prisma.order.update({
        where: { id: id },
        data: {
          status: status,
        },
      });
    },
  },
};

async function startServer() {
  const app = express();
  app.use(cors());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        const user = authenticate(req)
        return {user, prisma}
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const port = 4000;
  app.listen(port, () => {
    console.log(`server ready at http://localhost:${port}/graphql`);
  });
}

startServer();
