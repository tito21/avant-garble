import { AtpAgent, } from '@atproto/api'
// import { Bot, BotEventEmitter } from "@skyware/bot";

import express, { Request, Response } from 'express';
import expressWs from 'express-ws'
import cors from 'cors';

import { getNgramDataForKey, NgramData } from "./ngram.js";


async function generateText(currentGram: string, order = 3, num_letters: number | undefined = undefined): Promise<string> {
    let generated_text = currentGram;
    num_letters = num_letters || Math.floor(70 + Math.random() * 229);
    // let num_letters = 2;
    // console.log("Number of letters", num_letters);
    for (let i = 0; i < num_letters; i++) {
        let possibilities: NgramData = await getNgramDataForKey(currentGram);
        let next = "";
        if (possibilities.length > 0) {
            let index = Math.floor(Math.random() * possibilities.length);
            next = possibilities[index];
        }
        generated_text += next;
        let len = generated_text.length;
        currentGram = generated_text.slice(len - order, len);
    }
    return generated_text.slice(order, generated_text.length); // Remove the initial gram
}


const order = 3;

const app = expressWs(express()).app;
app.use(cors());
const port = parseInt(process.env.PORT!) || 8080;


app.get('/get-text', (req: Request, res: Response) => {
    let currentGram = req.query.currentGram as string;
    // console.log("Current gram", currentGram);
    generateText(currentGram, order).then((text) => {
        res.send({ "text": text });
    });
});


app.ws('/get-text', (ws, req) => {
    ws.on('message', async (msg) => {
        // console.log("Message", msg);
        let currentGram = msg.toString();
        let num_letters = Math.floor(70 + Math.random() * 229);
        // let num_letters = 5;
        for (let i = 0; i < num_letters; i++) {
            try {
            let text = await generateText(currentGram, order, 1)
            ws.send(text);
            currentGram += text;
            // console.log("text", text);
            // console.log("currentGram", currentGram);
            currentGram = currentGram.slice(currentGram.length - order, currentGram.length);
            }
            catch (error) {
                console.error("Error", error);
            }
        }
        ws.send("Done1234");
    });
});


app.get('/poll-bot', async (req: Request, res: Response) => {


    let lastHour = Date.now() - 2 * 60 * 60 * 1000;
    console.log("Last hour", lastHour);
    // const bot = new Bot();
    // await bot.login({
    //     identifier: process.env.BSKY_USERNAME!,
    //     password: process.env.BSKY_PASSWORD!,
    // });
    // let emitter = new BotEventEmitter({ "processFrom": lastHour}, bot);
    // await emitter.poll();
    // let response = console.log(emitter);
    // res.send(response);


    const agent = new AtpAgent({
        service: 'https://bsky.social',
    });

    const bluesky_url = "https://public.api.bsky.app/";
    await agent.login({ identifier: process.env.BSKY_USERNAME!, password: process.env.BSKY_PASSWORD! });
    let params = {
        "reasons": ["reply", "mention"]
    };
    agent.listNotifications(params).then((response) => {
        let notifications = response.data;
        let recentNotification = notifications["notifications"].filter((notification: any) => {
            return Date.parse(notification["record"]["createdAt"]) > lastHour
        });
        for (let notification of recentNotification) {
            console.log("Notification", notification);
            const params = new URLSearchParams();
            params.append("uris", notification["uri"]);
            const url = `${bluesky_url}xrpc/app.bsky.feed.getPosts?${params}`;
            console.log("URL", url);
            fetch(url).then((post_response) => {
                // console.log("Post response", post_response);
                post_response.json().then((data: any) => {
                    const post = data["posts"][0];
                    const text = post["record"]["text"];
                    const text_length = text.length;
                    let currentGram = text.slice(text_length - order, text_length);
                    generateText(currentGram, order).then((generated_text) => {
                        if (notification.reason === "mention") {
                            agent.post({
                                "text": generated_text,
                            })
                        }
                    });
                });
            });
            // if (notification.reason === "mention") {

            // let currentGram = text.slice(index + 1, index + order + 1);
            // generateText(currentGram, order).then((generated_text) => {
            // agent.reply(notification.id, generated_text);
            // });
            // }
            // if (notification.type === "mention") {
            //     let text = notification.text;
            //     let index = text.indexOf(" ");
            //     let currentGram = text.slice(index + 1, index + order + 1);
            //     generateText(currentGram, order).then((generated_text) => {
            //         // agent.reply(notification.id, generated_text);
            //     });
            // }
        }
        res.send(notifications);
    });
});


app.use(express.static('./client/dist'));

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});