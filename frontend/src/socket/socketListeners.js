import { socket } from "@/socket/socket";
import { useAlerts } from "@/store/useAlerts";
import { useReports } from "@/store/useReports";

export const socketListeners = () => {

    {/* Alert Socket */ }
    socket.off("alert:created")
    socket.off("alert:deleted");

    socket.on("alert:created", (alert) => {
        console.log('New Alert Received: ', alert);
        useAlerts.getState().addAlert(alert);
    });

    socket.on("alert:deleted", ({ alertId }) => {
        console.log('Alert Deleted: ', alertId);
    });

    {/* Report Socket */ }

    socket.off("report:created")
    socket.off("report:deleted");

    socket.on("report:created", (report) => {
        console.log('New Report Received: ', report);
        useReports.getState().addReport(report);
    });

    socket.on("report:deleted", ({ reportId }) => {
        console.log('Report Deleted: ', reportId);
        useReports.getState().removeReport(reportId);
    });
}

export const removeSocketListeners = () => {
    console.log('Removing Socket.io Listeners....');

    socket.off("alert:created");
    socket.off("alert:deleted");

    socket.off("report:created")
    socket.off("report:deleted");

}
