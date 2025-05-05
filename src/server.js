import Hapi from '@hapi/hapi';
import routes from './routes/index.js';

const start = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost',
  });

  routes.forEach((route) => {
    server.route(route);
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

start();