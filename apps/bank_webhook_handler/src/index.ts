import express from 'express';
import db from "@repo/db/client";

const app = express();

app.post('/hdfcWebhok', async (req, res) => {
    //Todo: Add zod validation here
    //Check if this request actually came from HDFC bank, use a webhook secret here
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_indentifier,
        amount: req.body.amount
    }
    //Update balance in db, add txn

    try {
        await db.$transaction([
            db.balance.updateMany({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                data: {
                    amount: {
                        // You can also get this from your DB
                        increment: Number(paymentInformation.amount)
                    }
                }
            }),
            db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: "Success",
                }
            })
        ]);

        res.json({
            message: "Captured"
        })
    } catch (e) {
        console.error(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }
})

app.listen(3003);