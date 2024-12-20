module.exports = {
    apps: [
        {
            name: 'Routers1',
            script: './server.js',
            log_date_format: 'YYYY-MM-DD HH:mm Z',
            error_file: '../../logs/routers1-errors.log',
            out_file: '../../logs/routers1-output.log',
            log_file: '../../logs/routers1-entire.log',
            restart_delay: 1000,
            autorestart: true,
        }
    ]
};