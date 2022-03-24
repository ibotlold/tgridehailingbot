import winston from "winston";
const { combine, timestamp, label, printf } = winston.format

export const logger = winston.createLogger({
    level: 'debug',
    format: combine(timestamp(),winston.format.json()),
    defaultMeta: {
        service: 'tgbot'
    },
    transports: [
        new winston.transports.File({
            filename: 'error.log', level: 'error'
        }),
        new winston.transports.File({
            filename: 'combined.log'
        })
    ]
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}