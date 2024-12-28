const HttpError = require('../../utils/httpError');
const Errors = require('../../const/errors');

const net = require('net')

const readyPlayers = []

function createMessage(sender, receiver, messageType, payload) {
    const version = '1';
    return Buffer.from(`${version}|${sender}|${receiver}|${messageType}|${payload}`);
}

const addReadyPlayer = async (req, res, next) => {
    const { ip, socket, routerSocket} = req.body;

    try {
        console.log(readyPlayers);
        
        let player = {}
        player['ip'] = ip
        player['socket'] = socket
        player['router_socket'] = routerSocket

        readyPlayers.push(player)

        res.status(201).json({
            status: 'success',
            result: readyPlayers
        });
    }
    catch (err) {
        console.log(err);
        
        return next(new HttpError(Errors.Something_Went_Wrong, err));
    }
};

const requestPlaying = async (req, res, next) => {
    const { ip, socket} = req.body;

    try {

        let foundedPlayer;
        for (let player of readyPlayers) {
            if (player.ip == ip && player.socket == socket)
            {
                const client = net.createConnection({ host: player.ip, port: player.router_socket }, () => {
                    const message = `Do you want to play with player (${player.ip} , ${player.socket})`
                    const serverMessage = createMessage('server', 'client', 'server_response', message);
                    client.write(serverMessage);
                    client.closed()
            });
            }
        }

        res.status(201).json({
            status: 'success'
        });
    } catch (err) {
        return next(new HttpError(Errors.Something_Went_Wrong, err));
    }
};


// Get all contents
const confirmPlaying = async (req, res, next) => {
    const { ip, socket } = req.body;

    try {

        let foundedPlayer;
        for (let player of readyPlayers) {
            if (player.ip == ip && player.socket == socket)
            {
                const client = net.createConnection({ host: player.ip, port: player.router_socket }, () => {
                    const message = `Confirmed Playing with (${player.ip} , ${player.socket})`
                    const serverMessage = createMessage('server', 'client', 'server_response', message);
                    client.write(serverMessage);
                    client.closed()
            });
            }
        }

        res.status(201).json({
            status: 'success'
        });
    } catch (err) {
        return next(new HttpError(Errors.Something_Went_Wrong, err));
    }
};

const getVideoById = async (req, res, next) => {

    try {

    } catch (err) {
        return next(new HttpError(Errors.Something_Went_Wrong, err));
    }
};

const updateVideoById = async (req, res, next) => {

    try {

    } catch (err) {
        return next(new HttpError(Errors.Something_Went_Wrong, err));
    }
};

const deleteVideoById = async (req, res, next) => {

    try {

    } catch (err) {
        return next(new HttpError(Errors.Something_Went_Wrong, err));
    }
};


const undeleteVideoById = async (req, res, next) => {

    try {

    } catch (err) {
        return next(new HttpError(Errors.Something_Went_Wrong, err));
    }
};
module.exports = {
    addReadyPlayer,
    requestPlaying,
    confirmPlaying
};
