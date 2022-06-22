import { createNotification } from "../../controllers/notification"
import { Notification } from "../../models/schemas/notification"
import { Strike } from "../../models/schemas/user"
import { User } from "../../models"

export function password(io: any, id: string): void {
    createNotification({
        user: id,
        type: Notification.Type.USER_INFO,
        content: "La tua password è stata cambiata."
    })
        .then(notification => io.to(id)
            .emit("user:update:password", notification), err => console.error(err))
}

export function strike(io: any, id: string): void {
    User.findOne()
        .where("_id")
        .equals(id)
        .then(user => {
            if (user) {
                createNotification({
                    user: user._id,
                    type: Notification.Type.STRIKE,
                    content: "Attenzione!! Hai già effettuato " + user.strike + " strike. " +
                        "Se raggiungi " + Strike.MAX + " strike, il tuo account verrà bloccato automaticamente.",
                    otherInfo: {
                        strike: user.strike,
                        maxStrike: Strike.MAX
                    }
                })
                    .then(notification => io.to(user._id)
                        .emit("user:strike", { notification, strike: user.strike }), err => console.error(err))
            } else console.error("user is not found")
        }, err => console.error(err))
}
