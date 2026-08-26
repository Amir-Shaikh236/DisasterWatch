import { socket } from "@/socket/socket";
import { useAlerts } from "@/store/useAlerts";

export const socketListeners = () => {
    console.log('Initialize Socket.io Listeners....');

    socket.off("alert:created")
    socket.off("alert:deleted");

    socket.on("alert:created", (alert) => {
        console.log('New Alert Received: ', alert);
        useAlerts.getState().addAlert(alert);

    });

    socket.on("alert:deleted", (alertId) => {
        console.log('Alert Deleted: ', alertId);

    });

}

export const removeSocketListeners = () => {
    console.log('Removing Socket.io Listeners....');

    socket.off("alert:created");
    socket.off("alert:deleted");

}
