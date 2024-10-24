import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'My API',
    description: 'Description',
  },
  host: `localhost:${process.env.PORT || '2000'}`,
};
const outputFile = '../../public/docs/swagger-generated.json';
const routes = ['../routes/index.js'];

swaggerAutogen()(outputFile, routes, doc);
