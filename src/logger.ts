import winston from "winston";
const { format } = winston

export const logger = 
    winston.createLogger({
      level: 'debug',
      format: format.combine(
        format.timestamp(),
        format.json()
        ),
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
  logger.add(
      new winston.transports.Console({
          format: format.combine(
              format.colorize(),
              format.timestamp(),
              format.errors(),
              format.simple()
          )
      })
  )
}