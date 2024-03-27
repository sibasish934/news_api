import { Job, Queue, Worker } from "bullmq";
import { bullConfig, redisConnection } from "../config/queue.js";
import logger from "../config/logger.js";
import { sendEmail } from "../config/mailer.js";

export const emailQueueName = "email-queue";

export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: bullConfig,
});

// workers

export const handler = new Worker(
  emailQueueName,
  async (job) => {
    console.log("the email worker data is", job.data);
    const data = job.data;
    data?.map(async (item) => {
        const payload = {
            toMail : item.toEmail,
            subject: item.subject,
            body: item.body
        }
        await sendEmail(payload.toMail, payload.subject, payload.body);
    });
  },
  { connection: redisConnection }
);

handler.on("completed", (job) => {
  logger.info({ job: job, message: "Job completed" });
  console.log(`the job ${job.id} is completed`);
});

handler.on("failed", (job) => {
  console.log(`the job ${job.id} is failed`);
});
