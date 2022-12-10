import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { converHoursString } from "./utils/convert-hours-string";
import { convertMinutesToHoursString } from "./utils/convert-minutes-to-hours-string";

const app = express();

const prisma = new PrismaClient({
  log: ["query"],
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  return res.json({ mgs: "teste" });
});

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          Ad: true,
        },
      },
    },
  });

  return res.json(games);
});

app.get("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;

  const ads = await prisma.ad.findMany({
    where: {
      gameId,
    },
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(","),
        hourStart: convertMinutesToHoursString(ad.hourStart),
        hourEnd: convertMinutesToHoursString(ad.hourEnd),
      };
    })
  );
});

app.get("/ads/:id/discord", async (req, res) => {
  const adId = req.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    where: {
      id: adId,
    },
    select: {
      discord: true,
    },
  });

  return res.json({ discord: ad.discord });
});

app.post("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;

  const body: any = req.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      weekDays: body.weekDays.join(","),
      useVoiceChannel: body.useVoiceChannel,
      hourStart: converHoursString(body.hourStart),
      hourEnd: converHoursString(body.hourEnd),
      discord: body.discord,
      yearsPlaying: body.yearsPlaying,
    },
  });

  return res.status(201).json(ad);
});

app.listen(3333, () => {
  console.log("Listening http://localhost:3333/");
});
